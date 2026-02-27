import { NextResponse } from "next/server";
import { z } from "zod";
import { getConfiguredPassphrase, isPassphraseValid } from "@/lib/rsvp-passphrase";
import { updateGuestRSVP } from "@/lib/storage";

const schema = z.object({
  guestId: z.string().min(1),
  passphrase: z.string().min(1),
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
});

export async function POST(request: Request): Promise<Response> {
  try {
    const expectedPassphrase = getConfiguredPassphrase(process.env.RSVP_PASSPHRASE);
    if (!expectedPassphrase) {
      console.error("[api/rsvp] RSVP_PASSPHRASE is not configured.");
      return NextResponse.json({ error: "RSVP passphrase is not configured on the server" }, { status: 500 });
    }

    const body = await request.json();
    const parsed = schema.parse(body);

    if (!isPassphraseValid(parsed.passphrase, expectedPassphrase)) {
      return NextResponse.json({ error: "passphrase_mismatch" }, { status: 401 });
    }

    const updated = await updateGuestRSVP(parsed.guestId, {
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
