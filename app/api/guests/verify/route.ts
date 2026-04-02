import { NextResponse } from "next/server";
import { z } from "zod";
import { isValidPhone } from "@/lib/phone";
import { getGuestById } from "@/lib/storage";

const schema = z.object({
  guestId: z.string().min(1),
  // Option A scaffold for future identity checks.
  email: z.string().email().optional(),
  phone: z.string().optional(),
  phoneLast4: z.string().regex(/^\d{4}$/).optional()
}).superRefine((input, ctx) => {
  if (input.phone && !isValidPhone(input.phone)) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: "Phone number must include 10 to 15 digits.",
      path: ["phone"]
    });
  }
});

export async function POST(request: Request): Promise<Response> {
  try {
    const body = await request.json();
    const parsed = schema.parse(body);
    const guest = await getGuestById(parsed.guestId);

    if (!guest) {
      return NextResponse.json({ success: false, code: "invitation_not_found" });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ success: false, error: "Invalid payload", details: error.flatten() }, { status: 400 });
    }

    console.error("[api/guests/verify] verify_failed", error);
    return NextResponse.json({ success: false, error: "Verification failed" }, { status: 500 });
  }
}
