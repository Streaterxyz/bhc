/**
 * Build-time helpers for resolving project hero + gallery images.
 *
 * All project images live in /public/projects/<slug>/ and are normalized
 * to .webp by scripts/normalize-project-images.mjs. These helpers run on
 * the server during static generation — they're not bundled into the
 * client because they touch node:fs.
 */

import fs from "node:fs/promises";
import path from "node:path";

const PUBLIC_PROJECTS_DIR = path.join(process.cwd(), "public", "projects");

/**
 * Path (relative to /public) of the hero image for a project, or null if
 * the file doesn't exist on disk. Used by surfaces that need to render
 * either the photo or fall back to a placeholder.
 */
export async function getHeroImage(slug: string): Promise<string | null> {
  const file = path.join(PUBLIC_PROJECTS_DIR, slug, "hero.webp");
  try {
    await fs.access(file);
    return `/projects/${slug}/hero.webp`;
  } catch {
    return null;
  }
}

/**
 * Sorted list of gallery image paths (relative to /public) for a project.
 * Matches files named NN.webp (01.webp, 02.webp, …) — the canonical names
 * produced by the normalize-project-images script. Returns [] when no
 * gallery files exist.
 */
export async function getGalleryImages(slug: string): Promise<string[]> {
  const dir = path.join(PUBLIC_PROJECTS_DIR, slug);
  try {
    const entries = await fs.readdir(dir);
    return entries
      .filter((f) => /^\d{2}\.webp$/.test(f))
      .sort()
      .map((f) => `/projects/${slug}/${f}`);
  } catch {
    return [];
  }
}
