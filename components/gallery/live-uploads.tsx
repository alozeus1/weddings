"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import type { UploadRecord } from "@/types/content";

export function LiveUploads({ includePending = false }: { includePending?: boolean }): React.JSX.Element {
  const [items, setItems] = useState<UploadRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [hasMore, setHasMore] = useState(false);
  const [page, setPage] = useState(1);

  useEffect(() => {
    setLoading(true);
    setPage(1);
    const query = includePending ? "?status=all" : "";
    fetch(`/api/uploads${query}${query ? "&" : "?"}page=1&limit=8`)
      .then((res) => res.json())
      .then((data: { uploads: UploadRecord[]; hasMore: boolean }) => {
        setItems(data.uploads);
        setHasMore(data.hasMore);
      })
      .catch(() => setItems([]))
      .finally(() => setLoading(false));
  }, [includePending]);

  async function loadMore(): Promise<void> {
    const nextPage = page + 1;
    const query = includePending ? "?status=all" : "";
    const response = await fetch(`/api/uploads${query}${query ? "&" : "?"}page=${nextPage}&limit=8`);
    const data = (await response.json()) as { uploads: UploadRecord[]; hasMore: boolean };
    setItems((current) => [...current, ...data.uploads]);
    setHasMore(data.hasMore);
    setPage(nextPage);
  }

  if (loading) {
    return <p className="text-sm text-ink/70">Loading live uploads...</p>;
  }

  if (!items.length) {
    return <p className="text-sm text-ink/70">No approved uploads yet. Be the first to share a moment.</p>;
  }

  return (
    <div className="space-y-5">
      <div className="grid grid-cols-2 gap-3 md:grid-cols-3 lg:grid-cols-4">
        {items.map((item) => (
          <article key={item.id} className="overflow-hidden rounded-xl2 border border-gold-300/40 bg-white">
            <div className="relative aspect-square">
              <Image src={item.url} alt="Guest upload" fill className="object-cover" />
            </div>
            <div className="p-3">
              <p className="text-xs uppercase tracking-[0.2em] text-gold-600">
                {item.uploadedByName || "Guest"}
              </p>
              <p className="mt-1 text-xs text-ink/60">{new Date(item.createdAt).toLocaleDateString()}</p>
            </div>
          </article>
        ))}
      </div>
      {hasMore ? (
        <button
          type="button"
          onClick={loadMore}
          className="rounded-md border border-gold-300/60 px-4 py-2 text-xs font-semibold uppercase tracking-[0.2em] text-ink"
        >
          Load More
        </button>
      ) : null}
    </div>
  );
}
