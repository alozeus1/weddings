import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(request: NextRequest): NextResponse {
  const pathname = request.nextUrl.pathname;
  const isUploadsRoute = pathname.startsWith("/admin/uploads");
  const isRsvpRoute = pathname.startsWith("/admin/rsvps");
  const isRsvpApiRoute = pathname.startsWith("/api/admin/invite-requests");

  if (!isUploadsRoute && !isRsvpRoute && !isRsvpApiRoute) {
    return NextResponse.next();
  }

  const password = isUploadsRoute ? process.env.ADMIN_UPLOAD_PASSWORD : process.env.ADMIN_PASSWORD;
  const realm = isUploadsRoute ? "Upload Moderation" : "RSVP Dashboard";

  if (!password) {
    return NextResponse.next();
  }

  const authHeader = request.headers.get("authorization") || "";
  if (!authHeader.startsWith("Basic ")) {
    return new NextResponse("Authentication required", {
      status: 401,
      headers: {
        "WWW-Authenticate": `Basic realm="${realm}"`
      }
    });
  }

  const decoded = Buffer.from(authHeader.slice(6), "base64").toString("utf-8");
  const [, providedPassword] = decoded.split(":");

  if (providedPassword !== password) {
    return new NextResponse("Invalid credentials", {
      status: 401,
      headers: {
        "WWW-Authenticate": `Basic realm="${realm}"`
      }
    });
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/uploads", "/admin/rsvps/:path*", "/api/admin/invite-requests/:path*"]
};
