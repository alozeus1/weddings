import { PageHero } from "@/components/sections/page-hero";
import { PhotoMosaic } from "@/components/sections/photo-mosaic";
import { Section } from "@/components/sections/section";
import { Card } from "@/components/ui/card";
import { travelContent } from "@/lib/content";
import { heroImages, pageMosaics } from "@/lib/media";

export default function TravelPage(): React.JSX.Element {
  return (
    <>
      <PageHero
        kicker="Travel & Stay"
        title="Getting Here"
        subtitle="Everything you need for flights, hotels, and transport between venues."
        heroImage={heroImages.travel}
      />
      <Section title="Airports" kicker="Arrivals">
        <PhotoMosaic images={[...pageMosaics.travel]} />
        <div className="grid gap-4 md:grid-cols-2">
          {travelContent.airports.map((airport) => (
            <Card key={airport.code} title={`${airport.name} (${airport.code})`} subtitle={airport.distance} />
          ))}
        </div>
      </Section>
      <Section title="Hotel Blocks" kicker="Recommended">
        <div className="grid gap-4 md:grid-cols-2">
          {travelContent.hotels.map((hotel) => (
            <Card key={hotel.name} title={hotel.name} subtitle={hotel.description}>
              <p className="text-xs uppercase tracking-[0.2em] text-gold-600">Code: {hotel.bookingCode}</p>
            </Card>
          ))}
        </div>
      </Section>
      <Section title="Local Transport" kicker="On The Day">
        <ul className="space-y-3 text-sm text-ink/75">
          {travelContent.transport.map((item) => (
            <li key={item}>• {item}</li>
          ))}
        </ul>
      </Section>
    </>
  );
}
