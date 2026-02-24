import { put } from "@vercel/blob";
import { NextResponse } from "next/server";
import { createId } from "@/lib/utils";
import { saveUpload } from "@/lib/storage";

export async function POST(request: Request): Promise<Response> {
  try {
    const formData = await request.formData();
    const file = formData.get("file");
    const uploadedByName = (formData.get("uploadedByName")?.toString() || "").trim();

    if (!(file instanceof File)) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    if (!file.type.startsWith("image/")) {
      return NextResponse.json({ error: "Only images are allowed" }, { status: 400 });
    }

    const id = createId("upload");
    let url = "/images/placeholders/live-upload-fallback.jpg";

    if (process.env.BLOB_READ_WRITE_TOKEN) {
      const blob = await put(`guest-uploads/${id}-${file.name}`, file, {
        access: "public",
        addRandomSuffix: true
      });
      url = blob.url;
    }

    await saveUpload({
      id,
      url,
      uploadedByName: uploadedByName || null,
      createdAt: new Date().toISOString(),
      status: "pending"
    });

    return NextResponse.json({ ok: true, id, url });
  } catch {
    return NextResponse.json({ error: "Upload failed" }, { status: 500 });
  }
}
