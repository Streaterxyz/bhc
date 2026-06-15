/**
 * POST /api/leads
 *
 * The single write endpoint behind the email-capture form on /training.
 * Validates the email, upserts the lead (capturing attribution + geo),
 * sets the signed lead session cookie, and returns the lead id.
 *
 * Runs on the Node runtime (not Edge) because it uses the Neon
 * serverless Pool + Drizzle.
 */

import { NextResponse, type NextRequest } from "next/server";

import { upsertLead, isValidEmail, normalizeEmail } from "@/lib/leads";
import { setLeadCookie } from "@/lib/auth/cookie";

export const runtime = "nodejs";

type Body = {
  email?: unknown;
  name?: unknown;
  source?: unknown;
  utm?: Record<string, string | undefined>;
  landingPage?: unknown;
  referrer?: unknown;
};

function asString(v: unknown): string | null {
  return typeof v === "string" && v.trim() ? v.trim() : null;
}

export async function POST(req: NextRequest) {
  let body: Body;
  try {
    body = (await req.json()) as Body;
  } catch {
    return NextResponse.json(
      { ok: false, error: "Invalid JSON body." },
      { status: 400 },
    );
  }

  const rawEmail = asString(body.email);
  if (!rawEmail || !isValidEmail(rawEmail)) {
    return NextResponse.json(
      { ok: false, error: "Please enter a valid email address." },
      { status: 422 },
    );
  }

  const email = normalizeEmail(rawEmail);
  const utm = body.utm ?? {};

  // Geo from Vercel's edge header (absent locally — that's fine).
  const ipCountry =
    req.headers.get("x-vercel-ip-country") ??
    req.headers.get("cf-ipcountry") ??
    null;

  try {
    const lead = await upsertLead({
      email,
      name: asString(body.name),
      source: asString(body.source) ?? "training",
      utmSource: asString(utm.utm_source),
      utmMedium: asString(utm.utm_medium),
      utmCampaign: asString(utm.utm_campaign),
      utmContent: asString(utm.utm_content),
      utmTerm: asString(utm.utm_term),
      referrer: asString(body.referrer) ?? req.headers.get("referer"),
      landingPage: asString(body.landingPage),
      ipCountry: ipCountry ? ipCountry.slice(0, 2).toUpperCase() : null,
    });

    await setLeadCookie({ leadId: lead.id, email: lead.email });

    return NextResponse.json({ ok: true, leadId: lead.id });
  } catch (err) {
    console.error("[/api/leads] upsert failed:", err);
    return NextResponse.json(
      { ok: false, error: "Something went wrong. Please try again." },
      { status: 500 },
    );
  }
}
