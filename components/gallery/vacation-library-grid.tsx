"use client";

import Image from "next/image";
import { useState } from "react";
import { getImageObjectPosition } from "@/lib/media";
import { cn } from "@/lib/utils";

type VacationLibraryGridProps = {
  images: readonly string[];
};

const tilePattern = [
  "sm:col-span-2 sm:row-span-2",
  "",
  "sm:row-span-2",
  "",
  "lg:col-span-2",
  "",
  "sm:col-span-2",
  "lg:row-span-2",
  "",
  "lg:col-span-2",
  "",
  "sm:row-span-2"
];

export function VacationLibraryGrid({ images }: VacationLibraryGridProps): React.JSX.Element {
  const [activeIndex, setActiveIndex] = useState<number | null>(null);
  const activeImage = activeIndex === null ? null : images[activeIndex];
  const activeFrameLabel = activeIndex === null ? null : String(activeIndex + 1).padStart(2, "0");

  return (
    <>
      <div className="grid auto-rows-[180px] grid-cols-1 gap-4 sm:grid-cols-2 lg:auto-rows-[210px] lg:grid-cols-4">
        {images.map((src, index) => (
          <button
            key={src}
            type="button"
            onClick={() => setActiveIndex(index)}
            className={cn(
              "group relative overflow-hidden rounded-[1.75rem] border border-gold-300/35 bg-white shadow-card transition-transform duration-300 hover:-translate-y-1",
              tilePattern[index % tilePattern.length]
            )}
          >
            <Image
              src={src}
              alt={`Vacation memory ${index + 1}`}
              fill
              sizes="(min-width: 1024px) 25vw, (min-width: 640px) 50vw, 100vw"
              className="object-cover transition duration-500 group-hover:scale-[1.04]"
              style={getImageObjectPosition(src, "gallery") ? { objectPosition: getImageObjectPosition(src, "gallery") } : undefined}
            />
            <div className="absolute inset-0 bg-gradient-to-t from-ink/42 via-transparent to-transparent opacity-90" />
            <div className="absolute bottom-4 left-4 flex items-center gap-2">
              <span className="rounded-full border border-white/45 bg-white/18 px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.28em] text-white backdrop-blur-md">
                Memory {String(index + 1).padStart(2, "0")}
              </span>
            </div>
          </button>
        ))}
      </div>

      {activeImage ? (
        <div className="fixed inset-0 z-50 bg-ink/82 p-4 backdrop-blur-sm sm:p-6" role="dialog" aria-modal="true">
          <div className="mx-auto grid h-full w-full max-w-6xl gap-5 rounded-[2rem] border border-white/15 bg-ink/55 p-4 shadow-[0_32px_120px_rgba(8,6,3,0.42)] lg:grid-cols-[minmax(0,1.2fr)_22rem] lg:p-6">
            <div className="relative min-h-[52vh] overflow-hidden rounded-[1.5rem] border border-white/10 bg-black/20">
              <Image src={activeImage} alt="Expanded vacation memory" fill sizes="100vw" className="object-contain" />
            </div>

            <div className="flex flex-col justify-between gap-6 rounded-[1.5rem] border border-white/10 bg-white/8 p-5 text-white">
              <div className="space-y-4">
                <p className="text-[11px] uppercase tracking-[0.32em] text-gold-200/85">Vacation Library</p>
                <div className="space-y-3">
                  <h3 className="font-display text-3xl text-white">Shared miles, soft light, and the in-between moments.</h3>
                  <p className="text-sm leading-7 text-white/78">
                    These are the frames that sat between planning, praying, and preparing for the wedding weekend. Little escapes,
                    warm-weather pauses, and snapshots that felt worth keeping.
                  </p>
                </div>
                <div className="rounded-[1.25rem] border border-white/12 bg-black/10 px-4 py-3">
                  <p className="text-[11px] uppercase tracking-[0.28em] text-gold-200/80">Frame</p>
                  <p className="mt-2 text-lg font-medium text-white">Vacation Memory {activeFrameLabel}</p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setActiveIndex(null)}
                className="rounded-full border border-white/18 bg-white/10 px-5 py-3 text-xs font-semibold uppercase tracking-[0.24em] text-white transition hover:bg-white/16"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
}
