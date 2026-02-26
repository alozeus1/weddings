import Image from "next/image";
import Link from "next/link";
import { PageHero } from "@/components/sections/page-hero";
import { Section } from "@/components/sections/section";
import { Card } from "@/components/ui/card";
import { thingsToDoContent, travelContent } from "@/lib/content";
import { airportGalleryImages, cityGalleryImages, heroImages, venueMapLinks } from "@/lib/media";

function buildMapsLink(query: string): string {
  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(query)}`;
}

export default function TravelPage(): React.JSX.Element {
  return (
    <>
      <PageHero
        kicker="Travel & Stay"
        title="Getting Here"
        subtitle="Everything you need for flights, hotels, and transport between venues."
        heroImage={heroImages.travel}
      />

      <Section title="About El Paso" kicker="Sun City">
        <div className="space-y-5 rounded-2xl border border-gold-300/40 bg-white/70 p-5 shadow-soft sm:p-6" data-testid="about-el-paso">
          <div>
            <h3 className="font-display text-3xl text-ink">A Continental Crossroads</h3>
            <p className="mt-2 text-sm leading-7 text-ink/75">
              El Paso is known as the Sun City, a natural pass between mountain ranges and a true continental crossroads where
              Native, Spanish, Mexican, and American cultures meet.
            </p>
          </div>

          <div>
            <h4 className="font-display text-2xl text-ink">From Ancient Roots To A Border City</h4>
            <p className="mt-2 text-sm leading-7 text-ink/75">
              The region has been inhabited for more than 10,000 years, with landmarks like Hueco Tanks preserving that deep
              history. In 1598, Spanish explorers named this corridor El Paso del Norte, and the Mission Trail grew with historic
              communities like Ysleta and Socorro, home to some of the oldest missions in the area.
            </p>
          </div>

          <div>
            <h4 className="font-display text-2xl text-ink">Growth, Railroads, and Modern El Paso</h4>
            <p className="mt-2 text-sm leading-7 text-ink/75">
              After the Treaty of Guadalupe Hidalgo, the Rio Grande became the international border, shaping El Paso and Ciudad
              Juárez as linked sister cities. The 1881 railroad boom transformed El Paso into a commercial gateway and frontier
              legend, remembered for stories like the Six-Shooter Capital era and the Four Dead in Five Seconds duel. Today, the
              metro remains proudly binational, blending culture, food, and language while leading in manufacturing,
              transportation, and major events such as the Sun Bowl, with a strong reputation for safety and community.
            </p>
          </div>
        </div>
      </Section>

      <Section title="City Highlights" kicker="El Paso Views">
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {cityGalleryImages.slice(0, 6).map((src, index) => (
            <article key={src} className="relative overflow-hidden rounded-xl2 border border-gold-300/40">
              <div className="relative aspect-[4/3]">
                <Image
                  src={src}
                  alt={`El Paso city view ${index + 1}`}
                  fill
                  className="object-cover"
                  data-testid={index === 0 ? "travel-city-image" : undefined}
                />
              </div>
            </article>
          ))}
        </div>
      </Section>

      <Section title="Things To Do in El Paso" kicker="Explore">
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {thingsToDoContent.map((item) => (
            <Card key={item.title}>
              <article className="space-y-3">
                <div className="relative aspect-[4/3] overflow-hidden rounded-xl2 border border-gold-300/40">
                  <Image src={item.image} alt={item.title} fill className="object-cover" />
                </div>
                <p className="section-kicker">{item.category}</p>
                <h3 className="font-display text-2xl text-ink">{item.title}</h3>
                <p className="text-sm leading-6 text-ink/75">{item.description}</p>
                <Link
                  href={buildMapsLink(item.mapQuery)}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex rounded-md border border-gold-300 bg-ivory px-4 py-2 text-[11px] font-bold uppercase tracking-[0.2em] text-ink"
                >
                  View on Maps
                </Link>
              </article>
            </Card>
          ))}
        </div>
      </Section>

      <Section title="Airport Arrival" kicker="El Paso International (ELP)">
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {airportGalleryImages.slice(0, 3).map((src, index) => (
            <article key={src} className="relative overflow-hidden rounded-xl2 border border-gold-300/40 bg-white/70">
              <div className="relative aspect-[4/3]">
                <Image src={src} alt={`El Paso airport view ${index + 1}`} fill className="object-cover" />
              </div>
            </article>
          ))}
        </div>
        <div className="mt-4 grid gap-4 md:grid-cols-2">
          {travelContent.airports.map((airport) => (
            <Card key={airport.code} title={`${airport.name} (${airport.code})`} subtitle={airport.distance}>
              <Link
                href={venueMapLinks.airport}
                target="_blank"
                rel="noreferrer"
                className="mt-2 inline-flex rounded-md border border-gold-300 bg-ivory px-4 py-2 text-[11px] font-bold uppercase tracking-[0.2em] text-ink"
              >
                Open Airport in Maps
              </Link>
            </Card>
          ))}
        </div>
      </Section>

      <Section title="Venue Directions" kicker="Google Maps">
        <div className="grid gap-4 md:grid-cols-2">
          <article className="rounded-2xl border border-gold-300/40 bg-white/75 p-5 shadow-soft">
            <p className="section-kicker">Ceremony</p>
            <h3 className="mt-2 font-display text-2xl text-ink">St. Patrick&apos;s Cathedral</h3>
            <p className="mt-2 text-sm text-ink/75">1118 N Mesa St, El Paso, TX 79902</p>
            <Link
              href={venueMapLinks.church}
              target="_blank"
              rel="noreferrer"
              className="mt-4 inline-flex rounded-md bg-gold-500 px-4 py-2 text-xs font-bold uppercase tracking-[0.2em] text-ink"
            >
              Open in Google Maps
            </Link>
          </article>

          <article className="rounded-2xl border border-gold-300/40 bg-white/75 p-5 shadow-soft">
            <p className="section-kicker">Reception</p>
            <h3 className="mt-2 font-display text-2xl text-ink">Tuscany Event Center</h3>
            <p className="mt-2 text-sm text-ink/75">8600 Gateway Blvd, El Paso, TX 79907</p>
            <Link
              href={venueMapLinks.eventCenter}
              target="_blank"
              rel="noreferrer"
              className="mt-4 inline-flex rounded-md bg-gold-500 px-4 py-2 text-xs font-bold uppercase tracking-[0.2em] text-ink"
            >
              Open in Google Maps
            </Link>
          </article>
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
