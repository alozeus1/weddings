import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

type PageHeroProps = {
  kicker: string;
  title: string;
  subtitle: string;
  actions?: ReactNode;
  centered?: boolean;
};

export function PageHero({ kicker, title, subtitle, actions, centered = true }: PageHeroProps): React.JSX.Element {
  return (
    <section className="relative overflow-hidden border-b border-gold-300/30 bg-hero-warm py-16 sm:py-20 lg:py-24">
      <div className="container-shell">
        <div className={cn("space-y-6", centered ? "mx-auto max-w-3xl text-center" : "max-w-3xl text-left") }>
          <p className="section-kicker text-ink/70">{kicker}</p>
          <h1 className="section-heading">{title}</h1>
          <p className="mx-auto max-w-2xl text-base text-ink/70 sm:text-lg">{subtitle}</p>
          {actions}
        </div>
      </div>
    </section>
  );
}
