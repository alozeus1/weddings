"use client";

import Image from "next/image";
import { useState } from "react";

const galleryItems = [
  "/images/placeholders/gallery-1.jpg",
  "/images/placeholders/gallery-2.jpg",
  "/images/placeholders/gallery-3.jpg",
  "/images/placeholders/gallery-4.jpg",
  "/images/placeholders/gallery-5.jpg",
  "/images/placeholders/gallery-6.jpg"
];

export function GalleryGrid(): React.JSX.Element {
  const [activeImage, setActiveImage] = useState<string | null>(null);

  return (
    <>
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
        {galleryItems.map((src) => (
          <button key={src} type="button" onClick={() => setActiveImage(src)} className="group relative overflow-hidden rounded-xl2">
            <div className="relative aspect-[4/5]">
              <Image src={src} alt="Wedding moment" fill className="object-cover transition duration-300 group-hover:scale-105" />
            </div>
          </button>
        ))}
      </div>

      {activeImage ? (
        <div className="fixed inset-0 z-50 grid place-items-center bg-ink/80 p-4" role="dialog" aria-modal="true">
          <button className="absolute right-4 top-4 rounded bg-white/20 px-3 py-1 text-white" onClick={() => setActiveImage(null)}>
            Close
          </button>
          <div className="relative h-[80vh] w-full max-w-3xl">
            <Image src={activeImage} alt="Full image" fill className="object-contain" />
          </div>
        </div>
      ) : null}
    </>
  );
}
