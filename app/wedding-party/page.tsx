import Image from "next/image";
import Link from "next/link";
import { VacationLibraryGrid } from "@/components/gallery/vacation-library-grid";
import { PageHero } from "@/components/sections/page-hero";
import { Section } from "@/components/sections/section";
import { getImageObjectPosition, getRandomizedVacationGalleryImages, heroImages } from "@/lib/media";

export const dynamic = "force-dynamic";

export default function WeddingPartyPage(): React.JSX.Element {
  const vacationImages = getRandomizedVacationGalleryImages();
  const heroImage = vacationImages[0] ?? heroImages.gallery;
  const featuredImage = vacationImages[1] ?? heroImage;
  const supportingImages = vacationImages.slice(2, 4);
  const libraryMoments = [
    {
      label: "Frames Kept",
      value: String(vacationImages.length),
      description: "A small archive of the trips, pauses, and ordinary joy that lived before the vows."
    },
    {
      label: "Mood",
      value: "Warm + candid",
      description: "More lived-in than posed. More memory than performance."
    },
    {
      label: "Why This Page",
      value: "Our in-between season",
      description: "Because some of our favorite photographs happened far from a timeline and close to each other."
    }
  ];

  return (
    <>
      <PageHero
        kicker="Vacation Library"
        title="Postcards From Our Journey"
        subtitle="Before the wedding weekend, there were airport runs, quiet mornings, warm sunsets, and all the small shared memories that deserved a page of their own."
        heroImage={heroImage}
        sharpenHeroImage
        actions={
          <div className="flex flex-wrap items-center justify-center gap-3">
            <Link
              href="/gallery"
              className="rounded-full border border-gold-400/50 bg-white/82 px-5 py-3 text-xs font-semibold uppercase tracking-[0.24em] text-ink transition hover:bg-white"
            >
              Wedding-Day Gallery
            </Link>
            <Link
              href="/our-story"
              className="rounded-full border border-white/55 bg-ink/78 px-5 py-3 text-xs font-semibold uppercase tracking-[0.24em] text-white transition hover:bg-ink/88"
            >
              Read Our Story
            </Link>
          </div>
        }
      />

      <Section title="The Trips That Held Us" kicker="Before The Aisle">
        <div className="grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
          <div className="rounded-[2rem] border border-gold-300/45 bg-white/90 p-7 shadow-card sm:p-9">
            <div className="space-y-5">
              <p className="font-display text-3xl leading-tight text-ink sm:text-4xl">
                Some of our favorite memories happened in the spaces between destinations.
              </p>
              <p className="max-w-2xl text-base leading-8 text-ink/78">
                This page is a soft archive of that season. Not the formal portraits. Not the wedding weekend. Just the candid
                frames that caught us traveling light, laughing freely, and learning how good it feels to keep choosing each other.
              </p>
              <p className="max-w-2xl text-base leading-8 text-ink/72">
                It is part scrapbook, part visual diary, and fully ours. The kind of gallery that feels like a stack of postcards
                tucked into a keepsake box and reopened years later.
              </p>
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-1">
            {libraryMoments.map((moment) => (
              <article
                key={moment.label}
                className="rounded-[1.75rem] border border-gold-300/40 bg-[linear-gradient(180deg,rgba(255,255,255,0.94)_0%,rgba(252,245,234,0.95)_100%)] p-6 shadow-card"
              >
                <p className="section-kicker">{moment.label}</p>
                <p className="mt-3 font-display text-3xl leading-tight text-ink">{moment.value}</p>
                <p className="mt-3 text-sm leading-7 text-ink/74">{moment.description}</p>
              </article>
            ))}
          </div>
        </div>
      </Section>

      <Section title="A Few Favorite Frames" kicker="Editorial Spread">
        <div className="grid gap-4 lg:grid-cols-[1.35fr_0.65fr]">
          <article className="relative min-h-[420px] overflow-hidden rounded-[2rem] border border-gold-300/40 bg-white shadow-card">
            <Image
              src={featuredImage}
              alt="Featured vacation memory"
              fill
              sizes="(min-width: 1024px) 66vw, 100vw"
              className="object-cover"
              style={getImageObjectPosition(featuredImage, "gallery") ? { objectPosition: getImageObjectPosition(featuredImage, "gallery") } : undefined}
            />
            <div className="absolute inset-0 bg-gradient-to-t from-ink/40 via-transparent to-transparent" />
            <div className="absolute bottom-6 left-6 max-w-md rounded-[1.5rem] border border-white/20 bg-ivory/76 p-5 backdrop-blur-sm">
              <p className="section-kicker">Keepsake Frame</p>
              <h3 className="mt-3 font-display text-3xl text-ink">Warm light, easy joy, and the kind of memories that stay soft around the edges.</h3>
            </div>
          </article>

          <div className="grid gap-4">
            {supportingImages.map((src, index) => (
              <article key={src} className="relative min-h-[200px] overflow-hidden rounded-[1.75rem] border border-gold-300/40 bg-white shadow-card">
                <Image
                  src={src}
                  alt={`Supporting vacation memory ${index + 1}`}
                  fill
                  sizes="(min-width: 1024px) 22vw, 100vw"
                  className="object-cover"
                  style={getImageObjectPosition(src, "gallery") ? { objectPosition: getImageObjectPosition(src, "gallery") } : undefined}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-ink/28 via-transparent to-transparent" />
              </article>
            ))}
          </div>
        </div>
      </Section>

      <Section title="Vacation Photo Library" kicker="Randomized Each Visit">
        <div className="mb-7 rounded-[1.75rem] border border-gold-300/40 bg-white/88 p-6 shadow-card">
          <p className="max-w-3xl text-sm leading-7 text-ink/74 sm:text-base">
            Every refresh reshuffles the order, so the page feels a little different each time. The memories stay the same, but the
            sequence changes, like pulling a fresh stack of travel prints from the same keepsake box.
          </p>
        </div>
        <VacationLibraryGrid images={vacationImages} />
      </Section>
    </>
  );
}
