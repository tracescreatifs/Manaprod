import "server-only";
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { getSupabaseEnv } from "@/lib/env";

// Client Supabase pour les composants serveur, les Server Actions et les
// route handlers. Utilise la clé publique anon : la RLS s'applique.
export async function createClient() {
  const { url, anonKey } = getSupabaseEnv();
  const cookieStore = await cookies();

  return createServerClient(url, anonKey, {
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll(cookiesToSet) {
        try {
          cookiesToSet.forEach(({ name, value, options }) =>
            cookieStore.set(name, value, options),
          );
        } catch {
          // Appel depuis un composant serveur : l'écriture des cookies y est
          // impossible. Le rafraîchissement de session sera assuré par le
          // proxy d'authentification (Prompt 08).
        }
      },
    },
  });
}
