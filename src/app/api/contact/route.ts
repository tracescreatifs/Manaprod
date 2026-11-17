import { connection } from "next/server";
import { acknowledgementEmail, notificationEmail } from "@/lib/contact/emails";
import { clientIp, hashIp } from "@/lib/contact/ip-hash";
import { PURGE_AFTER_MS, RATE_WINDOW_MS, isRateLimited } from "@/lib/contact/rate-limit";
import { composeRequest, isHoneypotFilled, parseContact, type ContactErrors } from "@/lib/contact/schema";
import { getSiteSettings } from "@/lib/data/settings";
import { getMailer } from "@/lib/email";
import { createServiceClient, ipHashKey } from "@/lib/supabase/service";

// Réception du formulaire de contact (cahier 6.7). Ordre : validation, champ
// piège, limitation des envois, enregistrement, notification, accusé de
// réception. Réponses JSON pour l'envoi en JavaScript, redirection 303 vers
// /contact pour l'envoi classique sans JavaScript.

const MAX_BODY_BYTES = 32_000;

type Outcome =
  | { status: 200; anchor: "demande-envoyee" }
  | { status: 400; anchor: "demande-incomplete"; errors: ContactErrors }
  | { status: 413 | 415; anchor: "demande-incomplete"; message: string }
  | { status: 429; anchor: "demande-limite"; message: string }
  | { status: 500; anchor: "demande-erreur"; message: string };

const LIMIT_MESSAGE =
  "Vous avez déjà envoyé plusieurs demandes dans l’heure. Merci de réessayer plus tard, ou de nous appeler directement.";
const SERVER_MESSAGE =
  "Votre demande n’a pas pu être enregistrée. Merci de réessayer, ou de nous contacter directement par téléphone ou par email.";

// Corps de la requête, limité à MAX_BODY_BYTES même sans en-tête
// content-length. JSON (envoi en JavaScript) ou formulaire classique.
async function readBody(
  request: Request,
): Promise<Record<string, unknown> | "trop-long" | "format"> {
  const declared = Number(request.headers.get("content-length") ?? 0);
  if (declared > MAX_BODY_BYTES) return "trop-long";
  const raw = await request.text();
  if (new TextEncoder().encode(raw).length > MAX_BODY_BYTES) return "trop-long";

  const type = request.headers.get("content-type") ?? "";
  if (type.includes("application/json")) {
    try {
      const json: unknown = JSON.parse(raw);
      return json && typeof json === "object" && !Array.isArray(json)
        ? (json as Record<string, unknown>)
        : {};
    } catch {
      return {};
    }
  }
  if (type.includes("application/x-www-form-urlencoded")) {
    return Object.fromEntries(new URLSearchParams(raw));
  }
  return "format";
}

