import { LiveUploads } from "@/components/gallery/live-uploads";
import { PageHero } from "@/components/sections/page-hero";
import { Section } from "@/components/sections/section";
import { heroImages } from "@/lib/media";

export default function LiveGalleryPage(): React.JSX.Element {
  return (
    <>
      <PageHero
        kicker="Live Gallery"
        title="Guest Uploads"
        subtitle="A living stream of approved photos shared by friends and family."
        heroImage={heroImages.liveGallery}
      />
      <Section title="Approved Uploads" kicker="Moderated Feed">
        <LiveUploads />
      </Section>
    </>
  );
}
