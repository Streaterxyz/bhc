/**
 * Cloudflare R2 (S3-compatible) client + presigned-download helper.
 *
 * Env-gated: getR2() returns null until the R2 credentials + bucket are
 * configured, so the download route degrades gracefully ("preparing your
 * files") rather than 500ing before R2 is set up.
 *
 * We issue short-lived presigned GET URLs (default 15 min) with a forced
 * attachment Content-Disposition so the browser downloads the file with a
 * friendly name instead of streaming it inline.
 */

import { S3Client, GetObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

let cached: S3Client | null | undefined;

export function getR2(): S3Client | null {
  if (cached !== undefined) return cached;
  const accountId = process.env.CLOUDFLARE_ACCOUNT_ID;
  const accessKeyId = process.env.CLOUDFLARE_R2_ACCESS_KEY_ID;
  const secretAccessKey = process.env.CLOUDFLARE_R2_SECRET_ACCESS_KEY;
  if (!accountId || !accessKeyId || !secretAccessKey) {
    cached = null;
    return null;
  }
  cached = new S3Client({
    region: "auto",
    endpoint: `https://${accountId}.r2.cloudflarestorage.com`,
    credentials: { accessKeyId, secretAccessKey },
  });
  return cached;
}

/** True when every R2 env var (creds + bucket) is present. */
export function isR2Configured(): boolean {
  return Boolean(
    process.env.CLOUDFLARE_ACCOUNT_ID &&
      process.env.CLOUDFLARE_R2_ACCESS_KEY_ID &&
      process.env.CLOUDFLARE_R2_SECRET_ACCESS_KEY &&
      process.env.CLOUDFLARE_R2_BUCKET,
  );
}

/**
 * Generate a short-lived presigned download URL for an R2 object. Returns
 * null when R2 isn't configured. `filename` sets the downloaded file name.
 */
export async function getSignedDownloadUrl(
  key: string,
  filename: string,
  expiresInSeconds = 900,
): Promise<string | null> {
  const client = getR2();
  const bucket = process.env.CLOUDFLARE_R2_BUCKET;
  if (!client || !bucket) return null;

  const command = new GetObjectCommand({
    Bucket: bucket,
    Key: key,
    ResponseContentDisposition: `attachment; filename="${filename}"`,
  });
  return getSignedUrl(client, command, { expiresIn: expiresInSeconds });
}
