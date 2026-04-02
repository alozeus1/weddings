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
      <WeddingCountdown targetDate={couple.countdownTarget} />
      <Section title="RSVP Form" kicker="Open RSVP">
        <div className="mb-6 rounded-2xl border border-gold-300/40 bg-white/80 p-5 text-sm leading-7 text-ink/80 shadow-card">
          We’re using RSVP responses to plan seating and hospitality with care. Sending yours by the deadline helps us prepare your place and meal
          thoughtfully, and late or missing responses may be harder for us to accommodate fully on the day.
        </div>
        <PhotoMosaic images={[...pageMosaics.rsvp]} />
        <RSVPForm />
      </Section>
    </>
  );
}
