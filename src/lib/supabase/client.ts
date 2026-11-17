import { createBrowserClient } from "@supabase/ssr";
import { getSupabaseEnv } from "@/lib/env";
import { sessionCookieOptions } from "@/lib/supabase/cookie-options";

// Client Supabase pour les composants exécutés dans le navigateur.
// Utilise la clé publique anon : la RLS s'applique.
export function createClient() {
  const { url, anonKey } = getSupabaseEnv();
  return createBrowserClient(url, anonKey, { cookieOptions: sessionCookieOptions });
}
