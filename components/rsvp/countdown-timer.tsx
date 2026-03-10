// components/rsvp/countdown-timer.tsx
"use client";

import { Fragment, useEffect, useState } from "react";

// ─── Pure logic (exported for unit tests) ────────────────────────────────────

export type TimeRemaining = {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
  elapsed: boolean;
};

export function getTimeRemaining(targetDate: string): TimeRemaining {
  const diff = new Date(targetDate).getTime() - Date.now();

  if (diff <= 0) {
    return { days: 0, hours: 0, minutes: 0, seconds: 0, elapsed: true };
  }

  const total = Math.floor(diff / 1000);
  return {
    days: Math.floor(total / 86400),
    hours: Math.floor((total % 86400) / 3600),
    minutes: Math.floor((total % 3600) / 60),
    seconds: total % 60,
    elapsed: false,
  };
}

// ─── Component ────────────────────────────────────────────────────────────────

function pad(n: number): string {
  return String(n).padStart(2, "0");
}

const UNITS = [
  { key: "days",    label: "Days"  },
  { key: "hours",   label: "Hours" },
  { key: "minutes", label: "Mins"  },
  { key: "seconds", label: "Secs"  },
] as const;

type Props = {
  targetDate: string;
};

export function WeddingCountdown({ targetDate }: Props): React.JSX.Element {
  const [time, setTime] = useState<TimeRemaining>(() => getTimeRemaining(targetDate));

  useEffect(() => {
    const id = setInterval(() => {
      setTime(getTimeRemaining(targetDate));
    }, 1000);
    return () => clearInterval(id);
  }, [targetDate]);

  return (
    <section
      data-testid="countdown-section"
      className="border-b border-gold-300/30 bg-ivory py-12 sm:py-16"
    >
      <div className="container-shell">
        <div className="mx-auto max-w-3xl space-y-8 text-center">
          <p className="section-kicker text-ink/70">Until the Big Day</p>

          {time.elapsed ? (
            <p className="font-display text-5xl text-gold-500 sm:text-6xl lg:text-7xl">
              D&apos;DAY
            </p>
          ) : (
            <div className="flex items-start justify-center gap-2 sm:gap-4">
              {UNITS.map(({ key, label }, i) => (
                <Fragment key={key}>
                  {i > 0 && (
                    <span
                      aria-hidden="true"
                      className="mt-1 font-display text-3xl leading-none text-gold-500 sm:mt-2 sm:text-4xl lg:text-5xl"
                    >
                      :
                    </span>
                  )}
                  <div className="flex flex-col items-center gap-1">
                    <span className="font-display text-4xl tabular-nums text-ink sm:text-5xl lg:text-6xl">
                      {pad(time[key])}
                    </span>
                    <span className="text-xs uppercase tracking-widest text-ink/50">
                      {label}
                    </span>
                  </div>
                </Fragment>
              ))}
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
