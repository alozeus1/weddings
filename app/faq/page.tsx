import { Accordion } from "@/components/ui/accordion";
import { PageHero } from "@/components/sections/page-hero";
import { Section } from "@/components/sections/section";
import { faqContent } from "@/lib/content";

export default function FAQPage(): React.JSX.Element {
  return (
    <>
      <PageHero kicker="FAQ" title="Information for Guests" subtitle="Everything you need to know before the wedding weekend." />
      <Section title="Frequently Asked Questions" kicker="Minimalist">
        <Accordion items={faqContent} />
      </Section>
    </>
  );
}
