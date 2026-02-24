import { NextResponse } from "next/server";
import { approveUpload } from "@/lib/storage";

export async function POST(request: Request, context: { params: Promise<{ id: string }> }): Promise<Response> {
  const expectedPassword = process.env.ADMIN_UPLOAD_PASSWORD;
  const providedPassword = request.headers.get("x-admin-password");

  if (!expectedPassword || providedPassword !== expectedPassword) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await context.params;
  await approveUpload(id);

  return NextResponse.json({ ok: true });
}
