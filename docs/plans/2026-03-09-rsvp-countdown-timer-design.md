# Design: RSVP Page Countdown Timer

**Date:** 2026-03-09
**Status:** Approved
**Feature:** Live countdown timer on the RSVP page

---

## Summary

Add a real-time countdown timer ("UNTIL THE BIG DAY") to the RSVP page, placed between the existing `<PageHero>` and the `<Section>` containing `<PhotoMosaic>` and `<RSVPForm>`. The countdown shows days, hours, minutes, and seconds until June 12, 2026 and replaces with "D'DAY" when the date has passed.

---

## Placement (Option A — Approved)

```
app/rsvp/page.tsx
├── <PageHero>              ← unchanged
├── <WeddingCountdown>      ← NEW: lightweight full-width section
└── <Section>               ← unchanged (PhotoMosaic + RSVPForm)
```

**Rationale:** Does not touch the existing form section. Gives the countdown its own visual beat. Creates natural flow: hero → anticipation → RSVP action.

---

## Architecture

### New file: `components/rsvp/countdown-timer.tsx`

- `"use client"` directive (needs `useEffect` + `setInterval`)
- Accepts `targetDate: string` prop (ISO date string from `couple.json`)
- Exports `WeddingCountdown` — a full-width section wrapper with heading + timer grid
- Pure countdown math extracted into a standalone function `getTimeRemaining(targetDate)` — enables unit testing without DOM

**Component breakdown:**
```
WeddingCountdown (section, server-renderable shell)
└── CountdownClock (client, owns timer state)
    ├── heading: "UNTIL THE BIG DAY"
    ├── [DD] : [HH] : [MM] : [SS]  (or "D'DAY" when elapsed)
    └── labels: Days / Hours / Mins / Secs
```

Can export both from the same file since the component is small and cohesive.

### Modified file: `app/rsvp/page.tsx`

- Import `couple.json` (already a pattern in the repo for content)
- Read `couple.date` on the server
- Pass it as `targetDate` prop to `<WeddingCountdown>`
- No other changes

### No changes to:
- `components/rsvp/rsvp-form.tsx`
- `components/sections/*`
- `lib/*`, `content/*.json` (date already in `couple.json`)
- Any API routes, admin dashboards, DB, Cloudinary

---

## Design Spec

**Visual treatment:**
- Full-width section with `bg-hero-warm` or `bg-ivory` (matches existing page rhythm)
- Subtle top/bottom border using `border-gold-300/30` (same as PageHero)
- Heading: `section-kicker` style (`text-xs tracking-widest uppercase`) — matches existing kicker pattern
- Number blocks: large `font-display` numerals (Playfair Display), `text-ink`
- Separator `:` in `text-gold-500`
- Labels: `text-xs text-ink/50 tracking-widest uppercase`
- No shadows, no animations, no transforms — static elegant

**Responsive:**
- Numbers scale: `text-4xl sm:text-5xl lg:text-6xl`
- Labels always visible, single line
- Works on mobile, tablet, desktop

**Dark mode:** Uses existing Tailwind palette — `text-ink` and `bg-ivory` behave correctly if dark mode is ever added

**Zero state:** "D'DAY" shown centered in place of the timer grid, same typographic weight

---

## State & Logic

```typescript
type TimeRemaining = {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
  elapsed: boolean;
};

function getTimeRemaining(targetDate: string): TimeRemaining
```

- Computes `target - now` in milliseconds
- Returns `{ elapsed: true }` when diff ≤ 0
- Used by `useEffect` interval (1000ms) — updates state each tick
- `clearInterval` on unmount — no leaks
- Initial state renders server-side with `elapsed: false, all zeros` — hydration safe (avoids flicker on fast connections)

---

## Testing

### Unit test: `tests/countdown-timer.test.ts`
- Test `getTimeRemaining` with a known future date → correct days/hours/minutes/seconds
- Test with a past date → `elapsed: true`
- Test with exactly now → `elapsed: true`
- No DOM required — pure function

### E2E: `e2e/rsvp.spec.ts` (new or extends existing)
- Navigate to `/rsvp`
- Assert countdown section is visible (`data-testid="countdown-section"`)
- Assert at least one number block is visible
- Assert heading text "UNTIL THE BIG DAY" is present
- Not brittle — does not assert specific second/minute values

---

## Implementation Checklist

1. Create `components/rsvp/countdown-timer.tsx` with `getTimeRemaining` function + `WeddingCountdown` component
2. Update `app/rsvp/page.tsx` to import `couple.json` and render `<WeddingCountdown targetDate={couple.date} />`
3. Add `tests/countdown-timer.test.ts` with pure-function unit tests
4. Add/update `e2e/rsvp.spec.ts` with visibility assertion on `/rsvp`

---

## Non-Goals

- No changes to DB, Cloudinary, chatbot, API routes, admin dashboards
- No new npm dependencies
- No refactoring of unrelated components
- No over-engineering (date stays in `couple.json`, no new JSON key needed)
