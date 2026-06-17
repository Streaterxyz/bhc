/**
 * Branded HTML email templates. Email-safe markup (inline styles, tables not
 * needed for this simple layout, no external CSS). Dark header bar with the
 * BHC wordmark over a light, readable body and a gold CTA button.
 */

const ACCENT = "#F4C21C";
const INK = "#0a0a0a";

function shell(bodyHtml: string): string {
  return `<!doctype html>
<html>
  <body style="margin:0;padding:0;background:#f3f3f3;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Helvetica,Arial,sans-serif;color:#1a1a1a;">
    <div style="max-width:560px;margin:0 auto;padding:24px 16px;">
      <div style="background:${INK};border-radius:14px 14px 0 0;padding:22px 28px;">
        <span style="color:#fff;font-weight:800;font-size:20px;letter-spacing:3px;">BHC</span>
        <span style="color:#9a9a9a;font-size:11px;letter-spacing:2px;margin-left:10px;">BRENDON HILL CONSULTANCY</span>
      </div>
      <div style="background:#ffffff;border-radius:0 0 14px 14px;padding:32px 28px;">
        ${bodyHtml}
      </div>
      <p style="text-align:center;color:#9a9a9a;font-size:11px;margin-top:18px;">
        © ${new Date().getFullYear()} Brendon Hill Consultancy · Everything Elevated. No Exceptions.
      </p>
    </div>
  </body>
</html>`;
}

function button(href: string, label: string): string {
  return `<a href="${href}" style="display:inline-block;background:${INK};color:#ffffff;text-decoration:none;font-weight:700;font-size:15px;padding:14px 28px;border-radius:999px;">${label} →</a>`;
}

/** Magic-link "get back in" email. */
export function magicLinkEmail(link: string): { subject: string; html: string } {
  return {
    subject: "Your access link — Brendon Hill Consultancy",
    html: shell(`
      <h1 style="font-size:22px;font-weight:800;margin:0 0 14px;">Here's your access link</h1>
      <p style="font-size:15px;line-height:1.6;color:#444;margin:0 0 24px;">
        Click below to securely access your account. The link works for the next
        30 minutes and can only be used by you.
      </p>
      <p style="margin:0 0 24px;">${button(link, "Access my account")}</p>
      <p style="font-size:13px;line-height:1.6;color:#888;margin:0;">
        If you didn't request this, you can safely ignore it — no changes will be
        made to your account.
      </p>
    `),
  };
}

/** Purchase receipt + access email. */
export function receiptEmail(args: {
  link: string;
  amount: string; // e.g. "A$89.00"
  productName: string;
}): { subject: string; html: string } {
  const { link, amount, productName } = args;
  return {
    subject: "Your Profit Patch Kit is ready 🎉",
    html: shell(`
      <h1 style="font-size:22px;font-weight:800;margin:0 0 14px;">You're in. Let's plug those leaks.</h1>
      <p style="font-size:15px;line-height:1.6;color:#444;margin:0 0 22px;">
        Thanks for your purchase — your <strong>${productName}</strong> is ready.
        Click below to access everything, anytime.
      </p>
      <p style="margin:0 0 26px;">${button(link, "Access my kit")}</p>
      <div style="border-top:1px solid #eee;padding-top:18px;margin-top:8px;">
        <p style="font-size:13px;color:#888;margin:0 0 4px;">Order summary</p>
        <p style="font-size:15px;color:#1a1a1a;margin:0;">
          ${productName} — <strong>${amount}</strong>
        </p>
      </div>
      <p style="font-size:13px;line-height:1.6;color:#888;margin:22px 0 0;">
        Backed by our 14-day, no-questions-asked guarantee. Questions? Just reply
        to this email.
      </p>
    `),
  };
}
