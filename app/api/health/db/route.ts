import { NextResponse } from "next/server";
import { hasDatabaseConfig, sql } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function GET(): Promise<Response> {
  if (!hasDatabaseConfig()) {
    return NextResponse.json(
      { ok: false, error: "DATABASE_URL is not configured (fallbacks: POSTGRES_URL, NEON_DATABASE_URL)." },
      { status: 500 }
    );
  }

  try {
    await sql`SELECT 1 as ok`;
    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("[api/health/db] Database health check failed.", error);
    return NextResponse.json({ ok: false, error: "Database health check failed" }, { status: 500 });
  }
}
