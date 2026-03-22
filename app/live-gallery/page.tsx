import Link from "next/link";
import { LiveUploads } from "@/components/gallery/live-uploads";
import { PageHero } from "@/components/sections/page-hero";
import { Section } from "@/components/sections/section";
import { uploadGuideContent } from "@/lib/content";
import { heroImages } from "@/lib/media";

export default function LiveGalleryPage(): React.JSX.Element {
  return (
    <>
      <PageHero
        kicker="Live Gallery"
        title="Guest Uploads"
        subtitle="A living stream of approved photos shared by friends and family from the wedding weekend."
        heroImage={heroImages.liveGallery}
      />
      <Section title="Approved Uploads" kicker="Moderated Feed">
        <p className="mb-4 text-sm leading-7 text-ink/75">
          Want to add yours? Use <Link href={uploadGuideContent.uploadPage} className="underline">the Upload page</Link> on your
          phone or scan the QR signage at the event. Only approved photos appear here.
        </p>
        <LiveUploads />
      </Section>
    </>
  );
}