async function handle(request: Request): Promise<Outcome> {
  const body = await readBody(request);
  if (body === "trop-long") {
    return { status: 413, anchor: "demande-incomplete", message: "Votre message est trop long." };
  }
  if (body === "format") {
    return { status: 415, anchor: "demande-incomplete", message: "Format d’envoi non pris en charge." };
  }

  // a. Validation serveur (fait foi).
  const parsed = parseContact(body);
  if (!parsed.ok) return { status: 400, anchor: "demande-incomplete", errors: parsed.errors };
  const data = parsed.data;

  // b. Champ piège rempli : succès apparent, rien n'est enregistré ni envoyé.
  if (isHoneypotFilled(body)) return { status: 200, anchor: "demande-envoyee" };

  let supabase: ReturnType<typeof createServiceClient>;
  try {
    supabase = createServiceClient();
  } catch (error) {
    console.error(`[MANA PROD] Contact : ${(error as Error).message}`);
    return { status: 500, anchor: "demande-erreur", message: SERVER_MESSAGE };
  }

  // c. Limitation : au plus 5 envois par empreinte d'IP sur une heure glissante (D66).
  const ipHash = hashIp(clientIp(request.headers), ipHashKey());
  const since = new Date(Date.now() - RATE_WINDOW_MS).toISOString();
  const { count, error: countError } = await supabase
    .from("contact_submissions")
    .select("id", { count: "exact", head: true })
    .eq("ip_hash", ipHash)
    .gte("created_at", since);
  if (countError) {
    console.error(`[MANA PROD] Contact : lecture des envois récents impossible (${countError.message}).`);
    return { status: 500, anchor: "demande-erreur", message: SERVER_MESSAGE };
  }
  if (isRateLimited(count ?? 0)) {
    return { status: 429, anchor: "demande-limite", message: LIMIT_MESSAGE };
  }

  const { error: submissionError } = await supabase
    .from("contact_submissions")
    .insert({ ip_hash: ipHash });
  if (submissionError) {
    console.error(`[MANA PROD] Contact : enregistrement de l'envoi impossible (${submissionError.message}).`);
    return { status: 500, anchor: "demande-erreur", message: SERVER_MESSAGE };
  }
  const purgeBefore = new Date(Date.now() - PURGE_AFTER_MS).toISOString();
  const { error: purgeError } = await supabase
    .from("contact_submissions")
    .delete()
    .lt("created_at", purgeBefore);
  if (purgeError) {
    console.error(`[MANA PROD] Contact : purge des envois anciens impossible (${purgeError.message}).`);
  }

  // d. Enregistrement du message (réponses complémentaires en tête, D101).
  const stored = composeRequest(data);
  const { error: insertError } = await supabase.from("contact_messages").insert({
    name: data.name,
    organization: data.organization ?? null,
    email: data.email,
    project_type: data.projectType ?? null,
    desired_date: stored.desiredDate ?? null,
    message: stored.message,
  });
  if (insertError) {
    console.error(`[MANA PROD] Contact : enregistrement du message impossible (${insertError.message}).`);
    return { status: 500, anchor: "demande-erreur", message: SERVER_MESSAGE };
  }

  // e et f. Emails : un échec n'annule pas l'envoi (le message est en base),
  // il est consigné dans les logs sans données personnelles.
  await sendEmails(data);

  return { status: 200, anchor: "demande-envoyee" };
}

async function sendEmails(data: Parameters<typeof notificationEmail>[0]) {
  let mailer: ReturnType<typeof getMailer>;
  try {
    mailer = getMailer();
  } catch (error) {
    console.error(`[MANA PROD] Contact : emails non envoyés, ${(error as Error).message}`);
    return;
  }

  const notification = notificationEmail(data);
  const sent = await mailer.resend.emails.send({
    from: mailer.from,
    to: mailer.to,
    replyTo: data.email,
    subject: notification.subject,
    html: notification.html,
    text: notification.text,
  });
  if (sent.error) {
    console.error(`[MANA PROD] Contact : notification non envoyée (${sent.error.name} : ${sent.error.message}).`);
  }

  let settings = null;
  try {
    settings = await getSiteSettings();
  } catch (error) {
    console.error(`[MANA PROD] Contact : réglages illisibles pour l'accusé de réception (${(error as Error).message}).`);
  }
  const acknowledgement = acknowledgementEmail({
    name: data.name,
    replyPromise: settings?.reply_promise?.trim() || null,
    phone: settings?.phone?.trim() || null,
  });
  const ack = await mailer.resend.emails.send({
    from: mailer.from,
    to: data.email,
    replyTo: mailer.to,
    subject: acknowledgement.subject,
    html: acknowledgement.html,
    text: acknowledgement.text,
  });
  if (ack.error) {
    console.error(`[MANA PROD] Contact : accusé de réception non envoyé (${ack.error.name} : ${ack.error.message}).`);
  }
}

export async function POST(request: Request) {
  await connection();
  const wantsJson = (request.headers.get("content-type") ?? "").includes("application/json");

  let outcome: Outcome;
  try {
    outcome = await handle(request);
  } catch (error) {
    console.error(`[MANA PROD] Contact : erreur inattendue (${(error as Error).message}).`);
    outcome = { status: 500, anchor: "demande-erreur", message: SERVER_MESSAGE };
  }

  if (!wantsJson) {
    // Envoi sans JavaScript : retour à la page Contact, message ciblé par l'ancre.
    const url = new URL(outcome.status === 200 ? "/contact?envoye=1" : "/contact", request.url);
    url.hash = outcome.anchor;
    return Response.redirect(url, 303);
  }

  const payload =
    "errors" in outcome
      ? { errors: outcome.errors }
      : "message" in outcome
        ? { message: outcome.message }
        : {};
  return Response.json(
    { ok: outcome.status === 200, ...payload },
    { status: outcome.status, headers: { "Cache-Control": "no-store" } },
  );
}
