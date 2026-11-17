// Attributs des cookies de session Supabase (audit 2, D90) : en
// production, cookies réservés au HTTPS (Secure). Les valeurs par défaut de
// @supabase/ssr (chemin /, SameSite=Lax, durée) sont conservées. HttpOnly
// reste désactivé : le client navigateur lit la session pour téléverser
// les images directement vers le bucket (D79).
export const sessionCookieOptions = {
  secure: process.env.NODE_ENV === "production",
} as const;
