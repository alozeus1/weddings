import { NextResponse } from "next/server";
import { z } from "zod";
import { sendRSVPConfirmationEmail } from "@/lib/rsvp-confirmation-email";
import { getOrCreateGuestByFullName, updateGuestRSVP } from "@/lib/storage";

const schema = z.object({
  guestId: z.string().min(1).optional(),
  fullName: z.string().min(2).optional(),
  email: z.string().email(),
  phoneLast4: z.string().regex(/^\d{4}$/).optional(),
  attending: z.enum(["yes", "no"]),
  plusOneEnabled: z.boolean().optional().default(false),
  plusOneName: z.string().optional().default(""),
  mealCategory: z.string().optional().default(""),
  protein: z.string().optional().default(""),
  soup: z.string().optional().default(""),
  dietary: z.string().optional().default(""),
  message: z.string().optional().default("")
})
.superRefine((input, ctx) => {
  if (!input.guestId && !input.fullName) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: "guestId or fullName is required",
      path: ["guestId"]
    });
  }
});

export async function POST(request: Request): Promise<Response> {
  try {
    const body = await request.json();
    const parsed = schema.parse(body);

    let guestId = parsed.guestId;
    if (!guestId && parsed.fullName) {
      const guest = await getOrCreateGuestByFullName(parsed.fullName, {
        email: parsed.email,
        phoneLast4: parsed.phoneLast4
      });
      guestId = guest.id;
    }

    if (!guestId) {
      return NextResponse.json({ error: "Invitation not found" }, { status: 404 });
    }

    const updated = await updateGuestRSVP(guestId, {
      status: parsed.attending,
      plusOneName: parsed.plusOneEnabled ? parsed.plusOneName : "",
      mealCategory: parsed.mealCategory,
      protein: parsed.protein,
      soup: parsed.soup,
      dietary: parsed.dietary,
      message: parsed.message,
      email: parsed.email,
      phoneLast4: parsed.phoneLast4
    });

    if (!updated) {
      return NextResponse.json({ error: "Invitation not found" }, { status: 404 });
    }

    let emailSent = false;
    try {
      const result = await sendRSVPConfirmationEmail({
        toEmail: parsed.email,
        guestName: updated.fullName
      });
      emailSent = result.sent;

      if (result.skipped) {
        console.warn("[api/rsvp] RSVP confirmation email skipped. Configure RESEND_API_KEY and RSVP_CONFIRMATION_FROM_EMAIL.");
      }
    } catch (emailError) {
      console.error("[api/rsvp] Failed to send RSVP confirmation email.", emailError);
    }

    return NextResponse.json({ ok: true, status: updated.status, emailSent });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: "Invalid payload", details: error.flatten() }, { status: 400 });
    }

    console.error("[api/rsvp] Failed to save RSVP.", error);
    return NextResponse.json({ error: "Failed to save RSVP" }, { status: 500 });
  }
}
