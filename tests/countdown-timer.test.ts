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
