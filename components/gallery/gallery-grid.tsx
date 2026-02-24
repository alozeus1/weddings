"use client";

import Image from "next/image";
import { useState } from "react";

const galleryItems = [
  "/images/couple/jessica-veil-portrait.jpg",
  "/images/couple/jessica-bridal-chair.jpg",
  "/images/couple/jessica-closeup-earrings.jpg",
  "https://images.unsplash.com/photo-1523438885200-e635ba2c371e?auto=format&fit=crop&w=1200&q=80",
  "https://images.unsplash.com/photo-1519225421980-715cb0215aed?auto=format&fit=crop&w=1200&q=80",
  "https://images.unsplash.com/photo-1537633552985-df8429e8048b?auto=format&fit=crop&w=1200&q=80"
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
