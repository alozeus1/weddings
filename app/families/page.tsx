import Image from "next/image";
import { PageHero } from "@/components/sections/page-hero";
import { Section } from "@/components/sections/section";
import { familiesContent } from "@/lib/content";
import { heroImages } from "@/lib/media";

export default function FamiliesPage(): React.JSX.Element {
  return (
    <>
      <PageHero
        kicker="Families"
        title="Honoring Our Families"
        subtitle="The roots that shaped us and the love that brought everyone together."
        heroImage={heroImages.families}
      />
      <Section title="Family Spotlights" kicker="Editorial">
        <div className="grid gap-4 md:grid-cols-2">
          {familiesContent.map((family) => (
            <article key={family.family} className="overflow-hidden rounded-2xl border border-gold-300/40 bg-white shadow-card">
              <div className="relative aspect-[16/10]">
                <Image src={family.image} alt={family.family} fill className="object-cover" />
              </div>
              <div className="p-5">
                <h3 className="font-display text-3xl text-ink">{family.family}</h3>
                <p className="mt-2 text-sm text-ink/75">{family.note}</p>
              </div>
            </article>
          ))}
        </div>
      </Section>
    </>
  );
}
