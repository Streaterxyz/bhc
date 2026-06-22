/** POST /api/admin/logout — clears the admin session and returns to login. */

import { NextResponse } from "next/server";

import { clearAdminCookie } from "@/lib/admin/auth";

export const runtime = "nodejs";

export async function POST(req: Request) {
  await clearAdminCookie();
  // Same-origin redirect so it works on localhost + prod alike.
  return NextResponse.redirect(new URL("/admin/login", req.url), {
    status: 303,
  });
}
