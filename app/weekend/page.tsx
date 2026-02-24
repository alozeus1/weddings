import { PageHero } from "@/components/sections/page-hero";
import { PhotoMosaic } from "@/components/sections/photo-mosaic";
import { Section } from "@/components/sections/section";
import { Card } from "@/components/ui/card";
import { eventsContent } from "@/lib/content";
import { heroImages, pageMosaics } from "@/lib/media";
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
            </Card>
          ))}
        </div>
      </Section>
    </>
  );
}
