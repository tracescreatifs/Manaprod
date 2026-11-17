import "server-only";
import { createClient } from "@supabase/supabase-js";
import type { Database } from "@/types/database";

// Client Supabase sans session, pour les lectures publiques côté serveur,
// notamment dans les fonctions "use cache" (qui ne peuvent pas lire les
// cookies). Clé publique anon : la RLS s'applique comme pour un visiteur.
// Le client à cookies (server.ts) reste réservé aux usages authentifiés.
export function createPublicClient(env: { url: string; anonKey: string }) {
  return createClient<Database>(env.url, env.anonKey, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
      detectSessionInUrl: false,
    },
  });
}
