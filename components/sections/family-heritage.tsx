import { Reveal } from "@/components/ui/reveal";
import type { FamilyOrigin } from "@/types/content";

type FamilyHeritageProps = {
  groomFamily: FamilyOrigin;
  brideFamily: FamilyOrigin;
  coupleNames: string;
};

function GoldRule(): React.JSX.Element {
  return (
    <svg
      viewBox="0 0 200 12"
      className="mx-auto w-32 sm:w-40"
      aria-hidden="true"
    >
      <line
        x1="0"
        y1="6"
        x2="80"
        y2="6"
        stroke="currentColor"
        strokeWidth="0.6"
      />
      <circle cx="100" cy="6" r="2.5" fill="currentColor" />
      <circle cx="90" cy="6" r="1" fill="currentColor" />
      <circle cx="110" cy="6" r="1" fill="currentColor" />
      <line
        x1="120"
        y1="6"
        x2="200"
        y2="6"
        stroke="currentColor"
        strokeWidth="0.6"
      />
    </svg>
  );
}

function FamilyBlock({ family }: { family: FamilyOrigin }): React.JSX.Element {
  return (
    <div className="space-y-1.5">
      <p className="font-display text-lg leading-snug text-ink sm:text-xl lg:text-[1.375rem]">
        {family.parents}
      </p>
      <p className="text-[0.8rem] leading-relaxed tracking-[0.14em] text-ink/60 sm:text-[0.84rem]">
        of {family.village}, {family.lga}, {family.state}
      </p>
    </div>
  );
}

export function FamilyHeritage({
  groomFamily,
  brideFamily,
  coupleNames
}: FamilyHeritageProps): React.JSX.Element {
  return (
    <section className="relative overflow-hidden border-b border-gold-300/20 py-14 sm:py-16 lg:py-20">
      {/* Subtle warm radial glow behind the text */}
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(231,199,109,0.06)_0%,transparent_70%)]" />

      {/* Decorative corner filigree — top-left */}
      <div className="pointer-events-none absolute left-4 top-4 text-gold-300/30 sm:left-8 sm:top-6">
        <svg width="48" height="48" viewBox="0 0 48 48" aria-hidden="true">
          <path
            d="M2 46 C2 22, 22 2, 46 2"
            fill="none"
            stroke="currentColor"
            strokeWidth="0.7"
          />
          <path
            d="M6 46 C6 26, 26 6, 46 6"
            fill="none"
            stroke="currentColor"
            strokeWidth="0.4"
          />
        </svg>
      </div>
      {/* Decorative corner filigree — bottom-right */}
      <div className="pointer-events-none absolute bottom-4 right-4 rotate-180 text-gold-300/30 sm:bottom-6 sm:right-8">
        <svg width="48" height="48" viewBox="0 0 48 48" aria-hidden="true">
          <path
            d="M2 46 C2 22, 22 2, 46 2"
            fill="none"
            stroke="currentColor"
            strokeWidth="0.7"
          />
          <path
            d="M6 46 C6 26, 26 6, 46 6"
            fill="none"
            stroke="currentColor"
            strokeWidth="0.4"
          />
        </svg>
      </div>

      <div className="container-shell relative z-10">
        <div className="mx-auto max-w-xl space-y-7 text-center">
          {/* Kicker */}
          <Reveal delay={100} duration={800}>
            <p className="section-kicker">Our Families</p>
          </Reveal>

          {/* Opening line */}
          <Reveal delay={200} duration={900}>
            <p className="font-display text-base italic text-ink/72 sm:text-lg">
              The families of
            </p>
          </Reveal>

          {/* Groom's family */}
          <Reveal delay={350} duration={900}>
            <FamilyBlock family={groomFamily} />
          </Reveal>

          {/* Ornamental divider with "and" */}
          <Reveal delay={500} duration={800}>
            <div className="flex items-center justify-center gap-4 text-gold-300">
              <svg viewBox="0 0 60 2" className="w-10 sm:w-14" aria-hidden="true">
                <line
                  x1="0"
                  y1="1"
                  x2="60"
                  y2="1"
                  stroke="currentColor"
                  strokeWidth="0.5"
                />
              </svg>
              <span className="font-display text-sm italic text-ink/50">
                and
              </span>
              <svg viewBox="0 0 60 2" className="w-10 sm:w-14" aria-hidden="true">
                <line
                  x1="0"
                  y1="1"
                  x2="60"
                  y2="1"
                  stroke="currentColor"
                  strokeWidth="0.5"
                />
              </svg>
            </div>
          </Reveal>

          {/* Bride's family */}
          <Reveal delay={650} duration={900}>
            <FamilyBlock family={brideFamily} />
          </Reveal>

          {/* Gold rule ornament */}
          <Reveal delay={800} duration={800}>
            <div className="text-gold-300/70">
              <GoldRule />
            </div>
          </Reveal>

          {/* Invitation line */}
          <Reveal delay={900} duration={900}>
            <p className="font-display text-base italic leading-relaxed text-ink/65 sm:text-lg">
              cordially invite you to the wedding celebration
              <br />
              of their children
            </p>
          </Reveal>

          {/* Couple names */}
          <Reveal delay={1050} duration={1000}>
            <p className="font-display text-3xl leading-tight text-ink sm:text-4xl">
              {coupleNames}
            </p>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
