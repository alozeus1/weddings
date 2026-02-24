import { NextResponse } from "next/server";
import { z } from "zod";
import { createId } from "@/lib/utils";
import { saveRSVP } from "@/lib/storage";

const schema = z.object({
  name: z.string().min(2),
  email: z.string().email(),
  phone: z.string().min(5),
  attending: z.enum(["yes", "no"]),
  plusOneName: z.string().optional().default(""),
  mealCategory: z.string().optional().default(""),
  protein: z.string().optional().default(""),
  soup: z.string().optional().default(""),
  dietary: z.string().optional().default(""),
  message: z.string().optional().default("")
});

export async function POST(request: Request): Promise<Response> {
  try {
    const body = await request.json();
    const parsed = schema.parse(body);

    await saveRSVP({
      id: createId("rsvp"),
      name: parsed.name,
      email: parsed.email,
      phone: parsed.phone,
      attending: parsed.attending === "yes",
      plusOneName: parsed.plusOneName,
      mealCategory: parsed.mealCategory,
      protein: parsed.protein,
      soup: parsed.soup,
      dietary: parsed.dietary,
      message: parsed.message,
      createdAt: new Date().toISOString()
    });

    return NextResponse.json({ ok: true });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: "Invalid payload", details: error.flatten() }, { status: 400 });
    }

    return NextResponse.json({ error: "Failed to save RSVP" }, { status: 500 });
  }
}
