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

export type TurnstileResult = {
  success: boolean;
  /** Cloudflare error-codes when success is false (for diagnostics). */
  errorCodes?: string[];
};

/**
 * Verify a Turnstile token. Returns `{ success: true }` when valid, or when
 * Turnstile isn't configured (verification disabled).
 *
 * NOTE: we deliberately DO NOT send `remoteip`. The app is DNS-only on
 * Cloudflare (grey cloud), so the IP Vercel sees can differ from the IP
 * Cloudflare recorded at challenge time — sending a mismatched remoteip
 * causes false verification failures.
 */
export async function verifyTurnstile(
  token: string | null | undefined,
): Promise<TurnstileResult> {
  const secret = process.env.TURNSTILE_SECRET_KEY;
  if (!secret) return { success: true }; // not configured → skip

  if (!token) {
    return { success: false, errorCodes: ["missing-input-response"] };
  }

  try {
    const form = new URLSearchParams();
    form.append("secret", secret);
    form.append("response", token);

    const res = await fetch(SITEVERIFY_URL, {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: form,
    });
    const data = (await res.json()) as {
      success?: boolean;
      "error-codes"?: string[];
    };
    if (!data.success) {
      console.warn(
        "[turnstile] verification failed:",
        data["error-codes"]?.join(", ") ?? "unknown",
      );
    }
    return {
      success: Boolean(data.success),
      errorCodes: data["error-codes"],
    };
  } catch (err) {
    console.error("[turnstile] verification request failed:", err);
    return { success: false, errorCodes: ["internal-error"] };
  }
}
