# RSVP Countdown Timer Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Add a live real-time countdown timer ("UNTIL THE BIG DAY") between the PageHero and the RSVP form section on the `/rsvp` page.

**Architecture:** A `"use client"` component (`WeddingCountdown`) is created in `components/rsvp/countdown-timer.tsx`. It exports a pure `getTimeRemaining` function (for unit-testability) and the component itself. The RSVP page (`app/rsvp/page.tsx`) imports the wedding date from `content/couple.json` on the server and passes it as a prop — keeping the date DRY and sourced from the existing content layer.

**Tech Stack:** Next.js 15 App Router, React 19, TypeScript strict, Tailwind CSS (custom palette: ivory/ink/gold), Vitest (unit tests), Playwright (E2E).

---

## Context

**RSVP page current structure** (`app/rsvp/page.tsx`, 22 lines):
```tsx
<PageHero kicker="RSVP" title="Celebrate With Us" ... />
<Section title="RSVP Form" kicker="Secure Submission">
  <PhotoMosaic ... />
  <RSVPForm />
</Section>
```

**After this change:**
```tsx
<PageHero ... />
<WeddingCountdown targetDate="2026-06-12" />   ← NEW
<Section ...>
  <PhotoMosaic />
  <RSVPForm />
</Section>
```

**Wedding date source:** `content/couple.json` → `"date": "2026-06-12"` (already exists, no JSON change needed).

---

## Task 1: Write the failing unit test for `getTimeRemaining`

**Files:**
- Create: `tests/countdown-timer.test.ts`

**Step 1: Create the test file**

```typescript
// tests/countdown-timer.test.ts
import { describe, expect, it, vi } from "vitest";
import { getTimeRemaining } from "../components/rsvp/countdown-timer";

describe("getTimeRemaining", () => {
  it("returns correct days/hours/minutes/seconds for a future date", () => {
    // 2026-01-01T00:00:00Z → 2026-06-12T00:00:00Z = exactly 162 days
    vi.spyOn(Date, "now").mockReturnValue(new Date("2026-01-01T00:00:00Z").getTime());

    const result = getTimeRemaining("2026-06-12T00:00:00Z");

    expect(result.elapsed).toBe(false);
    expect(result.days).toBe(162);
    expect(result.hours).toBe(0);
    expect(result.minutes).toBe(0);
    expect(result.seconds).toBe(0);

    vi.restoreAllMocks();
  });

  it("correctly breaks down a non-round duration", () => {
    // target is 2 days, 3 hours, 45 minutes, 10 seconds from now
    const target = new Date("2026-06-12T12:00:00Z");
    const fromNow = (2 * 86400 + 3 * 3600 + 45 * 60 + 10) * 1000;
    vi.spyOn(Date, "now").mockReturnValue(target.getTime() - fromNow);

    const result = getTimeRemaining("2026-06-12T12:00:00Z");

    expect(result.elapsed).toBe(false);
    expect(result.days).toBe(2);
    expect(result.hours).toBe(3);
    expect(result.minutes).toBe(45);
    expect(result.seconds).toBe(10);

    vi.restoreAllMocks();
  });

  it("returns elapsed: true for a past date", () => {
    vi.spyOn(Date, "now").mockReturnValue(new Date("2026-07-01T00:00:00Z").getTime());

    const result = getTimeRemaining("2026-06-12");

    expect(result.elapsed).toBe(true);
    expect(result.days).toBe(0);
    expect(result.hours).toBe(0);
    expect(result.minutes).toBe(0);
    expect(result.seconds).toBe(0);

    vi.restoreAllMocks();
  });

  it("returns elapsed: true when target is exactly now", () => {
    const exact = new Date("2026-06-12T00:00:00Z").getTime();
    vi.spyOn(Date, "now").mockReturnValue(exact);

    const result = getTimeRemaining("2026-06-12T00:00:00Z");

    expect(result.elapsed).toBe(true);

    vi.restoreAllMocks();
  });
});
```

**Step 2: Run to verify it fails**

```bash
npx vitest run tests/countdown-timer.test.ts
```

Expected: `FAIL` — "Cannot find module '../components/rsvp/countdown-timer'"

