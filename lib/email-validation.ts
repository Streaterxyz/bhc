/**
 * Email legitimacy helpers — shared by the server (disposable blocking in
 * /api/leads) and the client (typo suggestions in LeadCaptureForm).
 *
 * Three layers, none of which prove deliverability on their own (only
 * sending does), but together they catch the overwhelming majority of
 * junk + honest mistakes before they pollute the list:
 *   - isDisposableEmail: rejects known throwaway domains
 *   - suggestEmailCorrection: "did you mean gmail.com?" for obvious typos
 *   - (format check lives in lib/leads.ts isValidEmail)
 */

/** Lowercased domain part of an email, or null if malformed. */
export function getEmailDomain(email: string): string | null {
  const at = email.lastIndexOf("@");
  if (at === -1) return null;
  const domain = email.slice(at + 1).trim().toLowerCase();
  return domain || null;
}

// ─── Disposable / throwaway domains ─────────────────────────────────────
// Curated set of the most common temporary-email providers. Not exhaustive
// (full lists run to thousands), but covers the vast majority of real-world
// abuse with near-zero false positives. Add entries as new ones surface.
const DISPOSABLE_DOMAINS = new Set<string>([
  "mailinator.com", "yopmail.com", "guerrillamail.com", "guerrillamail.info",
  "guerrillamail.net", "guerrillamail.org", "guerrillamail.biz", "sharklasers.com",
  "grr.la", "spam4.me", "tempmail.com", "temp-mail.org", "temp-mail.io",
  "tempmail.net", "tempmailo.com", "tempr.email", "10minutemail.com",
  "10minutemail.net", "20minutemail.com", "throwawaymail.com", "throwawaymailbox.com",
  "trashmail.com", "trashmail.net", "trash-mail.com", "getnada.com", "nada.email",
  "dispostable.com", "fakeinbox.com", "fakemail.net", "mailnesia.com",
  "maildrop.cc", "mailcatch.com", "mohmal.com", "moakt.com", "emailondeck.com",
  "spambog.com", "spambox.us", "mytemp.email", "tempinbox.com", "burnermail.io",
  "mailsac.com", "inboxkitten.com", "tempail.com", "luxusmail.org",
  "mailpoof.com", "harakirimail.com", "discard.email", "discardmail.com",
  "spamgourmet.com", "jetable.org", "mailexpire.com", "mintemail.com",
  "incognitomail.org", "anonbox.net", "33mail.com", "tempmailaddress.com",
  "wegwerfmail.de", "einrot.com", "fakemailgenerator.com", "emailfake.com",
  "tmail.io", "tmpmail.org", "tmpmail.net", "tmpeml.com", "1secmail.com",
  "1secmail.org", "1secmail.net", "vjuum.com", "kzccv.com", "qiott.com",
  "wuuvo.com", "icznn.com", "cazle.com", "tempmail.plus", "mail-temp.com",
  "minuteinbox.com", "mailtemp.net", "tafmail.com", "byom.de", "mailbox52.ga",
  "rootfest.net", "cuvox.de", "dayrep.com", "armyspy.com", "fleckens.hu",
  "gustr.com", "jourrapide.com", "rhyta.com", "superrito.com", "teleworm.us",
  "yopmail.fr", "yopmail.net", "etempmail.net", "linshiyou.com",
]);

/** True when the email's domain is a known disposable/throwaway provider. */
export function isDisposableEmail(email: string): boolean {
  const domain = getEmailDomain(email);
  return domain ? DISPOSABLE_DOMAINS.has(domain) : false;
}

// ─── Typo suggestion (mailcheck-style) ──────────────────────────────────
// Common providers + TLDs we nudge obvious misspellings toward.
const COMMON_DOMAINS = [
  "gmail.com", "googlemail.com", "yahoo.com", "yahoo.com.au", "hotmail.com",
  "outlook.com", "outlook.com.au", "live.com", "live.com.au", "icloud.com",
  "me.com", "aol.com", "msn.com", "bigpond.com", "bigpond.com.au",
  "optusnet.com.au", "iinet.net.au", "proton.me", "protonmail.com",
  // Real domains that sit within edit-distance of a common one — listed so
  // an exact match short-circuits and we never "correct" a valid address.
  "ymail.com", "rocketmail.com", "gmx.com",
];
const COMMON_TLDS = ["com", "com.au", "net", "net.au", "org", "org.au", "edu.au", "co", "io", "me"];

/** Classic Levenshtein edit distance. */
function editDistance(a: string, b: string): number {
  const m = a.length;
  const n = b.length;
  const dp: number[] = Array.from({ length: n + 1 }, (_, i) => i);
  for (let i = 1; i <= m; i++) {
    let prev = dp[0];
    dp[0] = i;
    for (let j = 1; j <= n; j++) {
      const tmp = dp[j];
      dp[j] =
        a[i - 1] === b[j - 1]
          ? prev
          : 1 + Math.min(prev, dp[j], dp[j - 1]);
      prev = tmp;
    }
  }
  return dp[n];
}

function closest(value: string, candidates: string[], maxDistance: number): string | null {
  let best: string | null = null;
  let bestDist = maxDistance + 1;
  for (const c of candidates) {
    if (c === value) return null; // exact match → nothing to suggest
    const d = editDistance(value, c);
    if (d < bestDist) {
      bestDist = d;
      best = c;
    }
  }
  return bestDist <= maxDistance ? best : null;
}

/**
 * Suggest a corrected email for an obvious typo (e.g. "gmial.com" →
 * "gmail.com", "user@gmail.con" → "user@gmail.com"). Returns the full
 * corrected email, or null when nothing looks wrong. Conservative by
 * design — only fires on a close, unambiguous match so we never nag a
 * user with a valid address.
 */
export function suggestEmailCorrection(email: string): string | null {
  const trimmed = email.trim().toLowerCase();
  const at = trimmed.lastIndexOf("@");
  if (at === -1) return null;
  const local = trimmed.slice(0, at);
  const domain = trimmed.slice(at + 1);
  if (!local || !domain || !domain.includes(".")) return null;

  // 1. Whole-domain match against common providers (catches gmial.com, etc.)
  const domainFix = closest(domain, COMMON_DOMAINS, 2);
  if (domainFix) return `${local}@${domainFix}`;

  // 2. TLD-only fix (catches gmail.con, mybiz.cmo) while keeping the
  //    second-level domain intact.
  const dot = domain.indexOf(".");
  const sld = domain.slice(0, dot);
  const tld = domain.slice(dot + 1);
  const tldFix = closest(tld, COMMON_TLDS, 1);
  if (tldFix) return `${local}@${sld}.${tldFix}`;

  return null;
}
