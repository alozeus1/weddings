import { NextResponse } from "next/server";
import { getCloudinaryAdminAuthHeader, getCloudinaryConfig, isApprovalRequired } from "@/lib/cloudinary";
import type { UploadRecord } from "@/types/content";

type CloudinarySearchResource = {
  asset_id: string;
  public_id: string;
  secure_url: string;
  created_at: string;
  tags?: string[];
  context?: {
    custom?: {
      uploaded_by?: string;
    };
  };
};

type CloudinarySearchResponse = {
  resources?: CloudinarySearchResource[];
  next_cursor?: string;
};

function toUploadRecord(resource: CloudinarySearchResource): UploadRecord {
  const tags = resource.tags || [];
  return {
    id: resource.asset_id || resource.public_id,
    url: resource.secure_url,
    uploadedByName: resource.context?.custom?.uploaded_by || null,
    createdAt: new Date(resource.created_at).toISOString(),
    status: tags.includes("approved") ? "approved" : "pending"
  };
}

function buildExpression(folder: string, requireApproval: boolean): string {
  const clauses = [`resource_type:image`, `folder="${folder}"`];
  if (requireApproval) {
    clauses.push(`tags="approved"`);
  }

  return clauses.join(" AND ");
}

export async function GET(request: Request): Promise<Response> {
  const config = getCloudinaryConfig();
  if (!config) {
    return NextResponse.json({ uploads: [], nextCursor: null });
  }

  const { searchParams } = new URL(request.url);
  const nextCursor = searchParams.get("next_cursor") || undefined;
  const requestedLimit = Number(searchParams.get("limit") || "30");
  const limit = Number.isFinite(requestedLimit) ? Math.min(Math.max(requestedLimit, 1), 30) : 30;
  const requireApproval = isApprovalRequired();

  const response = await fetch(`https://api.cloudinary.com/v1_1/${config.cloudName}/resources/search`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: getCloudinaryAdminAuthHeader(config)
    },
    body: JSON.stringify({
      expression: buildExpression(config.folder, requireApproval),
      sort_by: [{ created_at: "desc" }],
      max_results: limit,
      next_cursor: nextCursor,
      with_field: ["context", "tags"]
    }),
    cache: "no-store"
  });

  if (!response.ok) {
    return NextResponse.json({ error: "Failed to fetch live uploads" }, { status: 502 });
  }

  const data = (await response.json()) as CloudinarySearchResponse;
  const uploads = (data.resources || []).map(toUploadRecord);

  return NextResponse.json({
    uploads,
    nextCursor: data.next_cursor || null
  });
}
