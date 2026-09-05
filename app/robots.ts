import type { MetadataRoute } from "next";

/**
 * Crawl rules. Funnel pages (/training, /checkout) are intentionally NOT
 * disallowed here — they carry their own noindex meta, and crawlers must be
 * able to fetch a page to see its noindex. Only genuinely non-page surfaces
 * are blocked.
 */
export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: ["/api/", "/app/", "/admin/", "/downloads"],
      },
    ],
    sitemap: "https://brendonhill.co/sitemap.xml",
  };
}
