/**
 * Cloudflare Turnstile server-side verification.
 *
 * Env-gated: when TURNSTILE_SECRET_KEY is unset, verification is skipped
 * (returns true) so local dev / pre-config isn't blocked. Once the secret
 * is set, a valid token from the widget is required.
 */

const SITEVERIFY_URL =
  "https://challenges.cloudflare.com/turnstile/v0/siteverify";

/** True when Turnstile verification is enforced (secret configured). */
export function isTurnstileEnabled(): boolean {
  return Boolean(process.env.TURNSTILE_SECRET_KEY);
}

/**
 * Verify a Turnstile token. Returns true when the token is valid, or when
 * Turnstile isn't configured (verification disabled). `remoteIp` is optional
 * but improves accuracy.
 */
export async function verifyTurnstile(
  token: string | null | undefined,
  remoteIp?: string | null,
): Promise<boolean> {
  const secret = process.env.TURNSTILE_SECRET_KEY;
  if (!secret) return true; // not configured → skip

  if (!token) return false;

  try {
    const form = new URLSearchParams();
    form.append("secret", secret);
    form.append("response", token);
    if (remoteIp) form.append("remoteip", remoteIp);

    const res = await fetch(SITEVERIFY_URL, {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: form,
    });
    const data = (await res.json()) as { success?: boolean };
    return Boolean(data.success);
  } catch (err) {
    console.error("[turnstile] verification request failed:", err);
    return false;
  }
}
