import { NextResponse } from "next/server";
import { z } from "zod";
import { createInviteRequest } from "@/lib/storage";

const schema = z.object({
  fullName: z.string().min(2),
  email: z.string().email().optional().or(z.literal("")),
  phone: z.string().optional().or(z.literal("")),
  message: z.string().max(500).optional().or(z.literal(""))
});

export async function POST(request: Request): Promise<Response> {
  try {
    const body = await request.json();
    const parsed = schema.parse(body);
    const created = await createInviteRequest({
      fullName: parsed.fullName,
      email: parsed.email || undefined,
      phone: parsed.phone || undefined,
      message: parsed.message || undefined
    });

    return NextResponse.json({ ok: true, id: created.id });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: "Invalid payload", details: error.flatten() }, { status: 400 });
    }

    console.error("[api/invite-requests] Failed to create invite request.", error);
    return NextResponse.json({ error: "Failed to send invite request" }, { status: 500 });
  }
}
