import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import { getSupabaseEnv } from "@/lib/env";
import { sessionCookieOptions } from "@/lib/supabase/cookie-options";

// Proxy (convention Next.js 16), limité à /admin : rafraîchit la session
// Supabase dans les cookies et protège le dashboard (D70). Il ne s'exécute
// jamais sur les pages publiques, qui restent statiques.
// La vérification complète (getUser puis is_admin) est refaite par
// requireAdmin() dans chaque page et chaque Server Action.

// Pages accessibles sans session.
const OPEN_PATHS = ["/admin/login", "/admin/mot-de-passe-oublie", "/admin/confirmer"];
// Page accessible avec une session de récupération (lien de réinitialisation).
const RECOVERY_PATH = "/admin/nouveau-mot-de-passe";

export async function proxy(request: NextRequest) {
  const { url, anonKey } = getSupabaseEnv();
  let response = NextResponse.next({ request });

  const supabase = createServerClient(url, anonKey, {
    cookieOptions: sessionCookieOptions,
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
        response = NextResponse.next({ request });
        cookiesToSet.forEach(({ name, value, options }) =>
          response.cookies.set(name, value, options),
        );
      },
    },
  });

  // Redirection qui conserve les cookies de session mis à jour.
  const redirectTo = (path: string) => {
    const redirect = NextResponse.redirect(new URL(path, request.url));
    response.cookies.getAll().forEach((cookie) => redirect.cookies.set(cookie));
    redirect.headers.set("Cache-Control", "no-store");
    return redirect;
  };

  // getUser() vérifie le jeton auprès de Supabase Auth (jamais la session seule).
  const {
    data: { user },
  } = await supabase.auth.getUser();
  const path = request.nextUrl.pathname;

  if (!OPEN_PATHS.includes(path)) {
    if (path === RECOVERY_PATH) {
      if (!user) return redirectTo("/admin/mot-de-passe-oublie?lien=expire");
    } else {
      if (!user) return redirectTo("/admin/login");
      const { data: isAdmin, error } = await supabase.rpc("is_admin");
      if (error || isAdmin !== true) {
        // Compte connecté mais pas administrateur : session fermée.
        await supabase.auth.signOut();
        return redirectTo("/admin/login?refus=1");
      }
    }
  }

  response.headers.set("Cache-Control", "no-store");
  return response;
}

export const config = {
  matcher: ["/admin", "/admin/:path*"],
};
