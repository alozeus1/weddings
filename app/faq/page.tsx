import { Accordion } from "@/components/ui/accordion";
import { PageHero } from "@/components/sections/page-hero";
import { PhotoMosaic } from "@/components/sections/photo-mosaic";
import { Section } from "@/components/sections/section";
import { faqContent } from "@/lib/content";
import { heroImages, pageMosaics } from "@/lib/media";

export default function FAQPage(): React.JSX.Element {
  return (
    <>
      <PageHero
        kicker="FAQ"
        title="Information for Guests"
        subtitle="Everything you need to know before the wedding weekend."
        heroImage={heroImages.faq}
      />
      <Section title="Frequently Asked Questions" kicker="Minimalist">
        <PhotoMosaic images={[...pageMosaics.faq]} />
        <Accordion items={faqContent} />
      </Section>
    </>
  );
}
