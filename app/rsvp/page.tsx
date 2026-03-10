import { PageHero } from "@/components/sections/page-hero";
import { PhotoMosaic } from "@/components/sections/photo-mosaic";
import { Section } from "@/components/sections/section";
import { RSVPForm } from "@/components/rsvp/rsvp-form";
import { WeddingCountdown } from "@/components/rsvp/countdown-timer";
import { heroImages, pageMosaics } from "@/lib/media";
import couple from "@/content/couple.json";

export default function RSVPPage(): React.JSX.Element {
  return (
    <>
      <PageHero
        kicker="RSVP"
        title="Celebrate With Us"
        subtitle="Please confirm your attendance and meal preferences."
        heroImage={heroImages.rsvp}
      />
      <WeddingCountdown targetDate={couple.date} />
      <Section title="RSVP Form" kicker="Secure Submission">
        <PhotoMosaic images={[...pageMosaics.rsvp]} />
        <RSVPForm />
      </Section>
    </>
  );
}
