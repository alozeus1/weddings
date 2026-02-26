import { randomUUID } from "node:crypto";
import { NextResponse } from "next/server";
import { z } from "zod";
import { hasDatabaseConfig } from "@/lib/db";
import { normalizeGuestValue } from "@/lib/guests";
import { createInviteRequest } from "@/lib/storage";

const schema = z.object({
  fullName: z.string().min(2),
  email: z.string().email().optional().or(z.literal("")),
  phone: z.string().optional().or(z.literal("")),
  message: z.string().max(500).optional().or(z.literal(""))
});

export async function POST(request: Request): Promise<Response> {
  const requestId = randomUUID();

  try {
    const body = await request.json();
    const parsed = schema.parse(body);
    const normalizedName = normalizeGuestValue(parsed.fullName);
    const created = await createInviteRequest({
      fullName: parsed.fullName,
      email: parsed.email || undefined,
      phone: parsed.phone || undefined,
      message: parsed.message || undefined
    });

    const storageBackend = hasDatabaseConfig() ? "database" : process.env.NODE_ENV === "development" ? "local-file" : "unconfigured";
    console.info("[api/invite-requests] Created invite request", {
      requestId,
      inviteRequestId: created.id,
      normalizedName,
      storageBackend
    });

    return NextResponse.json({ ok: true, id: created.id, requestId });
  } catch (error) {
    if (error instanceof z.ZodError) {
      console.error("[api/invite-requests] Invalid payload.", { requestId, details: error.flatten() });
      return NextResponse.json({ error: "Invalid payload", requestId, details: error.flatten() }, { status: 400 });
    }

    if (error instanceof Error && error.message.includes("Invite request persistence requires DATABASE_URL")) {
      console.error("[api/invite-requests] Persistence is not configured.", { requestId, message: error.message });
      return NextResponse.json(
        { error: "Invite request persistence is not configured. Set DATABASE_URL.", requestId },
        { status: 503 }
      );
    }

    console.error("[api/invite-requests] Failed to create invite request.", { requestId, error });
    return NextResponse.json({ error: "Failed to send invite request", requestId }, { status: 500 });
  }
}
