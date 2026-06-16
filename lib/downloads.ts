/**
 * The Profit Patch Kit download manifest — the single allow-list of files a
 * paid customer can download. The /api/download route ONLY signs keys that
 * appear here, so the lead can never request an arbitrary R2 object.
 *
 * `key` is the R2 object key; upload the matching files to that path in the
 * bucket. Start with the complete ZIP; individual tools can be added as
 * separate entries later (one download row per file = which assets get used).
 */

export type KitFile = {
  /** R2 object key — must match the uploaded object path. */
  key: string;
  /** Display name on the downloads page. */
  name: string;
  /** Short description under the name. */
  description: string;
  /** Filename the browser saves it as. */
  filename: string;
};

export const KIT_FILES: KitFile[] = [
  {
    key: "profit-patch-kit/profit-patch-kit.zip",
    name: "The Complete Profit Patch Kit",
    description:
      "All four tools, the bonus Silent Upsell System, and the 15 quick-win strategies — ready to drop into your venue.",
    filename: "Profit-Patch-Kit.zip",
  },
];

/** Look up a file by key. Used to validate download requests against the
 *  allow-list before signing anything. */
export function getKitFile(key: string): KitFile | undefined {
  return KIT_FILES.find((f) => f.key === key);
}
