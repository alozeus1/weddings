import { createHash, timingSafeEqual } from "node:crypto";

function stripWrappingQuotes(value: string): string {
  if (value.length < 2) {
    return value;
  }

  const first = value[0];
  const last = value[value.length - 1];
  const isWrappedInDoubleQuotes = first === '"' && last === '"';
  const isWrappedInSingleQuotes = first === "'" && last === "'";

  if (isWrappedInDoubleQuotes || isWrappedInSingleQuotes) {
    return value.slice(1, -1);
  }

  return value;
}

export function normalizePassphrase(value: string): string {
  return stripWrappingQuotes(value.trim()).trim();
}

export function getConfiguredPassphrase(raw: string | undefined): string | null {
  if (!raw) {
    return null;
  }

  const normalized = normalizePassphrase(raw);
  return normalized.length > 0 ? normalized : null;
}

export function summarizePassphrase(value: string): { length: number; hashPrefix: string } {
  const normalized = normalizePassphrase(value);
  const hashPrefix = createHash("sha256").update(normalized).digest("hex").slice(0, 10);
  return {
    length: normalized.length,
    hashPrefix
  };
}

export function isPassphraseValid(input: string, expected: string): boolean {
  const normalizedInput = normalizePassphrase(input);
  const normalizedExpected = normalizePassphrase(expected);
  const inputBuffer = Buffer.from(normalizedInput, "utf8");
  const expectedBuffer = Buffer.from(normalizedExpected, "utf8");
  const sameLength = inputBuffer.length === expectedBuffer.length;
  const comparableExpected = sameLength ? expectedBuffer : Buffer.alloc(inputBuffer.length);
  const matched = timingSafeEqual(inputBuffer, comparableExpected);
  return sameLength && matched;
}
