import { GalleryGrid } from "@/components/gallery/gallery-grid";
import { LiveUploads } from "@/components/gallery/live-uploads";
import { PageHero } from "@/components/sections/page-hero";
import { Section } from "@/components/sections/section";
import { heroImages } from "@/lib/media";

export default function GalleryPage(): React.JSX.Element {
  return (
    <>
      <PageHero
        kicker="Gallery"
        title="Cinematic Moments"
        subtitle="A curated gallery plus live uploads from guests on the wedding day."
        heroImage={heroImages.gallery}
      />
      <Section title="Curated Gallery" kicker="Desktop + Mobile">
        <GalleryGrid />
      </Section>
      <Section title="Live Uploads" kicker="Moderated">
        <LiveUploads />
      </Section>
    </>
  );
}
