import { NextResponse } from "next/server";
import { z } from "zod";
import { getOrCreateGuestByFullName, updateGuestRSVP } from "@/lib/storage";

const schema = z.object({
  guestId: z.string().min(1).optional(),
  fullName: z.string().min(2).optional(),
  // Option A scaffold: these become required once guest contact data is available.
  email: z.string().email().optional(),
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

    return NextResponse.json({ ok: true, status: updated.status });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: "Invalid payload", details: error.flatten() }, { status: 400 });
    }

    console.error("[api/rsvp] Failed to save RSVP.", error);
    return NextResponse.json({ error: "Failed to save RSVP" }, { status: 500 });
  }
}
