/**
 * GET /api/cron/monthly-nudge
 *
 * Monthly re-engagement nudge. Scheduled via vercel.json on the 1st of each
 * month. Emails every entitled, onboarded customer a "update your numbers"
 * prompt with a magic link to /app — driving the re-run habit that powers
 * the $ Recovered loop.
 *
 * Protected by CRON_SECRET: Vercel Cron attaches `Authorization: Bearer
 * <CRON_SECRET>` to scheduled invocations. Manual hits without it are 401.
 */

import { NextResponse, type NextRequest } from "next/server";
import { eq } from "drizzle-orm";

import { db } from "@/lib/db/client";
import { purchases } from "@/lib/db/schema";
import { getLeadById } from "@/lib/leads";
import { getVenueProfile } from "@/lib/venue";
import { signMagicToken } from "@/lib/auth/magic";
import { sendEmail } from "@/lib/email/resend";
import { monthlyNudgeEmail } from "@/lib/email/templates";

export const runtime = "nodejs";
export const maxDuration = 60;

function siteOrigin(): string {
  return (process.env.NEXT_PUBLIC_SITE_URL ?? "https://brendonhill.co").replace(
    /\/$/,
    "",
  );
}

export async function GET(req: NextRequest) {
  const secret = process.env.CRON_SECRET;
  if (!secret || req.headers.get("authorization") !== `Bearer ${secret}`) {
    return NextResponse.json({ ok: false, error: "Unauthorized." }, { status: 401 });
  }

  const monthLabel = new Date().toLocaleDateString("en-AU", {
    timeZone: "Australia/Sydney",
    month: "long",
  });

  // Distinct customers with a settled, non-refunded purchase.
  const paid = await db
    .selectDistinct({ leadId: purchases.leadId })
    .from(purchases)
    .where(eq(purchases.status, "paid"));

  let sent = 0;
  let skipped = 0;

  for (const { leadId } of paid) {
    try {
      const lead = await getLeadById(leadId);
      // Only nudge active (non-unsubscribed) leads who've onboarded a venue.
      if (!lead || lead.status !== "active") {
        skipped++;
        continue;
      }
      const venue = await getVenueProfile(leadId);
      if (!venue) {
        skipped++;
        continue;
      }

      const token = await signMagicToken({ leadId, email: lead.email });
      const link = `${siteOrigin()}/api/auth/verify?token=${encodeURIComponent(
        token,
      )}&to=${encodeURIComponent("/app")}`;
      const { subject, html } = monthlyNudgeEmail({
        link,
        monthLabel,
        firstName: lead.name,
      });
      await sendEmail({ to: lead.email, subject, html });
      sent++;
    } catch (err) {
      console.error(`[cron monthly-nudge] failed for ${leadId}:`, err);
      skipped++;
    }
  }

  return NextResponse.json({ ok: true, sent, skipped, candidates: paid.length });
}
