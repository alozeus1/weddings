import Image from "next/image";
import Link from "next/link";
import { PageHero } from "@/components/sections/page-hero";
import { Section } from "@/components/sections/section";
import { Card } from "@/components/ui/card";
import { eventsContent, eventsDetails } from "@/lib/content";
import { churchGalleryImages, eventCenterGalleryImages, getImageObjectPosition, heroImages, venueMapLinks } from "@/lib/media";
import { formatDate } from "@/lib/utils";

const paletteSwatchMap: Record<string, string> = {
  "sage green": "#9caf88",
  "dusty pink": "#d8a7b1"
};

function getPaletteSwatch(color: string): string {
  return paletteSwatchMap[color.toLowerCase()] ?? "#d6c8b0";
}

function getWeekendEventTitle(eventId: string, fallbackTitle: string): string {
  if (eventId === "white-church-wedding") {
    return "Church Wedding";
  }

  if (eventId === "reception-traditional-wedding") {
    return "Reception And Traditional Wedding";
  }

  return fallbackTitle;
}

function getWeekendEventImages(eventId: string): string[] {
  if (eventId === "white-church-wedding") {
    return churchGalleryImages.slice(0, 2);
  }

  if (eventId === "reception-traditional-wedding") {
    return [...eventCenterGalleryImages];
  }

  return [];
}

function WeekendEventGallery({ images, title }: { images: string[]; title: string }): React.JSX.Element | null {
  if (!images.length) {
    return null;
  }

  return (
    <div className="grid gap-3 sm:grid-cols-2">
      {images.map((src, index) => (
        <article key={src} className="relative overflow-hidden rounded-xl2 border border-gold-300/40 bg-white/70">
          <div className="relative aspect-[4/3]">
            <Image
              src={src}
              alt={`${title} view ${index + 1}`}
              fill
              sizes="(min-width: 1280px) 18vw, (min-width: 640px) 42vw, 100vw"
              className="object-cover"
              style={getImageObjectPosition(src, "mosaic") ? { objectPosition: getImageObjectPosition(src, "mosaic") } : undefined}
            />
          </div>
        </article>
      ))}
    </div>
  );
}

export default function WeekendPage(): React.JSX.Element {
  return (
    <>
      <PageHero
        kicker="Wedding Weekend"
        title="Schedule"
        subtitle="Plan your moments with us from welcome drinks to farewell brunch."
        heroImage={heroImages.weekend}
        softenHeroImage
      />
      <Section title="Event Timeline" kicker="All Times Local">
        <div className="space-y-4">
          {eventsContent.map((event) => {
            const eventTitle = getWeekendEventTitle(event.id, event.title);
            const eventImages = getWeekendEventImages(event.id);

            return (
              <Card key={event.id} title={eventTitle} subtitle={`${formatDate(event.date)} · ${event.time}`}>
                <div className="space-y-4">
                  <WeekendEventGallery images={eventImages} title={eventTitle} />
                  <div>
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
                  </div>
                </div>
              </Card>
            );
          })}
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
                <span
                  aria-hidden="true"
                  className="mr-2 mt-0.5 inline-block h-2.5 w-2.5 rounded-full border border-ink/15"
                  style={{ backgroundColor: getPaletteSwatch(color) }}
                />
                {color}
              </span>
            ))}
          </div>
        </article>
      </Section>
    </>
  );
}
