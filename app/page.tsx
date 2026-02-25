import Link from "next/link";
import { PageHero } from "@/components/sections/page-hero";
import { PhotoMosaic } from "@/components/sections/photo-mosaic";
import { Section } from "@/components/sections/section";
import { Card } from "@/components/ui/card";
import { coupleContent, eventsContent } from "@/lib/content";
import { heroImages, pageMosaics } from "@/lib/media";
import { formatDate } from "@/lib/utils";

export default function HomePage(): React.JSX.Element {
  return (
    <>
      <PageHero
        kicker={coupleContent.tagline}
        title={coupleContent.names}
        subtitle={coupleContent.heroSubtitle}
        heroImage={heroImages.home}
        actions={
          <div className="flex flex-wrap justify-center gap-3">
            <Link href="/rsvp" className="rounded-md bg-gold-500 px-6 py-3 text-xs font-bold uppercase tracking-[0.2em] text-ink">
              RSVP Now
            </Link>
            <Link href="/weekend" className="rounded-md border border-ink/20 bg-white/60 px-6 py-3 text-xs font-bold uppercase tracking-[0.2em] text-ink">
              Weekend Plan
            </Link>
          </div>
        }
      />

      <Section title="Wedding Weekend" kicker={formatDate(coupleContent.date)}>
        <PhotoMosaic images={[...pageMosaics.home]} objectPositions={["50% 50%", "50% 0%", "50% 50%"]} />
        <div className="grid gap-4 md:grid-cols-2">
          {eventsContent.map((event) => (
            <Card
              key={event.id}
              title={event.title}
              subtitle={`${formatDate(event.date)} · ${event.time} · ${event.location}`}
            >
              <p className="text-sm text-ink/70">{event.description}</p>
            </Card>
          ))}
        </div>
      </Section>
    </>
  );
}
