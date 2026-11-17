import { createHash, timingSafeEqual } from "node:crypto";
import { connection } from "next/server";
import { missingVariableError } from "@/lib/env";
import { retentionCutoff } from "@/lib/contact/retention";
import { createServiceClient } from "@/lib/supabase/service";

// Maintien de la base active (cahier 3, décision D08) : appelée par Vercel Cron
// tous les 6 jours, avec l'en-tête Authorization: Bearer CRON_SECRET.
// Elle efface aussi les messages de contact reçus il y a plus de 24 mois
// (mentions légales, P11, D87), avec la clé service (seul usage hors
// /api/contact). Jamais mise en cache ; la réponse et les logs ne contiennent
// que le nombre de messages effacés, aucune donnée personnelle.

// Comparaison à temps constant : les empreintes ont toujours la même longueur.
function sameSecret(received: string, expected: string): boolean {
  const a = createHash("sha256").update(received).digest();
  const b = createHash("sha256").update(expected).digest();
  return timingSafeEqual(a, b);
}

export async function GET(request: Request) {
  await connection();

  const secret = process.env.CRON_SECRET;
  if (!secret) {
    return Response.json(
      { ok: false, error: missingVariableError("CRON_SECRET").message },
      { status: 500 },
    );
  }

  const authorization = request.headers.get("authorization") ?? "";
  if (!sameSecret(authorization, `Bearer ${secret}`)) {
    return new Response(null, { status: 401 });
  }

  // Une requête réelle maintient la base active : l'effacement en est une.
  let supabase: ReturnType<typeof createServiceClient>;
  try {
    supabase = createServiceClient();
  } catch (error) {
    // Variable absente : message clair, sans détail de la base.
    return Response.json({ ok: false, error: (error as Error).message }, { status: 500 });
  }
  const cutoff = retentionCutoff(new Date());
  const { error, count } = await supabase
    .from("contact_messages")
    .delete({ count: "exact" })
    .lt("created_at", cutoff.toISOString());
  if (error) {
    console.error(`[MANA PROD] Keepalive : effacement des anciens messages impossible (${error.message}).`);
    return Response.json(
      { ok: false, error: "Accès à la base impossible, voir les logs." },
      { status: 500 },
    );
  }

  const deleted = count ?? 0;
  if (deleted > 0) console.info(`[MANA PROD] Keepalive : ${deleted} message(s) de plus de 24 mois effacé(s).`);
  return Response.json({ ok: true, deleted });
}
