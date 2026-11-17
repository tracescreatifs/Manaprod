import type { NextConfig } from "next";

// Politique de sécurité du contenu (audit 2 C4, D95), compatible avec des
// pages statiques (sans nonce). Chaque source est justifiée dans D95.
// CSP_MODE : « report-only » pour tester sans rien bloquer, « enforce » pour
// appliquer.
const CSP_MODE = "enforce" as "report-only" | "enforce";

// Origine exacte du projet Supabase (lue au build), en plus de *.supabase.co.
function supabaseOrigin(): string | null {
  try {
    return new URL(process.env.NEXT_PUBLIC_SUPABASE_URL ?? "").origin;
  } catch {
    return null;
  }
}

function contentSecurityPolicy(): string {
  const supabase = supabaseOrigin();
  const supabaseSources = ["https://*.supabase.co", ...(supabase && !supabase.endsWith(".supabase.co") ? [supabase] : [])];
  const directives: Record<string, string[]> = {
    "default-src": ["'self'"],
    // Scripts en ligne de Next.js (données RSC, chargement des pages
    // statiques) ; eval seulement en développement (rechargement à chaud).
    "script-src": ["'self'", "'unsafe-inline'", ...(process.env.NODE_ENV === "development" ? ["'unsafe-eval'"] : [])],
    // Styles en ligne de Next.js et des animations (attributs style).
    "style-src": ["'self'", "'unsafe-inline'"],
    // Images : site, données en ligne, aperçus locaux (blob:) du dashboard,
    // miniatures YouTube, bucket media de Supabase.
    "img-src": ["'self'", "data:", "blob:", "https://i.ytimg.com", ...supabaseSources],
    // Police auto-hébergée (next/font).
    "font-src": ["'self'"],
    // Appels du navigateur : session et téléversements Supabase.
    "connect-src": ["'self'", ...supabaseSources, "wss://*.supabase.co"],
    // Lecteur YouTube sans cookie uniquement.
    "frame-src": ["https://www.youtube-nocookie.com"],
    "object-src": ["'none'"],
    "base-uri": ["'self'"],
    "form-action": ["'self'"],
    "frame-ancestors": ["'none'"],
  };
  return Object.entries(directives)
    .map(([name, values]) => `${name} ${values.join(" ")}`)
    .join("; ");
}

const nextConfig: NextConfig = {
  cacheComponents: true,
  // En-têtes de sécurité de base sur toutes les réponses (audit 1, D67).
  async headers() {
    return [
      {
        source: "/:path*",
        headers: [
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "X-Frame-Options", value: "DENY" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=()" },
          // HTTPS obligatoire pendant un an, sans sous-domaines ni preload (D95).
          { key: "Strict-Transport-Security", value: "max-age=31536000" },
          {
            key: CSP_MODE === "enforce" ? "Content-Security-Policy" : "Content-Security-Policy-Report-Only",
            value: contentSecurityPolicy(),
          },
        ],
      },
    ];
  },
  images: {
    // Seules sources d'images distantes : miniatures YouTube et bucket media.
    remotePatterns: [
      { protocol: "https", hostname: "i.ytimg.com", pathname: "/vi/**" },
      {
        protocol: "https",
        hostname: "*.supabase.co",
        pathname: "/storage/v1/object/public/media/**",
      },
    ],
  },
  partialPrefetching: true,
  turbopack: {
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
};

export default nextConfig;
