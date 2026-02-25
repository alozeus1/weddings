import { NextResponse } from "next/server";
import { searchGuests } from "@/lib/storage";

const MAX_REQUESTS_PER_MINUTE = 20;
const WINDOW_MS = 60_000;

const requestLog = new Map<string, number[]>();

function getRequestIp(request: Request): string {
  const forwardedFor = request.headers.get("x-forwarded-for");
  if (forwardedFor) {
    return forwardedFor.split(",")[0]?.trim() || "unknown";
  }

  return request.headers.get("x-real-ip") || "unknown";
}

function isRateLimited(ip: string): boolean {
  const now = Date.now();
  const recent = (requestLog.get(ip) || []).filter((timestamp) => now - timestamp < WINDOW_MS);
  if (recent.length >= MAX_REQUESTS_PER_MINUTE) {
    requestLog.set(ip, recent);
    return true;
  }

  recent.push(now);
  requestLog.set(ip, recent);

  if (requestLog.size > 500) {
    for (const [key, values] of requestLog.entries()) {
      const filtered = values.filter((timestamp) => now - timestamp < WINDOW_MS);
      if (filtered.length === 0) {
        requestLog.delete(key);
      } else {
        requestLog.set(key, filtered);
      }
    }
  }

  return false;
}

export async function GET(request: Request): Promise<Response> {
  const ip = getRequestIp(request);
  if (isRateLimited(ip)) {
    return NextResponse.json({ error: "Too many search requests" }, { status: 429 });
  }

  const { searchParams } = new URL(request.url);
  const query = (searchParams.get("q") || "").trim();
  if (query.length < 2) {
    return NextResponse.json({ results: [] });
  }

  const results = await searchGuests(query);
  return NextResponse.json({ results });
}
