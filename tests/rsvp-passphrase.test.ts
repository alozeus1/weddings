import assert from "node:assert/strict";
import test from "node:test";
import { getConfiguredPassphrase, isPassphraseValid, normalizePassphrase } from "../lib/rsvp-passphrase";

test("normalizes passphrase by trimming and removing wrapping quotes", () => {
  assert.equal(normalizePassphrase('  "JC2026"  '), "JC2026");
  assert.equal(normalizePassphrase("  'JC2026'  "), "JC2026");
  assert.equal(normalizePassphrase("  JC2026  "), "JC2026");
});

test("configured passphrase returns null when empty after normalization", () => {
  assert.equal(getConfiguredPassphrase(undefined), null);
  assert.equal(getConfiguredPassphrase("   "), null);
  assert.equal(getConfiguredPassphrase('""'), null);
});

test("verification succeeds when environment passphrase is quoted", () => {
  const configured = getConfiguredPassphrase('"JC2026"');
  assert.ok(configured);
  assert.equal(isPassphraseValid("JC2026", configured), true);
});

test("verification fails for wrong passphrase", () => {
  const configured = getConfiguredPassphrase("JC2026");
  assert.ok(configured);
  assert.equal(isPassphraseValid("WRONG", configured), false);
});

test("verification handles length mismatch without throwing", () => {
  const configured = getConfiguredPassphrase("JC2026");
  assert.ok(configured);
  assert.doesNotThrow(() => isPassphraseValid("J", configured));
  assert.equal(isPassphraseValid("J", configured), false);
});
