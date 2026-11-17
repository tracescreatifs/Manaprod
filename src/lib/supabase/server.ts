import "server-only";
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { getSupabaseEnv } from "@/lib/env";

// Client Supabase pour les composants serveur, les Server Actions et les
// route handlers. Utilise la clé publique anon : la RLS s'applique.
// Les cookies sont lus avant les variables : pendant le prérendu, la lecture
// des cookies suspend la page (rendu à la requête), sans erreur de build.
export async function createClient() {
  const cookieStore = await cookies();
  const { url, anonKey } = getSupabaseEnv();

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
          // impossible. Le rafraîchissement de session est assuré par le
          // proxy (src/proxy.ts).
        }
      },
    },
  });
}
