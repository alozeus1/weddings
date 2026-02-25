import { createHash } from "node:crypto";

export const DEFAULT_CLOUDINARY_FOLDER = "chibuike-jessica/live-uploads";
export const ALLOWED_UPLOAD_FORMATS = ["jpg", "jpeg", "png", "webp", "heic"] as const;

export type CloudinaryConfig = {
  cloudName: string;
  apiKey: string;
  apiSecret: string;
  folder: string;
};

export function getCloudinaryConfig(): CloudinaryConfig | null {
  const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
  const apiKey = process.env.CLOUDINARY_API_KEY;
  const apiSecret = process.env.CLOUDINARY_API_SECRET;
  const folder = process.env.CLOUDINARY_FOLDER || DEFAULT_CLOUDINARY_FOLDER;

  if (!cloudName || !apiKey || !apiSecret) {
    return null;
  }

  return {
    cloudName,
    apiKey,
    apiSecret,
    folder
  };
}

export function isApprovalRequired(): boolean {
  return process.env.LIVE_UPLOADS_REQUIRE_APPROVAL === "true";
}

export function sanitizeUploadedByName(name: unknown): string | null {
  if (typeof name !== "string") {
    return null;
  }

  const trimmed = name.trim();
  if (!trimmed) {
    return null;
  }

  return trimmed.replace(/[|=\n\r]/g, " ").slice(0, 80);
}

export function createCloudinarySignature(
  params: Record<string, string | number | boolean | undefined>,
  apiSecret: string
): string {
  const toSign = Object.keys(params)
    .sort()
    .flatMap((key) => {
      const value = params[key];
      if (value === undefined || value === null || value === "") {
        return [];
      }
      return `${key}=${value}`;
    })
    .join("&");

  return createHash("sha1").update(`${toSign}${apiSecret}`).digest("hex");
}

export function getCloudinaryAdminAuthHeader(config: CloudinaryConfig): string {
  const token = Buffer.from(`${config.apiKey}:${config.apiSecret}`).toString("base64");
  return `Basic ${token}`;
}
