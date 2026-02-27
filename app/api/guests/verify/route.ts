import { randomUUID } from "node:crypto";
import { NextResponse } from "next/server";
import { z } from "zod";
import { getDatabaseDebugMeta } from "@/lib/db";
import { getConfiguredPassphrase, isPassphraseValid, summarizePassphrase } from "@/lib/rsvp-passphrase";
import { getGuestById } from "@/lib/storage";

const schema = z.object({
  guestId: z.string().min(1),
  passphrase: z.string().min(1),
  // Option A scaffold for future identity checks.
  email: z.string().email().optional(),
  phoneLast4: z.string().regex(/^\d{4}$/).optional()
});

const isProduction = process.env.NODE_ENV === "production";
const shouldLogDiagnostics = process.env.RSVP_DEBUG === "1" || !isProduction;

function logDiagnostic(level: "info" | "warn" | "error", message: string, meta: Record<string, unknown>): void {
  if (!shouldLogDiagnostics) {
    return;
  }

  if (level === "error") {
    console.error(message, meta);
    return;
  }

  if (level === "warn") {
    console.warn(message, meta);
    return;
  }

  console.info(message, meta);
}

function verificationFailure(reason: "invitation_not_found" | "passphrase_mismatch"): Response {
  if (isProduction) {
    return NextResponse.json({ success: false, code: "verification_failed" }, { status: 401 });
  }

  const status = reason === "invitation_not_found" ? 404 : 401;
  return NextResponse.json({ success: false, code: reason }, { status });
}

export async function POST(request: Request): Promise<Response> {
  const requestId = randomUUID().slice(0, 8);
  try {
    const expectedPassphrase = getConfiguredPassphrase(process.env.RSVP_PASSPHRASE);
    const dbMeta = getDatabaseDebugMeta();
    if (!expectedPassphrase) {
      logDiagnostic("error", "[api/guests/verify] passphrase_not_configured", {
        requestId,
        nodeEnv: process.env.NODE_ENV ?? "unknown",
        dbHasUrl: dbMeta.hasUrl,
        dbSource: dbMeta.source,
        dbHost: dbMeta.host
      });
      return NextResponse.json({ success: false, error: "RSVP passphrase is not configured on the server" }, { status: 500 });
    }

    const body = await request.json();
    const parsed = schema.parse(body);
    const passphraseSummary = summarizePassphrase(parsed.passphrase);
    logDiagnostic("info", "[api/guests/verify] request_received", {
      requestId,
      payloadKeys: Object.keys(parsed),
      guestId: parsed.guestId,
      passphraseLength: passphraseSummary.length,
      passphraseHashPrefix: passphraseSummary.hashPrefix,
      nodeEnv: process.env.NODE_ENV ?? "unknown",
      dbHasUrl: dbMeta.hasUrl,
      dbSource: dbMeta.source,
      dbHost: dbMeta.host
    });

    const guest = await getGuestById(parsed.guestId);
    if (!guest) {
      logDiagnostic("warn", "[api/guests/verify] invitation_not_found", {
        requestId,
        guestId: parsed.guestId
      });
      return verificationFailure("invitation_not_found");
    }
    logDiagnostic("info", "[api/guests/verify] invitation_found", {
      requestId,
      guestId: parsed.guestId,
      guestStatus: guest.status
    });

    const success = isPassphraseValid(parsed.passphrase, expectedPassphrase);
    if (!success) {
      logDiagnostic("warn", "[api/guests/verify] passphrase_mismatch", {
        requestId,
        guestId: parsed.guestId,
        expectedLength: expectedPassphrase.length,
        expectedHashPrefix: summarizePassphrase(expectedPassphrase).hashPrefix
      });
      return verificationFailure("passphrase_mismatch");
    }

    logDiagnostic("info", "[api/guests/verify] verification_success", {
      requestId,
      guestId: parsed.guestId
    });
    return NextResponse.json({ success: true });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ success: false, error: "Invalid payload", details: error.flatten() }, { status: 400 });
    }

    logDiagnostic("error", "[api/guests/verify] verify_failed", {
      requestId,
      message: error instanceof Error ? error.message : "Unknown error"
    });
    return NextResponse.json({ success: false, error: "Verification failed" }, { status: 500 });
  }
}
