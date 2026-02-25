function parseBasicPassword(authorization: string): string | null {
  if (!authorization.startsWith("Basic ")) {
    return null;
  }

  const decoded = Buffer.from(authorization.slice(6), "base64").toString("utf-8");
  const [, password] = decoded.split(":");
  return password || null;
}

export function isAdminAuthorizedRequest(request: Request): boolean {
  const expected = process.env.ADMIN_PASSWORD || "";
  if (!expected) {
    return false;
  }

  const viaHeader = request.headers.get("x-admin-password");
  if (viaHeader && viaHeader === expected) {
    return true;
  }

  const viaBasicAuth = parseBasicPassword(request.headers.get("authorization") || "");
  return viaBasicAuth === expected;
}

export function unauthorizedAdminResponse(): Response {
  return new Response("Unauthorized", {
    status: 401,
    headers: {
      "WWW-Authenticate": 'Basic realm="RSVP Dashboard"'
    }
  });
}
