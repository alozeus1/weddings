import type { ReactNode } from "react";
import Image from "next/image";
import { getImageObjectPosition } from "@/lib/media";
import { cn } from "@/lib/utils";
import { Reveal } from "@/components/ui/reveal";

type PageHeroProps = {
  kicker: string;
  title: string;
  subtitle: string;
  actions?: ReactNode;
  centered?: boolean;
  heroImage?: string;
  heroVideo?: string;
  videoPoster?: string;
  sideAction?: ReactNode;
};

export function PageHero({
  kicker,
  title,
  subtitle,
  actions,
  centered = true,
  heroImage,
  heroVideo,
  videoPoster,
  sideAction
}: PageHeroProps): React.JSX.Element {
  return (
    <section className="relative overflow-hidden border-b border-gold-300/30 bg-hero-warm py-16 sm:py-20 lg:py-24">
      {heroVideo ? (
        <div className="pointer-events-none absolute inset-0">
          <video
            data-testid="page-hero-video"
            className="h-full w-full object-cover opacity-45"
            autoPlay
            loop
            muted
            playsInline
            preload="metadata"
            poster={videoPoster}
          >
            <source src={heroVideo} type="video/mp4" />
          </video>
        </div>
      ) : null}
      {!heroVideo && heroImage ? (
        <div className="pointer-events-none absolute inset-0">
          <Image
            src={heroImage}
            alt=""
            fill
            priority
            sizes="100vw"
            className="object-cover opacity-35"
            style={getImageObjectPosition(heroImage, "hero") ? { objectPosition: getImageObjectPosition(heroImage, "hero") } : undefined}
          />
        </div>
      ) : null}
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-ivory/45 via-ivory/25 to-ivory/80" />
      <div className="pointer-events-none absolute -bottom-10 -left-16 hidden size-56 rounded-full border border-gold-300/60 bg-[radial-gradient(circle,#fff3d7_0%,rgba(255,243,215,0)_72%)] md:block" />
      <div className="pointer-events-none absolute -right-16 top-8 hidden size-56 rounded-full border border-gold-300/60 bg-[radial-gradient(circle,#fce7dc_0%,rgba(252,231,220,0)_72%)] md:block" />
      <div className="container-shell">
        <div className={cn("relative z-10 space-y-6", centered ? "mx-auto max-w-3xl text-center" : "max-w-3xl text-left")}>
          <Reveal delay={100} duration={800}>
            <p className="section-kicker text-ink/70">{kicker}</p>
          </Reveal>
          <Reveal delay={250} duration={900}>
            <h1 className="section-heading">{title}</h1>
          </Reveal>
          <Reveal delay={400} duration={900}>
            <p className="mx-auto max-w-2xl text-base text-ink/70 sm:text-lg">{subtitle}</p>
          </Reveal>
          {actions ? (
            <Reveal delay={550} duration={900}>
              {actions}
            </Reveal>
          ) : null}
        </div>
      </div>
      {sideAction ? <div className="absolute right-4 top-1/2 z-20 -translate-y-1/2 sm:right-8">{sideAction}</div> : null}
    </section>
  );
}
