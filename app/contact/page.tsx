import Link from "next/link";
import { PageHero } from "@/components/sections/page-hero";
import { Section } from "@/components/sections/section";
import { Card } from "@/components/ui/card";

export default function ContactPage(): React.JSX.Element {
  return (
    <>
      <PageHero kicker="Contact" title="Wedding Day Support" subtitle="Need help with logistics? Reach out to our coordination team." />
      <Section title="Support Channels" kicker="Fast Response">
        <div className="grid gap-4 md:grid-cols-2">
          <Card title="Email Coordinators" subtitle="best for planning questions">
            <Link href="mailto:wedding-support@example.com" className="text-sm font-semibold uppercase tracking-[0.15em] text-gold-600">
              wedding-support@example.com
            </Link>
          </Card>
          <Card title="Phone Hotline" subtitle="available on wedding day">
            <Link href="tel:+2348001234567" className="text-sm font-semibold uppercase tracking-[0.15em] text-gold-600">
              +234 800 123 4567
            </Link>
          </Card>
        </div>
      </Section>
    </>
  );
}
