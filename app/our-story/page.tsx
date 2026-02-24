import Link from "next/link";
import { PageHero } from "@/components/sections/page-hero";
import { Section } from "@/components/sections/section";
import { Timeline } from "@/components/sections/timeline";
import { storyContent } from "@/lib/content";
import { heroImages, imageAssets } from "@/lib/media";

export default function OurStoryPage(): React.JSX.Element {
  return (
    <>
      <PageHero
        kicker="Our Story"
        title="From Then To Forever"
        subtitle={storyContent.intro}
        heroImage={heroImages.story}
        heroVideo={imageAssets.videos.ourStory}
        videoPoster={heroImages.story}
        sideAction={
          <Link
            href="/our-story/video"
            aria-label="Play our story video with sound"
            data-testid="hero-video-play-button"
            className="inline-flex size-12 items-center justify-center rounded-full border border-gold-400/60 bg-white/80 text-ink shadow-soft transition hover:bg-white"
          >
            <svg viewBox="0 0 24 24" className="size-6 fill-current" aria-hidden="true">
              <path d="M8 6.5v11l9-5.5z" />
            </svg>
          </Link>
        }
      />
      <Section title="Timeline" kicker="Milestones">
        <Timeline items={storyContent.timeline} />
      </Section>
    </>
  );
}
