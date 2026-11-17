import { NextResponse, type NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server";

// Lien de l'email « Mot de passe oublié » (format token_hash, recommandé par
// Supabase pour le rendu serveur) : le jeton est vérifié avec verifyOtp, ce
// qui ouvre une session de récupération, puis le visiteur choisit un nouveau
// mot de passe. Jeton invalide ou expiré : retour au formulaire avec un message.
export async function GET(request: NextRequest) {
  const tokenHash = request.nextUrl.searchParams.get("token_hash");
  const type = request.nextUrl.searchParams.get("type");
  const target = (path: string) => {
    const response = NextResponse.redirect(new URL(path, request.url));
    response.headers.set("Cache-Control", "no-store");
    return response;
  };

  if (!tokenHash || type !== "recovery") return target("/admin/mot-de-passe-oublie?lien=invalide");

  const supabase = await createClient();
  const { error } = await supabase.auth.verifyOtp({ type: "recovery", token_hash: tokenHash });
  if (error) return target("/admin/mot-de-passe-oublie?lien=invalide");
  return target("/admin/nouveau-mot-de-passe");
}
