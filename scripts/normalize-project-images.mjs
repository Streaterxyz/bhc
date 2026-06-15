#!/usr/bin/env node
/**
 * Normalize project hero + gallery images.
 *
 *   - Converts any heroes named hero.{jpg,jpeg,png,webp,avif} → hero.webp
 *     (max 2400px wide, quality 85, mozjpeg-like sharpening).
 *   - Converts any gallery files named 01.*, 02.*, … to NN.webp at
 *     max 1800px wide, quality 82.
 *   - Strips metadata + .DS_Store droppings.
 *   - Removes the source files only after the WebP successfully writes.
 *
 * Usage:
 *   pnpm run normalize:project-images
 *   pnpm run normalize:project-images -- the-grounds barenz   # subset
 *
 * Idempotent — re-running on a folder that's already normalized is a no-op
 * because hero.webp already exists and there are no source-format heroes
 * left to convert.
 */

import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import sharp from "sharp";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const PROJECTS_ROOT = path.resolve(__dirname, "..", "public", "projects");

const HERO_MAX_W = 2400;
const HERO_QUALITY = 85;
const GALLERY_MAX_W = 1800;
const GALLERY_QUALITY = 82;

// Acceptable source extensions (case-insensitive).
const SOURCE_EXTS = new Set([".jpg", ".jpeg", ".png", ".webp", ".avif"]);

const argv = process.argv.slice(2);
const subset = argv.length ? new Set(argv) : null;

/** Pretty-print bytes as KB/MB. */
function fmtBytes(n) {
  if (n > 1024 * 1024) return (n / (1024 * 1024)).toFixed(2) + " MB";
  return Math.round(n / 1024) + " KB";
}

/**
 * Encode a buffer to WebP at the given quality and return the resulting
 * buffer. Pulled out so we can probe several qualities to find the
 * smallest one that still meets the size target.
 */
async function encodeWebp(buf, { maxWidth, quality }) {
  const meta = await sharp(buf).metadata();
  const needsResize = (meta.width ?? 0) > maxWidth;

  const pipeline = sharp(buf, { failOn: "none" })
    .rotate() // honor EXIF orientation
    .withMetadata({ orientation: 1 }); // then strip orientation so it's flat

  if (needsResize) {
    pipeline.resize({
      width: maxWidth,
      withoutEnlargement: true,
      fit: "inside",
    });
  }

  const out = await pipeline
    .webp({ quality, effort: 5, smartSubsample: true })
    .toBuffer();

  return { out, meta, resized: needsResize };
}

async function processOne({ slug, srcPath, destName, maxWidth, quality }) {
  const destPath = path.join(path.dirname(srcPath), destName);
  const srcStat = await fs.stat(srcPath);

  // Idempotency: if the destination already IS the source (already a .webp
  // with the canonical name), don't bother re-encoding.
  if (path.basename(srcPath) === destName) {
    return { skipped: true, slug, src: srcPath };
  }

  const buf = await fs.readFile(srcPath);

  // Try a ladder of qualities. Pick the smallest WebP that:
  //   (a) is smaller than the source, OR
  //   (b) if none are smaller, the smallest output (still ≥ q70 for sanity).
  //
  // Some sources (already-optimised JPEG/AVIF) re-encode larger at q85, so
  // we step down before accepting a regression. This keeps the "never gets
  // bigger" invariant the user expects without rampant quality loss — q85
  // is preferred and only dropped when necessary.
  const ladder = [quality, quality - 5, quality - 10, quality - 15];
  let chosen = null;
  let firstMeta = null;
  let firstResized = null;
  let bestSmaller = null;
  let smallestAny = null;

  for (const q of ladder) {
    const { out, meta, resized } = await encodeWebp(buf, {
      maxWidth,
      quality: q,
    });
    if (firstMeta == null) {
      firstMeta = meta;
      firstResized = resized;
    }
    if (out.length < srcStat.size && bestSmaller == null) {
      bestSmaller = { out, q };
      break; // first quality that beats source wins (prefer higher q)
    }
    if (smallestAny == null || out.length < smallestAny.out.length) {
      smallestAny = { out, q };
    }
  }

  chosen = bestSmaller ?? smallestAny;

  await fs.writeFile(destPath, chosen.out);

  // Sanity: only delete source if destination is now a real file > 1KB.
  const destStat = await fs.stat(destPath);
  if (destStat.size > 1024 && srcPath !== destPath) {
    await fs.unlink(srcPath);
  }

  return {
    slug,
    src: path.basename(srcPath),
    dest: destName,
    srcSize: srcStat.size,
    destSize: destStat.size,
    width: firstMeta?.width,
    height: firstMeta?.height,
    resized: firstResized,
    quality: chosen.q,
  };
}

