import { listGuestRSVPs } from "@/lib/storage";

function getPasswordFromAuthorizationHeader(authorization: string): string | null {
  if (!authorization.startsWith("Basic ")) {
    return null;
  }

  const decoded = Buffer.from(authorization.slice(6), "base64").toString("utf-8");
  const [, password] = decoded.split(":");
  return password || null;
}

function escapeCsv(value: string | null): string {
  if (!value) {
    return "";
  }

  return `"${value.replace(/"/g, "\"\"")}"`;
}

export async function GET(request: Request): Promise<Response> {
  const expectedPassword = process.env.ADMIN_PASSWORD || "";
  if (!expectedPassword) {
    return new Response("ADMIN_PASSWORD is not configured.", { status: 503 });
  }

  const authorization = request.headers.get("authorization") || "";
  const providedPassword = getPasswordFromAuthorizationHeader(authorization);
  if (providedPassword !== expectedPassword) {
    return new Response("Unauthorized", {
      status: 401,
      headers: {
        "WWW-Authenticate": 'Basic realm="RSVP Dashboard"'
      }
    });
  }

  const guests = await listGuestRSVPs();
  const header = ["name", "status", "mealCategory", "protein", "soup", "plusOneName", "dietary", "message", "updatedAt"];
  const rows = guests.map((guest) =>
    [
      escapeCsv(guest.fullName),
      escapeCsv(guest.status),
      escapeCsv(guest.mealCategory),
      escapeCsv(guest.protein),
      escapeCsv(guest.soup),
      escapeCsv(guest.plusOneName),
      escapeCsv(guest.dietary),
      escapeCsv(guest.message),
      escapeCsv(guest.updatedAt)
    ].join(",")
  );

  const csv = [header.join(","), ...rows].join("\n");
  return new Response(csv, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": 'attachment; filename="rsvps.csv"'
    }
  });
}
