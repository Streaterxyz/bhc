import type { MetadataRoute } from "next";

import { projects } from "@/lib/projects";

const SITE = "https://brendonhill.co";

/**
 * Marketing-site sitemap: home, about, case studies, legal. Funnel pages
 * (/training, /checkout, /app, /access) are noindex and deliberately absent.
 */
export default function sitemap(): MetadataRoute.Sitemap {
  const staticPages: MetadataRoute.Sitemap = [
    { url: `${SITE}/`, changeFrequency: "weekly", priority: 1 },
    { url: `${SITE}/about`, changeFrequency: "monthly", priority: 0.9 },
    { url: `${SITE}/legal/privacy`, changeFrequency: "yearly", priority: 0.1 },
    { url: `${SITE}/legal/terms`, changeFrequency: "yearly", priority: 0.1 },
    {
      url: `${SITE}/legal/refund-policy`,
      changeFrequency: "yearly",
      priority: 0.1,
    },
  ];

  const projectPages: MetadataRoute.Sitemap = projects.map((p) => ({
    url: `${SITE}/projects/${p.slug}`,
    changeFrequency: "monthly",
    priority: 0.8,
  }));

  return [...staticPages, ...projectPages];
}
