import { describe, expect, it } from "vitest";
import { getConfiguredPassphrase, isPassphraseValid, normalizePassphrase } from "../lib/rsvp-passphrase";

describe("rsvp passphrase helpers", () => {
  it("normalizes passphrase by trimming and removing wrapping quotes", () => {
    expect(normalizePassphrase('  "JC2026"  ')).toBe("JC2026");
    expect(normalizePassphrase("  'JC2026'  ")).toBe("JC2026");
    expect(normalizePassphrase("  JC2026  ")).toBe("JC2026");
  });

  it("configured passphrase returns null when empty after normalization", () => {
    expect(getConfiguredPassphrase(undefined)).toBeNull();
    expect(getConfiguredPassphrase("   ")).toBeNull();
    expect(getConfiguredPassphrase('""')).toBeNull();
  });

  it("verification succeeds when environment passphrase is quoted", () => {
    const configured = getConfiguredPassphrase('"JC2026"');
    expect(configured).toBeTruthy();
    expect(isPassphraseValid("JC2026", configured!)).toBe(true);
  });

  it("verification fails for wrong passphrase", () => {
    const configured = getConfiguredPassphrase("JC2026");
    expect(configured).toBeTruthy();
    expect(isPassphraseValid("WRONG", configured!)).toBe(false);
  });

  it("verification handles length mismatch without throwing", () => {
    const configured = getConfiguredPassphrase("JC2026");
    expect(configured).toBeTruthy();
    expect(() => isPassphraseValid("J", configured!)).not.toThrow();
    expect(isPassphraseValid("J", configured!)).toBe(false);
  });
});
