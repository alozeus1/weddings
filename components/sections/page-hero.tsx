import type { ReactNode } from "react";
import Image from "next/image";
import { cn } from "@/lib/utils";

type PageHeroProps = {
  kicker: string;
  title: string;
  subtitle: string;
  actions?: ReactNode;
  centered?: boolean;
  heroImage?: string;
};

export function PageHero({ kicker, title, subtitle, actions, centered = true, heroImage }: PageHeroProps): React.JSX.Element {
  return (
    <section className="relative overflow-hidden border-b border-gold-300/30 bg-hero-warm py-16 sm:py-20 lg:py-24">
      {heroImage ? (
        <div className="pointer-events-none absolute inset-0">
          <Image src={heroImage} alt="" fill className="object-cover opacity-35" />
        </div>
      ) : null}
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-ivory/45 via-ivory/25 to-ivory/80" />
      <div className="pointer-events-none absolute -bottom-10 -left-16 hidden size-56 rounded-full border border-gold-300/60 bg-[radial-gradient(circle,#fff3d7_0%,rgba(255,243,215,0)_72%)] md:block" />
      <div className="pointer-events-none absolute -right-16 top-8 hidden size-56 rounded-full border border-gold-300/60 bg-[radial-gradient(circle,#fce7dc_0%,rgba(252,231,220,0)_72%)] md:block" />
      <div className="container-shell">
        <div className={cn("relative z-10 space-y-6", centered ? "mx-auto max-w-3xl text-center" : "max-w-3xl text-left") }>
          <p className="section-kicker text-ink/70">{kicker}</p>
          <h1 className="section-heading">{title}</h1>
          <p className="mx-auto max-w-2xl text-base text-ink/70 sm:text-lg">{subtitle}</p>
          {actions}
        </div>
      </div>
    </section>
  );
}