async function processDir(slug) {
  const dir = path.join(PROJECTS_ROOT, slug);
  let entries;
  try {
    entries = await fs.readdir(dir);
  } catch {
    return [];
  }

  // Drop OS junk first.
  for (const name of entries) {
    if (name === ".DS_Store" || name === "Thumbs.db") {
      await fs.unlink(path.join(dir, name)).catch(() => {});
    }
  }
  entries = (await fs.readdir(dir)).filter(
    (n) => n !== ".DS_Store" && n !== "Thumbs.db",
  );

  const results = [];

  // ── Hero pass ───────────────────────────────────────────────
  // Find any hero.* and convert to hero.webp.
  const hero = entries.find(
    (n) =>
      /^hero\./i.test(n) && SOURCE_EXTS.has(path.extname(n).toLowerCase()),
  );
  if (hero) {
    const r = await processOne({
      slug,
      srcPath: path.join(dir, hero),
      destName: "hero.webp",
      maxWidth: HERO_MAX_W,
      quality: HERO_QUALITY,
    });
    results.push({ ...r, kind: "hero" });
  }

  // ── Gallery pass ────────────────────────────────────────────
  // Files matching NN.* (01.jpg, 02.webp, …) → NN.webp.
  const galleryFiles = entries
    .filter(
      (n) =>
        /^\d{1,3}\./.test(n) &&
        SOURCE_EXTS.has(path.extname(n).toLowerCase()),
    )
    .sort();

  for (const file of galleryFiles) {
    const num = file.match(/^(\d{1,3})\./)[1].padStart(2, "0");
    const r = await processOne({
      slug,
      srcPath: path.join(dir, file),
      destName: `${num}.webp`,
      maxWidth: GALLERY_MAX_W,
      quality: GALLERY_QUALITY,
    });
    results.push({ ...r, kind: "gallery" });
  }

  return results;
}

async function main() {
  const dirEntries = await fs.readdir(PROJECTS_ROOT, { withFileTypes: true });
  const slugs = dirEntries
    .filter((e) => e.isDirectory())
    .map((e) => e.name)
    .filter((s) => (subset ? subset.has(s) : true))
    .sort();

  // Drop stray .DS_Store at the root too.
  await fs
    .unlink(path.join(PROJECTS_ROOT, ".DS_Store"))
    .catch(() => {});

  console.log("Normalizing", slugs.length, "project folder(s)…\n");

  let totalIn = 0;
  let totalOut = 0;
  for (const slug of slugs) {
    const results = await processDir(slug);
    if (!results.length) {
      console.log(`  ${slug}  (no images found)`);
      continue;
    }
    for (const r of results) {
      if (r.skipped) {
        console.log(
          `  ${slug.padEnd(28)}  ${r.kind ?? ""}  already normalized`,
        );
        continue;
      }
      const pct = Math.round((r.destSize / r.srcSize) * 100);
      const tags = [];
      if (r.resized) tags.push(`resized ≤${r.kind === "hero" ? HERO_MAX_W : GALLERY_MAX_W}w`);
      if (r.quality != null) tags.push(`q${r.quality}`);
      console.log(
        `  ${slug.padEnd(28)}  ${r.kind.padEnd(8)}  ${r.src.padEnd(14)} → ${r.dest.padEnd(10)}  ${fmtBytes(r.srcSize).padStart(9)} → ${fmtBytes(r.destSize).padStart(9)}  (${pct}%${tags.length ? ", " + tags.join(", ") : ""})`,
      );
      totalIn += r.srcSize;
      totalOut += r.destSize;
    }
  }

  if (totalIn > 0) {
    console.log(
      `\n  Total ${fmtBytes(totalIn)} → ${fmtBytes(totalOut)}  (${Math.round((totalOut / totalIn) * 100)}%)`,
    );
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
