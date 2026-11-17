"use server";

import { updateTag } from "next/cache";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { failure, success, type ActionState } from "@/lib/admin/action-state";
import { LOGIN_PATH, requireAdmin } from "@/lib/admin/auth";
import {
  forgotPasswordSchema,
  loginSchema,
  newPasswordSchema,
  settingsSchema,
  showreelSchema,
  validate,
} from "@/lib/admin/schemas";
import { CACHE_TAGS } from "@/lib/data/tags";
import { getSiteUrl } from "@/lib/env";
import { createClient } from "@/lib/supabase/server";
import type { Database } from "@/types/database";

// Server Actions du dashboard (cahier 7). Chaque action protégée appelle
// requireAdmin() ; toutes les écritures passent par le client à cookies
// (RLS is_admin), jamais par la clé service.

const FIX_FIELDS = "Certains champs sont à corriger.";
const SAVE_FAILED = "L’enregistrement a échoué. Réessayez dans un instant.";

function text(form: FormData, key: string): string {
  const value = form.get(key);
  return typeof value === "string" ? value : "";
}

// ---------------------------------------------------------------------
// Connexion, déconnexion, mots de passe
// ---------------------------------------------------------------------

export async function login(_: ActionState, form: FormData): Promise<ActionState> {
  const parsed = validate(loginSchema, { email: text(form, "email"), password: text(form, "password") });
  if (!parsed.ok) return failure(FIX_FIELDS, parsed.errors);

  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithPassword(parsed.data);
  // Message unique : aucune indication sur l'existence du compte.
  if (error) return failure("Email ou mot de passe incorrect");

  const { data: isAdmin, error: adminError } = await supabase.rpc("is_admin");
  if (adminError || isAdmin !== true) {
    await supabase.auth.signOut();
    return failure("Accès réservé aux administrateurs");
  }
  redirect("/admin/showreel");
}

export async function logout(): Promise<void> {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect(`${LOGIN_PATH}?deconnecte=1`);
}

/**
 * Origine du site pour le lien de l'email : NEXT_PUBLIC_SITE_URL en priorité
 * (jamais un en-tête de la requête), sinon le déploiement en cours.
 */
async function siteOrigin(): Promise<string> {
  const site = getSiteUrl();
  if (site) return site.origin;
  const h = await headers();
  const host = h.get("x-forwarded-host") ?? h.get("host");
  const proto = h.get("x-forwarded-proto") ?? "https";
  return host ? `${proto}://${host}` : "";
}

export async function requestPasswordReset(_: ActionState, form: FormData): Promise<ActionState> {
  const parsed = validate(forgotPasswordSchema, { email: text(form, "email") });
  if (!parsed.ok) return failure(FIX_FIELDS, parsed.errors);

  const supabase = await createClient();
  const { error } = await supabase.auth.resetPasswordForEmail(parsed.data.email, {
    redirectTo: `${await siteOrigin()}/admin/confirmer`,
  });
  // Erreur consignée sans l'adresse saisie.
  if (error) console.error(`[MANA PROD] Mot de passe oublié : envoi impossible (${error.message}).`);
  // Réponse toujours identique, que le compte existe ou non.
  return success("Si un compte existe pour cette adresse, un email vient d’être envoyé.");
}

function passwordErrorMessage(message: string): string {
  if (/different from the old password/i.test(message)) {
    return "Le nouveau mot de passe doit être différent de l’ancien.";
  }
  if (/weak|pwned|leaked/i.test(message)) {
    return "Ce mot de passe est trop faible ou trop connu. Choisissez-en un autre.";
  }
  return "Le mot de passe n’a pas pu être modifié. Réessayez.";
}

