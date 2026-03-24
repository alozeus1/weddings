import { GalleryGrid } from "@/components/gallery/gallery-grid";
import { LiveUploads } from "@/components/gallery/live-uploads";
import { PageHero } from "@/components/sections/page-hero";
import { Section } from "@/components/sections/section";
import { getRandomizedGalleryImages, heroImages } from "@/lib/media";

export const dynamic = "force-dynamic";

export default function GalleryPage(): React.JSX.Element {
  const randomizedGalleryImages = getRandomizedGalleryImages();

  return (
    <>
      <PageHero
        kicker="Gallery"
        title="Cinematic Moments"
        subtitle="A curated gallery plus live uploads from guests on the wedding day."
        heroImage={heroImages.gallery}
      />
      <Section title="Curated Gallery" kicker="Desktop + Mobile">
        <GalleryGrid images={randomizedGalleryImages} />
      </Section>
      <Section title="Live Uploads" kicker="Moderated">
        <LiveUploads />
      </Section>
    </>
  );
}
