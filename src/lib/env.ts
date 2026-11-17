// Lecture des variables d'environnement.
// Aucune erreur à l'import : une variable manquante lève une erreur claire
// seulement au moment où une fonction qui en a besoin est appelée.
// Les variables NEXT_PUBLIC_ sont lues par leur nom complet pour que Next.js
// puisse les intégrer au code du navigateur.

function missing(name: string): Error {
  return new Error(
    `Variable d'environnement manquante : ${name}. Ajoutez-la dans Vercel (Settings, Environment Variables), puis redéployez le site.`,
  );
}

// Variables Supabase si elles sont toutes présentes, sinon null (sans erreur).
// Sert au seul cas du prérendu pendant le build (voir isBuildPhase).
export function readSupabaseEnv(): { url: string; anonKey: string } | null {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  return url && anonKey ? { url, anonKey } : null;
}

// Vrai pendant `next build` (prérendu des pages), faux à l'exécution.
export function isBuildPhase(): boolean {
  return process.env.NEXT_PHASE === "phase-production-build";
}

export function getSupabaseEnv(): { url: string; anonKey: string } {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url) throw missing("NEXT_PUBLIC_SUPABASE_URL");
  if (!anonKey) throw missing("NEXT_PUBLIC_SUPABASE_ANON_KEY");
  return { url, anonKey };
}

// URL publique du site. Facultative : renvoie undefined si la variable est
// absente ou invalide, pour que le build réussisse sans elle.
export function getSiteUrl(): URL | undefined {
  const value = process.env.NEXT_PUBLIC_SITE_URL;
  if (!value) return undefined;
  try {
    return new URL(value);
  } catch {
    return undefined;
  }
}
