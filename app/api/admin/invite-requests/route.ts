import { NextResponse } from "next/server";
import { isAdminAuthorizedRequest, unauthorizedAdminResponse } from "@/lib/admin-auth";
import { listInviteRequests } from "@/lib/storage";

export async function GET(request: Request): Promise<Response> {
  if (!isAdminAuthorizedRequest(request)) {
    return unauthorizedAdminResponse();
  }

  const { searchParams } = new URL(request.url);
  const statusParam = searchParams.get("status");
  const status = statusParam === "pending" || statusParam === "approved" || statusParam === "rejected" ? statusParam : "all";
  const requests = await listInviteRequests(status);
  return NextResponse.json({ requests });
}
