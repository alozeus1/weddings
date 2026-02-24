"use client";

import { useEffect, useState } from "react";
import type { UploadRecord } from "@/types/content";

type AdminUploadsProps = {
  adminPassword: string;
};

export function AdminUploads({ adminPassword }: AdminUploadsProps): React.JSX.Element {
  const [uploads, setUploads] = useState<UploadRecord[]>([]);

  useEffect(() => {
    fetch("/api/uploads?status=all", {
      headers: {
        "x-admin-password": adminPassword
      }
    })
      .then((response) => response.json())
      .then((data: { uploads: UploadRecord[] }) => setUploads(data.uploads));
  }, [adminPassword]);

  async function approve(id: string): Promise<void> {
    const response = await fetch(`/api/uploads/${id}/approve`, {
      method: "POST",
      headers: {
        "x-admin-password": adminPassword
      }
    });

    if (response.ok) {
      setUploads((current) => current.map((item) => (item.id === id ? { ...item, status: "approved" } : item)));
    }
  }

  if (!uploads.length) {
    return <p className="text-sm text-ink/70">No uploads yet.</p>;
  }

  return (
    <div className="space-y-3">
      {uploads.map((item) => (
        <article key={item.id} className="flex flex-col gap-3 rounded-xl border border-gold-300/50 bg-white/80 p-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="font-mono text-xs text-ink/70">{item.id}</p>
            <p className="text-sm text-ink">{item.uploadedByName || "Guest"}</p>
            <p className="text-xs uppercase tracking-[0.2em] text-gold-600">{item.status}</p>
          </div>
          {item.status === "pending" ? (
            <button
              type="button"
              className="rounded bg-gold-500 px-4 py-2 text-xs font-semibold uppercase tracking-[0.18em] text-ink"
              onClick={() => approve(item.id)}
            >
              Approve
            </button>
          ) : null}
        </article>
      ))}
    </div>
  );
}
