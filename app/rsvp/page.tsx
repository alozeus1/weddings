import { PageHero } from "@/components/sections/page-hero";
import { Section } from "@/components/sections/section";
import { RSVPForm } from "@/components/rsvp/rsvp-form";

export default function RSVPPage(): React.JSX.Element {
  return (
    <>
      <PageHero kicker="RSVP" title="Celebrate With Us" subtitle="Please confirm your attendance and meal preferences." />
      <Section title="RSVP Form" kicker="Secure Submission">
        <RSVPForm />
      </Section>
    </>
  );
}
