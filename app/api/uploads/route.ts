import { NextResponse } from "next/server";
import { listUploads } from "@/lib/storage";

export async function GET(request: Request): Promise<Response> {
  const { searchParams } = new URL(request.url);
  const includePending = searchParams.get("status") === "all";
  const adminPassword = request.headers.get("x-admin-password");
  if (includePending && process.env.ADMIN_UPLOAD_PASSWORD && adminPassword !== process.env.ADMIN_UPLOAD_PASSWORD) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const page = Number(searchParams.get("page") || "1");
  const limit = Number(searchParams.get("limit") || "12");
  const uploads = await listUploads(includePending);
  const start = Math.max((page - 1) * limit, 0);
  const paginated = uploads.slice(start, start + limit);
  const hasMore = start + limit < uploads.length;

  return NextResponse.json({ uploads: paginated, hasMore, page, total: uploads.length });
}
