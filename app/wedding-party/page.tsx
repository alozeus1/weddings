import Image from "next/image";
import { PageHero } from "@/components/sections/page-hero";
import { Section } from "@/components/sections/section";
import { partyContent } from "@/lib/content";

export default function WeddingPartyPage(): React.JSX.Element {
  return (
    <>
      <PageHero kicker="Wedding Party" title="Our Favorite People" subtitle="Meet the friends and family standing with us on the day." />
      <Section title="Bridal Party" kicker="Profiles">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {partyContent.map((person) => (
            <article key={person.name} className="overflow-hidden rounded-2xl border border-gold-300/40 bg-white shadow-card">
              <div className="relative aspect-[3/4]">
                <Image src={person.image} alt={person.name} fill className="object-cover" />
              </div>
              <div className="space-y-2 p-4">
                <p className="section-kicker">{person.role}</p>
                <h3 className="font-display text-2xl text-ink">{person.name}</h3>
                <p className="text-sm text-ink/70">{person.bio}</p>
              </div>
            </article>
          ))}
        </div>
      </Section>
    </>
  );
}
