import { timingSafeEqual } from "node:crypto";
import { NextResponse } from "next/server";
import { z } from "zod";
import { getGuestById } from "@/lib/storage";

const schema = z.object({
  guestId: z.string().min(1),
  passphrase: z.string().min(1),
  // Option A scaffold for future identity checks.
  email: z.string().email().optional(),
  phoneLast4: z.string().regex(/^\d{4}$/).optional()
});

function isPassphraseValid(input: string, expected: string): boolean {
  const inputBuffer = Buffer.from(input);
  const expectedBuffer = Buffer.from(expected);
  if (inputBuffer.length !== expectedBuffer.length) {
    return false;
  }

  return timingSafeEqual(inputBuffer, expectedBuffer);
}

export async function POST(request: Request): Promise<Response> {
  try {
    const body = await request.json();
    const parsed = schema.parse(body);
    const guest = await getGuestById(parsed.guestId);
    if (!guest) {
      return NextResponse.json({ success: false }, { status: 404 });
    }

    const expectedPassphrase = process.env.RSVP_PASSPHRASE || "JC2026";
    const success = isPassphraseValid(parsed.passphrase, expectedPassphrase);
    return NextResponse.json({ success });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ success: false, error: "Invalid payload", details: error.flatten() }, { status: 400 });
    }

    return NextResponse.json({ success: false, error: "Verification failed" }, { status: 500 });
  }
}
