import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(request: NextRequest): NextResponse {
  if (!request.nextUrl.pathname.startsWith("/admin/uploads")) {
    return NextResponse.next();
  }

  const password = process.env.ADMIN_UPLOAD_PASSWORD;
  if (!password) {
    return NextResponse.next();
  }

  const authHeader = request.headers.get("authorization") || "";
  if (!authHeader.startsWith("Basic ")) {
    return new NextResponse("Authentication required", {
      status: 401,
      headers: {
        "WWW-Authenticate": 'Basic realm="Upload Moderation"'
      }
    });
  }

  const decoded = Buffer.from(authHeader.slice(6), "base64").toString("utf-8");
  const [, providedPassword] = decoded.split(":");

  if (providedPassword !== password) {
    return new NextResponse("Invalid credentials", {
      status: 401,
      headers: {
        "WWW-Authenticate": 'Basic realm="Upload Moderation"'
      }
    });
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/uploads"]
};
