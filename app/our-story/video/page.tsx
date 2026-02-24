import Link from "next/link";
import { PageHero } from "@/components/sections/page-hero";
import { Section } from "@/components/sections/section";
import { heroImages, imageAssets } from "@/lib/media";

export default function OurStoryVideoPage(): React.JSX.Element {
  return (
    <>
      <PageHero
        kicker="Our Story"
        title="Story Film"
        subtitle="Watch our story video with sound and full controls."
        heroImage={heroImages.story}
      />
      <Section title="Now Playing" kicker="With Sound">
        <div className="overflow-hidden rounded-2xl border border-gold-300/40 bg-white/70 p-4 shadow-soft sm:p-6">
          <div className="relative overflow-hidden rounded-xl2 border border-gold-300/40 bg-ink/5">
            <video
              data-testid="our-story-video-player"
              className="h-full max-h-[70vh] w-full object-cover"
              controls
              playsInline
              preload="metadata"
              muted={false}
            >
              <source src={imageAssets.videos.ourStory} type="video/mp4" />
            </video>
          </div>
          <div className="mt-5 flex justify-end">
            <Link
              href="/our-story"
              className="rounded-md border border-gold-300 bg-ivory px-5 py-2 text-xs font-bold uppercase tracking-[0.2em] text-ink"
            >
              Back to Our Story
            </Link>
          </div>
        </div>
      </Section>
    </>
  );
}
