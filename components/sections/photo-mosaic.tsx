import Image from "next/image";
import { getImageObjectPosition } from "@/lib/media";

type PhotoMosaicProps = {
  images: string[];
  altTexts?: string[];
  objectPositions?: string[];
  testId?: string;
};

export function PhotoMosaic({ images, altTexts, objectPositions, testId }: PhotoMosaicProps): React.JSX.Element {
  return (
    <div className="grid gap-3 sm:grid-cols-3" data-testid={testId}>
      {images.map((src, index) => (
        <div key={src} className={`relative overflow-hidden rounded-xl2 border border-gold-300/40 ${index === 1 ? "sm:translate-y-4" : ""}`}>
          <div className="relative aspect-[4/5]">
            <Image
              src={src}
              alt={altTexts?.[index] ?? "Wedding detail image"}
              fill
              sizes="(min-width: 640px) 33vw, 100vw"
              className="object-cover"
              style={
                objectPositions?.[index] || getImageObjectPosition(src, "mosaic")
                  ? { objectPosition: objectPositions?.[index] ?? getImageObjectPosition(src, "mosaic") }
                  : undefined
              }
            />
          </div>
        </div>
      ))}
    </div>
  );
}
