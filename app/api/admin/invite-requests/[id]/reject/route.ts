import { NextResponse } from "next/server";
import { isAdminAuthorizedRequest, unauthorizedAdminResponse } from "@/lib/admin-auth";
import { rejectInviteRequest } from "@/lib/storage";

export async function POST(request: Request, context: { params: Promise<{ id: string }> }): Promise<Response> {
  try {
    if (!isAdminAuthorizedRequest(request)) {
      return unauthorizedAdminResponse();
    }

    const { id } = await context.params;
    const rejected = await rejectInviteRequest(id);
    if (!rejected) {
      return NextResponse.json({ error: "Invite request not found" }, { status: 404 });
    }

    return NextResponse.json({ ok: true, request: rejected });
  } catch (error) {
    console.error("[api/admin/invite-requests/:id/reject] Failed to reject invite request.", error);
    return NextResponse.json({ error: "Failed to reject invite request" }, { status: 500 });
  }
}
