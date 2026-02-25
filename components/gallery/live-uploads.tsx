"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import type { UploadRecord } from "@/types/content";

type LiveUploadsResponse = {
  uploads: UploadRecord[];
  nextCursor: string | null;
};

export function LiveUploads(): React.JSX.Element {
  const [items, setItems] = useState<UploadRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [nextCursor, setNextCursor] = useState<string | null>(null);
  const [isLoadingMore, setIsLoadingMore] = useState(false);

  async function fetchUploads(cursor?: string): Promise<LiveUploadsResponse> {
    const query = new URLSearchParams({ limit: "30" });
    if (cursor) {
      query.set("next_cursor", cursor);
    }

    const response = await fetch(`/api/cloudinary/live-uploads?${query.toString()}`, { cache: "no-store" });
    if (!response.ok) {
      throw new Error("Failed to load uploads");
    }

    return (await response.json()) as LiveUploadsResponse;
  }

  useEffect(() => {
    setLoading(true);
    fetchUploads()
      .then((data) => {
        setItems(data.uploads);
        setNextCursor(data.nextCursor);
      })
      .catch(() => {
        setItems([]);
        setNextCursor(null);
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);

  async function loadMore(): Promise<void> {
    if (!nextCursor) {
      return;
    }

    setIsLoadingMore(true);
    try {
      const data = await fetchUploads(nextCursor);
      setItems((current) => [...current, ...data.uploads]);
      setNextCursor(data.nextCursor);
    } finally {
      setIsLoadingMore(false);
    }
  }

  if (loading) {
    return <p className="text-sm text-ink/70">Loading live uploads...</p>;
  }

  if (!items.length) {
    return <p className="text-sm text-ink/70">No uploads yet.</p>;
  }

  return (
    <div className="space-y-5">
      <div className="grid grid-cols-2 gap-3 md:grid-cols-3 lg:grid-cols-4">
        {items.map((item) => (
          <article key={item.id} className="overflow-hidden rounded-xl2 border border-gold-300/40 bg-white" data-testid="live-upload-item">
            <div className="relative aspect-square">
              <Image src={item.url} alt="Guest upload" fill className="object-cover" />
            </div>
            <div className="p-3">
              <p className="text-xs uppercase tracking-[0.2em] text-gold-600">{item.uploadedByName || "Guest"}</p>
              <p className="mt-1 text-xs text-ink/60">{new Date(item.createdAt).toLocaleDateString()}</p>
            </div>
          </article>
        ))}
      </div>
      {nextCursor ? (
        <button
          type="button"
          onClick={loadMore}
          disabled={isLoadingMore}
          className="rounded-md border border-gold-300/60 px-4 py-2 text-xs font-semibold uppercase tracking-[0.2em] text-ink"
        >
          {isLoadingMore ? "Loading..." : "Load More"}
        </button>
      ) : null}
    </div>
  );
}
