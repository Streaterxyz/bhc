/**
 * Resend transactional email client.
 *
 * Env-gated: sendEmail() is a no-op when RESEND_API_KEY is unset, so local
 * dev / pre-config never errors and the funnel still works (emails just
 * don't send).
 */

import { Resend } from "resend";

let cached: Resend | null | undefined;

function getResend(): Resend | null {
  if (cached !== undefined) return cached;
  const key = process.env.RESEND_API_KEY;
  cached = key ? new Resend(key) : null;
  return cached;
}

export function isEmailConfigured(): boolean {
  return Boolean(process.env.RESEND_API_KEY);
}

const FROM = process.env.RESEND_FROM ?? "hello@brendonhill.co";
const REPLY_TO = process.env.RESEND_REPLY_TO ?? "brendon@brendonhill.co";

type Attachment = { filename: string; content: Buffer };

type SendArgs = {
  to: string;
  subject: string;
  html: string;
  attachments?: Attachment[];
};

/**
 * Send a transactional email. Returns true on success, false on failure or
 * when Resend isn't configured. Never throws — email is best-effort and must
 * not break the calling flow (e.g. a Stripe webhook).
 */
export async function sendEmail({
  to,
  subject,
  html,
  attachments,
}: SendArgs): Promise<boolean> {
  const resend = getResend();
  if (!resend) return false;
  try {
    const { error } = await resend.emails.send({
      from: `Brendon Hill Consultancy <${FROM}>`,
      replyTo: REPLY_TO,
      to,
      subject,
      html,
      ...(attachments && attachments.length
        ? { attachments }
        : {}),
    });
    if (error) {
      console.error("[resend] send error:", error);
      return false;
    }
    return true;
  } catch (err) {
    console.error("[resend] send threw:", err);
    return false;
  }
}
