import "server-only";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export const LOGIN_PATH = "/admin/login";
export const REFUSED_PATH = "/admin/login?refus=1";

/**
 * Vérifie que la requête vient d'un administrateur (cahier 7, CLAUDE.md 11) :
 * utilisateur vérifié auprès de Supabase Auth avec getUser() (jamais la
 * session seule), puis appartenance à admin_users avec la fonction is_admin().
 * Sans session : redirection vers la connexion. Connecté sans être
 * administrateur : redirection vers la connexion avec le message « Accès
 * réservé aux administrateurs » (le proxy ferme alors la session).
 * À appeler en tête de chaque page protégée et de chaque Server Action.
 * Renvoie le client à cookies (RLS is_admin) et l'utilisateur.
 */
export async function requireAdmin() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect(LOGIN_PATH);

  const { data: isAdmin, error } = await supabase.rpc("is_admin");
  if (error || isAdmin !== true) redirect(REFUSED_PATH);

  return { supabase, user };
}
