/**
 * Loops (marketing nurture) — REST client.
 *
 * Clean split with Resend: Resend sends transactional email (receipts, magic
 * links); Loops owns marketing sequences, branched off the lifecycle events
 * we fire here (signed_up, completed_training, purchased).
 *
 * Env-gated + best-effort: every call is a no-op when LOOPS_API_KEY is unset
 * and never throws — nurture sync must never break the funnel (a lead capture
 * or a Stripe webhook must still succeed if Loops is down).
 *
 * Uses the REST API directly (no SDK dep). Auth: Bearer LOOPS_API_KEY.
 */

const BASE = "https://app.loops.so/api/v1";

export function isLoopsConfigured(): boolean {
  return Boolean(process.env.LOOPS_API_KEY);
}

async function loopsRequest(
  path: string,
  method: "POST" | "PUT",
  body: Record<string, unknown>,
): Promise<boolean> {
  const key = process.env.LOOPS_API_KEY;
  if (!key) return false;
  try {
    const res = await fetch(`${BASE}${path}`, {
      method,
      headers: {
        Authorization: `Bearer ${key}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
    });
    if (!res.ok) {
      console.error(
        `[loops] ${method} ${path} → ${res.status}`,
        await res.text().catch(() => ""),
      );
      return false;
    }
    return true;
  } catch (err) {
    console.error(`[loops] ${method} ${path} threw:`, err);
    return false;
  }
}

/**
 * Create or update a contact (PUT /contacts/update upserts). `properties`
 * may include firstName, source, and any custom fields configured in Loops.
 */
export async function loopsUpsertContact(
  email: string,
  properties: Record<string, unknown> = {},
): Promise<boolean> {
  return loopsRequest("/contacts/update", "PUT", { email, ...properties });
}

/**
 * Look up a contact by email. Returns the contact record or null (not found /
 * unconfigured / error). Used to initialise-but-never-clobber lifecycle
 * properties: Loops audience filters treat a MISSING property as "no match",
 * so booleans like trainingCompleted must exist (false) on every contact —
 * but a re-signup must not reset a completer's true back to false.
 */
export async function loopsFindContact(
  email: string,
): Promise<Record<string, unknown> | null> {
  const key = process.env.LOOPS_API_KEY;
  if (!key) return null;
  try {
    const res = await fetch(
      `${BASE}/contacts/find?email=${encodeURIComponent(email)}`,
      { headers: { Authorization: `Bearer ${key}` } },
    );
    if (!res.ok) return null;
    const data = (await res.json()) as unknown;
    return Array.isArray(data) && data[0] ? (data[0] as Record<string, unknown>) : null;
  } catch (err) {
    console.error("[loops] GET /contacts/find threw:", err);
    return null;
  }
}

/**
 * Fire an event Loops can trigger / branch sequences off. `properties` become
 * event properties usable in Loops conditions.
 */
export async function loopsTrackEvent(
  email: string,
  eventName: string,
  properties: Record<string, unknown> = {},
): Promise<boolean> {
  return loopsRequest("/events/send", "POST", {
    email,
    eventName,
    eventProperties: properties,
  });
}