---

## Task 2: Create the `WeddingCountdown` component

**Files:**
- Create: `components/rsvp/countdown-timer.tsx`

**Step 1: Write the component**

```tsx
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
```

**Step 2: Run the unit tests to verify they pass**

```bash
npx vitest run tests/countdown-timer.test.ts
```

Expected: `PASS` — all 4 tests green.

**Step 3: Run full unit test suite to check for regressions**

```bash
npm test
```

Expected: all tests pass (existing + new).

**Step 4: Commit**

```bash
git add components/rsvp/countdown-timer.tsx tests/countdown-timer.test.ts
git commit -m "feat: add WeddingCountdown component with unit tests"
```

---

## Task 3: Wire the countdown into the RSVP page

**Files:**
- Modify: `app/rsvp/page.tsx`

**Step 1: Replace the file contents**

The current file is 22 lines. The new version adds 2 imports and 1 JSX element:

```tsx
// app/rsvp/page.tsx
import { PageHero } from "@/components/sections/page-hero";
import { PhotoMosaic } from "@/components/sections/photo-mosaic";
import { Section } from "@/components/sections/section";
import { RSVPForm } from "@/components/rsvp/rsvp-form";
import { WeddingCountdown } from "@/components/rsvp/countdown-timer";
import { heroImages, pageMosaics } from "@/lib/media";
import couple from "@/content/couple.json";

export default function RSVPPage(): React.JSX.Element {
  return (
    <>
      <PageHero
        kicker="RSVP"
        title="Celebrate With Us"
        subtitle="Please confirm your attendance and meal preferences."
        heroImage={heroImages.rsvp}
      />
      <WeddingCountdown targetDate={couple.date} />
      <Section title="RSVP Form" kicker="Secure Submission">
        <PhotoMosaic images={[...pageMosaics.rsvp]} />
        <RSVPForm />
      </Section>
    </>
  );
}
```

**Step 2: Verify TypeScript compiles cleanly**

```bash
npx tsc --noEmit
```

Expected: no errors.

**Step 3: Start dev server and check visually**

```bash
npm run dev
```

Open `http://localhost:3000/rsvp`. Verify:
- Countdown section appears between the hero and the form
- Numbers tick every second
- Labels (Days / Hours / Mins / Secs) are visible
- No layout shift or console errors

**Step 4: Commit**

```bash
git add app/rsvp/page.tsx
git commit -m "feat: wire WeddingCountdown into RSVP page"
```

---

## Task 4: Add Playwright assertion for countdown visibility

**Files:**
- Modify: `e2e/rsvp.spec.ts` (append new test at bottom, before the closing of the file)

**Step 1: Append the new test**

Add this test at the end of `e2e/rsvp.spec.ts`, after line 175 (the last closing brace):

```typescript
test("countdown timer section is visible on the rsvp page", async ({ page }) => {
  await page.goto("/rsvp");

  const section = page.getByTestId("countdown-section");
  await expect(section).toBeVisible();
  await expect(page.getByText(/until the big day/i)).toBeVisible();
});
```

**Step 2: Run RSVP E2E tests**

```bash
npx playwright test e2e/rsvp.spec.ts --project=desktop-chrome
```

Expected: all tests pass including the new countdown visibility test.

**Step 3: Run full E2E suite (optional, for confidence)**

```bash
npm run test:e2e:chrome
```

Expected: all desktop tests pass with no regressions.

**Step 4: Commit**

```bash
git add e2e/rsvp.spec.ts
git commit -m "test: add e2e visibility assertion for countdown timer on /rsvp"
```

---

## Final Verification

**Step 1: Full CI pipeline**

```bash
npm run test:ci
```

This runs: typecheck → lint → build → unit tests → E2E. All steps must pass.

**Step 2: Check the build output**

After `npm run build`, verify no warnings about the new client component or JSON import.

---

## What was NOT changed

- `components/rsvp/rsvp-form.tsx` — untouched
- `components/sections/*` — untouched
- `lib/*` — untouched
- `content/couple.json` — read-only (no new keys added)
- All API routes, admin dashboards, Cloudinary, chatbot — untouched
- No new npm dependencies
