/**
 * POST /api/admin/notes — add a support note to a customer. Admin-gated:
 * the author is the verified admin session email, never the request body.
 */

import { NextResponse } from "next/server";

import { readAdminSession } from "@/lib/admin/auth";
import { addNote } from "@/lib/admin/notes";

export const runtime = "nodejs";

const MAX_BODY = 4000;

export async function POST(req: Request) {
  const admin = await readAdminSession();
  if (!admin) {
    return NextResponse.json({ ok: false, error: "Unauthorised." }, { status: 401 });
  }

  let leadId: string | null = null;
  let body: string | null = null;
  try {
    const json = (await req.json()) as { leadId?: unknown; body?: unknown };
    if (typeof json.leadId === "string") leadId = json.leadId;
    if (typeof json.body === "string") body = json.body.trim();
  } catch {
    /* handled below */
  }

  if (!leadId || !body) {
    return NextResponse.json(
      { ok: false, error: "A note body is required." },
      { status: 422 },
    );
  }
  if (body.length > MAX_BODY) {
    return NextResponse.json(
      { ok: false, error: "Note is too long." },
      { status: 422 },
    );
  }

  try {
    const note = await addNote(leadId, admin.email, body);
    return NextResponse.json({
      ok: true,
      note: {
        id: note.id,
        authorEmail: note.authorEmail,
        body: note.body,
        createdAtMs: note.createdAt.getTime(),
      },
    });
  } catch (err) {
    console.error("[/api/admin/notes] failed:", err);
    return NextResponse.json(
      { ok: false, error: "Could not save the note." },
      { status: 500 },
    );
  }
}
