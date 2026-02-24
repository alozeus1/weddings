import Image from "next/image";
import Link from "next/link";
import { PageHero } from "@/components/sections/page-hero";
import { Section } from "@/components/sections/section";
import { churchGalleryImages, churchPriestImage, heroImages, venueInfo, venueMapLinks } from "@/lib/media";

export default function ChurchSchedulePage(): React.JSX.Element {
  return (
    <>
      <PageHero
        kicker="Ceremony"
        title="Church Schedule"
        subtitle="Mass begins promptly and we would love everyone seated before the procession starts."
        heroImage={heroImages.church}
      />

      <Section title="St. Patrick's Cathedral" kicker="Church Schedule">
        <div className="grid gap-6 lg:grid-cols-[1.2fr_1fr] lg:items-start">
          <div className="grid gap-3 sm:grid-cols-2">
            {churchGalleryImages.slice(0, 3).map((src, index) => (
              <article key={src} className="relative overflow-hidden rounded-xl2 border border-gold-300/40">
                <div className="relative aspect-[4/3]">
                  <Image src={src} alt={`St. Patrick's Cathedral view ${index + 1}`} fill className="object-cover" />
                </div>
              </article>
            ))}
          </div>

          <article className="rounded-2xl border border-gold-300/40 bg-white/75 p-5 shadow-card">
            <p className="section-kicker">Ceremony Details</p>
            <h3 className="mt-2 font-display text-3xl text-ink">{venueInfo.church.name}</h3>
            <p className="mt-3 text-sm text-ink/75">{venueInfo.church.address}</p>
            <p className="mt-3 text-sm text-ink/75">{venueInfo.church.time}</p>
            <p className="mt-1 text-sm text-ink/75">Date: {venueInfo.church.date}</p>
            <Link
              href={venueMapLinks.church}
              target="_blank"
              rel="noreferrer"
              data-testid="church-map-link"
              className="mt-5 inline-flex rounded-md bg-gold-500 px-4 py-2 text-xs font-bold uppercase tracking-[0.2em] text-ink"
            >
              Open in Google Maps
            </Link>
          </article>
        </div>
      </Section>

      <Section title="Welcome Note" kicker="Parish Priest">
        <div className="grid gap-6 lg:grid-cols-2 lg:items-center">
          <article className="relative overflow-hidden rounded-2xl border border-gold-300/40 bg-white">
            <div className="relative aspect-[4/5]">
              <Image
                src={churchPriestImage}
                alt="Parish priest in cassock at St. Patrick's Cathedral"
                fill
                className="object-cover"
              />
            </div>
          </article>

          <article className="rounded-2xl border border-gold-300/40 bg-white/80 p-6 shadow-soft">
            <h3 className="font-display text-3xl text-ink">A Blessing For Our Guests</h3>
            <p className="mt-3 text-sm leading-7 text-ink/75">
              Welcome to St. Patrick&apos;s Cathedral. We are honored to host Jessica and Chibuike as they begin their married life
              in faith. Thank you for joining in prayer, celebration, and fellowship as two families become one.
            </p>
          </article>
        </div>
      </Section>
    </>
  );
}
