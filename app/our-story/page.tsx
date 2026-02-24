import { PageHero } from "@/components/sections/page-hero";
import { Section } from "@/components/sections/section";
import { Timeline } from "@/components/sections/timeline";
import { storyContent } from "@/lib/content";

export default function OurStoryPage(): React.JSX.Element {
  return (
    <>
      <PageHero kicker="Our Story" title="From Then To Forever" subtitle={storyContent.intro} />
      <Section title="Timeline" kicker="Milestones">
        <Timeline items={storyContent.timeline} />
      </Section>
    </>
  );
}
