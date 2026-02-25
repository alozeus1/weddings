import { NextResponse } from "next/server";
import {
  ALLOWED_UPLOAD_FORMATS,
  createCloudinarySignature,
  getCloudinaryConfig,
  sanitizeUploadedByName
} from "@/lib/cloudinary";

type RateLimitEntry = {
  count: number;
  windowStart: number;
};

const RATE_LIMIT_WINDOW_MS = 60_000;
const MAX_UPLOAD_SIGNATURES_PER_MINUTE = 10;

declare global {
  // eslint-disable-next-line no-var
  var cloudinarySignRateLimit: Map<string, RateLimitEntry> | undefined;
}

function getClientIp(request: Request): string {
  const forwardedFor = request.headers.get("x-forwarded-for");
  if (forwardedFor) {
    return forwardedFor.split(",")[0]?.trim() || "unknown";
  }

  return request.headers.get("x-real-ip") || "unknown";
}

function isRateLimited(ip: string): boolean {
  const now = Date.now();
  const map = globalThis.cloudinarySignRateLimit || new Map<string, RateLimitEntry>();
  globalThis.cloudinarySignRateLimit = map;

  const current = map.get(ip);
  if (!current || now - current.windowStart >= RATE_LIMIT_WINDOW_MS) {
    map.set(ip, { count: 1, windowStart: now });
    return false;
  }

  if (current.count >= MAX_UPLOAD_SIGNATURES_PER_MINUTE) {
    return true;
  }

  map.set(ip, { ...current, count: current.count + 1 });
  return false;
}

export async function POST(request: Request): Promise<Response> {
  const config = getCloudinaryConfig();
  if (!config) {
    return NextResponse.json({ error: "Cloudinary is not configured" }, { status: 500 });
  }

  const clientIp = getClientIp(request);
  if (isRateLimited(clientIp)) {
    return NextResponse.json({ error: "Too many upload attempts. Please try again shortly." }, { status: 429 });
  }

  let uploadedByName: string | null = null;

  try {
    const body = (await request.json()) as { uploadedByName?: string };
    uploadedByName = sanitizeUploadedByName(body.uploadedByName);
  } catch {
    uploadedByName = null;
  }

  const timestamp = Math.floor(Date.now() / 1000);
  const allowedFormats = ALLOWED_UPLOAD_FORMATS.join(",");
  const tags = "live-upload,pending";

  const signaturePayload: Record<string, string | number> = {
    folder: config.folder,
    timestamp,
    allowed_formats: allowedFormats,
    tags
  };

  if (uploadedByName) {
    signaturePayload.context = `uploaded_by=${uploadedByName}`;
  }

  const signature = createCloudinarySignature(signaturePayload, config.apiSecret);

  return NextResponse.json({
    signature,
    timestamp,
    folder: config.folder,
    apiKey: config.apiKey,
    cloudName: config.cloudName,
    tags,
    allowedFormats,
    context: signaturePayload.context || null
  });
}
