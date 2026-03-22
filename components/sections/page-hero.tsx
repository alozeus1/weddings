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
  softenHeroImage?: boolean;
  sharpenHeroImage?: boolean;
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
  softenHeroImage = false,
  sharpenHeroImage = false,
  sideAction
}: PageHeroProps): React.JSX.Element {
  return (
    <section className="relative overflow-hidden border-b border-gold-300/30 bg-hero-warm py-24 sm:py-28 lg:py-40">
      {heroVideo ? (
        <div className="pointer-events-none absolute inset-0">
          <video
            data-testid="page-hero-video"
            className="h-full w-full object-cover opacity-52"
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
            className={cn(
              "object-cover",
              softenHeroImage
                ? "scale-100 opacity-24 blur-[1px]"
                : sharpenHeroImage
                  ? "scale-100 opacity-36 blur-[0.5px]"
                  : "scale-105 opacity-42 blur-[2px]"
            )}
            style={getImageObjectPosition(heroImage, "hero") ? { objectPosition: getImageObjectPosition(heroImage, "hero") } : undefined}
          />
        </div>
      ) : null}
      <div
        className={cn(
          "pointer-events-none absolute inset-0",
          softenHeroImage
            ? "bg-gradient-to-b from-ivory/58 via-ivory/50 to-ivory/76"
            : sharpenHeroImage
              ? "bg-gradient-to-b from-ivory/46 via-ivory/36 to-ivory/72"
            : "bg-gradient-to-b from-ivory/40 via-ivory/28 to-ivory/68"
        )}
      />
      {heroImage || heroVideo ? (
        <div
          className={cn(
            "pointer-events-none absolute inset-0",
            softenHeroImage
              ? "bg-[radial-gradient(circle_at_center,rgba(255,251,245,0.92)_0%,rgba(255,251,245,0.78)_24%,rgba(255,251,245,0.46)_52%,rgba(255,251,245,0.14)_74%,rgba(255,251,245,0)_100%)]"
              : sharpenHeroImage
                ? "bg-[radial-gradient(circle_at_center,rgba(255,251,245,0.88)_0%,rgba(255,251,245,0.7)_24%,rgba(255,251,245,0.36)_52%,rgba(255,251,245,0.12)_74%,rgba(255,251,245,0)_100%)]"
              : "bg-[radial-gradient(circle_at_center,rgba(255,251,245,0.84)_0%,rgba(255,251,245,0.68)_26%,rgba(255,251,245,0.34)_54%,rgba(255,251,245,0.1)_76%,rgba(255,251,245,0)_100%)]"
          )}
        />
      ) : null}
      <div className="pointer-events-none absolute -bottom-10 -left-16 hidden size-56 rounded-full border border-gold-300/60 bg-[radial-gradient(circle,#fff3d7_0%,rgba(255,243,215,0)_72%)] md:block" />
      <div className="pointer-events-none absolute -right-16 top-8 hidden size-56 rounded-full border border-gold-300/60 bg-[radial-gradient(circle,#fce7dc_0%,rgba(252,231,220,0)_72%)] md:block" />
      <div className="container-shell">
        <div
          className={cn(
            "relative z-10 space-y-6",
            heroImage || heroVideo
              ? softenHeroImage
                ? "rounded-[2.25rem] border border-white/58 bg-ivory/58 px-6 py-8 shadow-[0_20px_64px_rgba(31,24,16,0.1)] backdrop-blur-[10px] sm:px-8 lg:px-10"
                : sharpenHeroImage
                  ? "rounded-[2.25rem] border border-white/52 bg-ivory/48 px-6 py-8 shadow-[0_20px_64px_rgba(31,24,16,0.1)] backdrop-blur-[8px] sm:px-8 lg:px-10"
                : "rounded-[2.25rem] border border-white/50 bg-ivory/42 px-6 py-8 shadow-[0_20px_64px_rgba(31,24,16,0.1)] backdrop-blur-[8px] sm:px-8 lg:px-10"
              : "",
            centered ? "mx-auto max-w-3xl text-center" : "max-w-3xl text-left"
          )}
        >
          <Reveal delay={100} duration={800}>
            <p
              className={cn(
                "section-kicker text-ink/80",
                heroImage || heroVideo
                  ? softenHeroImage
                    ? "inline-flex rounded-full border border-white/60 bg-ivory/90 px-4 py-2 shadow-[0_10px_28px_rgba(31,24,16,0.14)] backdrop-blur-[6px]"
                    : sharpenHeroImage
                      ? "inline-flex rounded-full border border-white/56 bg-ivory/86 px-4 py-2 shadow-[0_10px_28px_rgba(31,24,16,0.14)] backdrop-blur-[5px]"
                    : "inline-flex rounded-full border border-white/55 bg-ivory/82 px-4 py-2 shadow-[0_10px_28px_rgba(31,24,16,0.14)] backdrop-blur-[5px]"
                  : "",
                centered ? "mx-auto" : ""
              )}
            >
              {kicker}
            </p>
          </Reveal>
          <Reveal delay={250} duration={900}>
            <h1 className="section-heading text-ink [text-shadow:0_1px_0_rgba(255,250,242,0.82)]">{title}</h1>
          </Reveal>
          <Reveal delay={400} duration={900}>
            <p className="mx-auto max-w-2xl text-base text-ink/82 [text-shadow:0_1px_0_rgba(255,250,242,0.75)] sm:text-lg">{subtitle}</p>
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
