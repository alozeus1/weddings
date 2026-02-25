import Image from "next/image";

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
              className="object-cover"
              style={objectPositions?.[index] ? { objectPosition: objectPositions[index] } : undefined}
            />
          </div>
        </div>
      ))}
    </div>
  );
}
