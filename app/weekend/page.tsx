import Link from "next/link";
import { PageHero } from "@/components/sections/page-hero";
import { PhotoMosaic } from "@/components/sections/photo-mosaic";
import { Section } from "@/components/sections/section";
import { Card } from "@/components/ui/card";
import { eventsContent, eventsDetails } from "@/lib/content";
import { heroImages, pageMosaics, venueMapLinks } from "@/lib/media";
import { formatDate } from "@/lib/utils";

export default function WeekendPage(): React.JSX.Element {
  return (
    <>
      <PageHero
        kicker="Wedding Weekend"
        title="Schedule"
        subtitle="Plan your moments with us from welcome drinks to farewell brunch."
        heroImage={heroImages.weekend}
      />
      <Section title="Event Timeline" kicker="All Times Local">
        <PhotoMosaic images={[...pageMosaics.weekend]} />
        <div className="space-y-4">
          {eventsContent.map((event) => (
            <Card key={event.id} title={event.title} subtitle={`${formatDate(event.date)} · ${event.time}`}>
              <p className="text-sm text-ink/75">{event.location}</p>
              <p className="mt-2 text-sm text-ink/70">{event.description}</p>
              <p className="mt-2 text-xs uppercase tracking-[0.2em] text-gold-600">Dress Code: {event.dressCode}</p>
              {(event.location.includes("St. Patrick") || event.location.includes("Tuscany")) && (
                <Link
                  href={event.location.includes("St. Patrick") ? venueMapLinks.church : venueMapLinks.eventCenter}
                  target="_blank"
                  rel="noreferrer"
                  className="mt-3 inline-flex rounded-md border border-gold-300 bg-ivory px-4 py-2 text-[11px] font-bold uppercase tracking-[0.2em] text-ink"
                >
                  Open in Google Maps
                </Link>
              )}
            </Card>
          ))}
        </div>
      </Section>

      <Section title="Colors of the Day" kicker="Palette">
        <article className="rounded-2xl border border-gold-300/40 bg-paper-glow p-5 shadow-card sm:p-6">
          <p className="text-sm text-ink/75">{eventsDetails.colorsOfDay}</p>
          <div className="mt-4 flex flex-wrap gap-2">
            {eventsDetails.colorPalette.map((color) => (
              <span
                key={color}
                className="inline-flex rounded-full border border-gold-300/60 bg-ivory px-3 py-1 text-xs uppercase tracking-[0.16em] text-ink/80"
              >
                {color}
              </span>
            ))}
          </div>
        </article>
      </Section>
    </>
  );
}
