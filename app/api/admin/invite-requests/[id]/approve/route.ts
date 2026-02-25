import { NextResponse } from "next/server";
import { isAdminAuthorizedRequest, unauthorizedAdminResponse } from "@/lib/admin-auth";
import { approveInviteRequest } from "@/lib/storage";

export async function POST(request: Request, context: { params: Promise<{ id: string }> }): Promise<Response> {
  try {
    if (!isAdminAuthorizedRequest(request)) {
      return unauthorizedAdminResponse();
    }

    const { id } = await context.params;
    const approved = await approveInviteRequest(id);
    if (!approved) {
      return NextResponse.json({ error: "Invite request not found" }, { status: 404 });
    }

    return NextResponse.json({
      ok: true,
      request: approved.request,
      guest: approved.guest
    });
  } catch (error) {
    console.error("[api/admin/invite-requests/:id/approve] Failed to approve invite request.", error);
    return NextResponse.json({ error: "Failed to approve invite request" }, { status: 500 });
  }
}
