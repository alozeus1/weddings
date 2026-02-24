import Image from "next/image";
import Link from "next/link";
import { PageHero } from "@/components/sections/page-hero";
import { Section } from "@/components/sections/section";
import { registryContent } from "@/lib/content";

export default function RegistryPage(): React.JSX.Element {
  return (
    <>
      <PageHero
        kicker="Registry"
        title="Gifts & Contributions"
        subtitle="Your presence is our present, but if you'd like to gift, we've shared a registry below."
        actions={
          <div className="flex justify-center">
            <Link
              href={registryContent.registryUrl}
              target="_blank"
              rel="noreferrer"
              className="rounded-md bg-gold-500 px-6 py-3 text-xs font-bold uppercase tracking-[0.2em] text-ink"
            >
              Open Registry
            </Link>
          </div>
        }
      />
      <Section title="Featured Picks" kicker="Boutique">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {registryContent.featured.map((item) => (
            <article key={item.title} className="overflow-hidden rounded-2xl border border-gold-300/40 bg-white shadow-card">
              <div className="relative aspect-[4/3]">
                <Image src={item.image} alt={item.title} fill className="object-cover" />
              </div>
              <div className="p-4">
                <h3 className="font-display text-2xl text-ink">{item.title}</h3>
                <p className="mt-1 text-sm text-ink/70">{item.price}</p>
              </div>
            </article>
          ))}
        </div>
      </Section>
    </>
  );
}
