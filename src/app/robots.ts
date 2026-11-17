import type { MetadataRoute } from "next";
import { getSiteUrl } from "@/lib/env";
import { INDEXING_ENABLED } from "@/lib/site";

// robots.txt (cahier 11, D92) : tout est interdit tant que l'indexation est
// désactivée ; ensuite tout est autorisé sauf le dashboard et les routes API,
// avec le lien vers le sitemap.
export default function robots(): MetadataRoute.Robots {
  if (!INDEXING_ENABLED) {
    return { rules: { userAgent: "*", disallow: "/" } };
  }
  const site = getSiteUrl();
  return {
    rules: { userAgent: "*", allow: "/", disallow: ["/admin", "/api"] },
    ...(site ? { sitemap: new URL("/sitemap.xml", site).toString(), host: site.origin } : {}),
  };
}