/** Nouveau mot de passe après le lien de réinitialisation (session de récupération). */
export async function setNewPassword(_: ActionState, form: FormData): Promise<ActionState> {
  const parsed = validate(newPasswordSchema, {
    password: text(form, "password"),
    confirmation: text(form, "confirmation"),
  });
  if (!parsed.ok) return failure(FIX_FIELDS, parsed.errors);

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/admin/mot-de-passe-oublie?lien=expire");

  const { error } = await supabase.auth.updateUser({ password: parsed.data.password });
  if (error) return failure(passwordErrorMessage(error.message));
  redirect("/admin/showreel?notification=mot-de-passe");
}

/** Changement du mot de passe depuis l'onglet Réglages (cahier 7.5). */
export async function changePassword(_: ActionState, form: FormData): Promise<ActionState> {
  const { supabase } = await requireAdmin();
  const parsed = validate(newPasswordSchema, {
    password: text(form, "password"),
    confirmation: text(form, "confirmation"),
  });
  if (!parsed.ok) return failure(FIX_FIELDS, parsed.errors);

  const { error } = await supabase.auth.updateUser({ password: parsed.data.password });
  if (error) return failure(passwordErrorMessage(error.message));
  return success("Mot de passe modifié.");
}

// ---------------------------------------------------------------------
// Showreel (cahier 7.1) et réglages (cahier 7.5)
// ---------------------------------------------------------------------

type SettingsUpdate = Database["public"]["Tables"]["site_settings"]["Update"];

/** Met à jour la ligne unique de site_settings, puis publie (updateTag). */
async function updateSettings(values: SettingsUpdate): Promise<string | null> {
  const { supabase } = await requireAdmin();
  const { data, error } = await supabase
    .from("site_settings")
    .update(values)
    .eq("id", 1)
    .select("id");
  if (error) {
    console.error(`[MANA PROD] Dashboard : enregistrement des réglages impossible (${error.message}).`);
    return SAVE_FAILED;
  }
  // Aucune ligne modifiée : ligne absente, ou écriture refusée par la RLS.
  if (!data || data.length === 0) return SAVE_FAILED;
  // Lecture de ses propres écritures : le site affiche la modification à la
  // requête suivante, sans redéploiement (cahier 7.7, D71).
  updateTag(CACHE_TAGS.settings);
  return null;
}

export async function saveShowreel(_: ActionState, form: FormData): Promise<ActionState> {
  await requireAdmin();
  const parsed = validate(showreelSchema, { url: text(form, "url"), title: text(form, "title") });
  if (!parsed.ok) return failure(FIX_FIELDS, parsed.errors);

  const error = await updateSettings({
    showreel_url: parsed.data.url,
    showreel_youtube_id: parsed.data.youtubeId,
    showreel_title: parsed.data.title,
  });
  return error ? failure(error) : success("Showreel enregistré. Il est en ligne sur l’accueil.");
}

export async function removeShowreel(): Promise<ActionState> {
  await requireAdmin();
  const error = await updateSettings({ showreel_url: null, showreel_youtube_id: null });
  return error ? failure(error) : success("Showreel retiré. L’accueil affiche le fond de repli.");
}

export async function saveSettings(_: ActionState, form: FormData): Promise<ActionState> {
  await requireAdmin();
  let stats: unknown;
  try {
    stats = JSON.parse(text(form, "stats") || "[]");
  } catch {
    stats = null;
  }
  const parsed = validate(settingsSchema, {
    heroTitle: text(form, "heroTitle"),
    heroSub: text(form, "heroSub"),
    stats,
    phone: text(form, "phone"),
    email: text(form, "email"),
    city: text(form, "city"),
    replyPromise: text(form, "replyPromise"),
  });
  if (!parsed.ok) return failure(FIX_FIELDS, parsed.errors);

  const d = parsed.data;
  const error = await updateSettings({
    hero_title: d.heroTitle,
    hero_sub: d.heroSub,
    stats: d.stats,
    phone: d.phone,
    email: d.email,
    city: d.city,
    reply_promise: d.replyPromise,
  });
  return error ? failure(error) : success("Réglages enregistrés. Ils sont en ligne sur le site.");
}
