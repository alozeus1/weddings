import Link from "next/link";
import { PageHero } from "@/components/sections/page-hero";
import { PhotoMosaic } from "@/components/sections/photo-mosaic";
import { Section } from "@/components/sections/section";
import { Card } from "@/components/ui/card";
import { heroImages, pageMosaics } from "@/lib/media";

export default function ContactPage(): React.JSX.Element {
  return (
    <>
      <PageHero
        kicker="Contact"
        title="Wedding Day Support"
        subtitle="Need help with logistics? Reach out to our coordination team."
        heroImage={heroImages.contact}
        sharpenHeroImage
      />
      <Section title="Support Channels" kicker="Fast Response">
        <PhotoMosaic images={[...pageMosaics.contact]} />
        <div className="grid gap-4 md:grid-cols-2">
          <Card title="Email Coordinators" subtitle="best for planning questions">
            <Link href="mailto:jessbuikem26@gmail.com" className="text-sm font-semibold uppercase tracking-[0.15em] text-gold-600">
              jessbuikem26@gmail.com
            </Link>
          </Card>
          <Card title="Phone Hotline" subtitle="available on wedding day">
            <div className="space-y-2">
              <Link href="tel:+19152068668" className="block text-sm font-semibold uppercase tracking-[0.15em] text-gold-600">
                915-206-8668
              </Link>
              <Link href="tel:+18067308044" className="block text-sm font-semibold uppercase tracking-[0.15em] text-gold-600">
                806-730-8044
              </Link>
            </div>
          </Card>
        </div>
      </Section>
    </>
  );
}
