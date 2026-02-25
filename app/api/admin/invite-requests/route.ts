import { randomUUID } from "node:crypto";
import { NextResponse } from "next/server";
import { isAdminAuthorizedRequest, unauthorizedAdminResponse } from "@/lib/admin-auth";
import { listInviteRequests } from "@/lib/storage";

export const dynamic = "force-dynamic";

export async function GET(request: Request): Promise<Response> {
  const requestId = randomUUID();

  try {
    if (!isAdminAuthorizedRequest(request)) {
      return unauthorizedAdminResponse();
    }

    const { searchParams } = new URL(request.url);
    const statusParam = searchParams.get("status");
    const status = statusParam === "pending" || statusParam === "approved" || statusParam === "rejected" ? statusParam : "all";
    const requests = await listInviteRequests(status);
    console.info("[api/admin/invite-requests] Returning invite requests", { requestId, status, count: requests.length });
    return NextResponse.json({ requests, requestId }, { headers: { "Cache-Control": "no-store" } });
  } catch (error) {
    console.error("[api/admin/invite-requests] Failed to list invite requests.", { requestId, error });
    return NextResponse.json({ error: "Failed to list invite requests", requestId }, { status: 500 });
  }
}
