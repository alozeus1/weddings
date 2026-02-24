import Image from "next/image";

type PhotoMosaicProps = {
  images: string[];
};

export function PhotoMosaic({ images }: PhotoMosaicProps): React.JSX.Element {
  return (
    <div className="grid gap-3 sm:grid-cols-3">
      {images.map((src, index) => (
        <div key={src} className={`relative overflow-hidden rounded-xl2 border border-gold-300/40 ${index === 1 ? "sm:translate-y-4" : ""}`}>
          <div className="relative aspect-[4/5]">
            <Image src={src} alt="Wedding detail" fill className="object-cover" />
          </div>
        </div>
      ))}
    </div>
  );
}

