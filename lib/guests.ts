import guestlist from "@/content/guestlist.json";

const punctuationPattern = /[^\p{L}\p{N}\s]/gu;
const digitsOnlyPattern = /\D/g;

type RawGuestSeedEntry = {
  fullName?: unknown;
  email?: unknown;
  phoneLast4?: unknown;
};

type RawGuestSeedData =
  | RawGuestSeedEntry[]
  | {
      guests?: RawGuestSeedEntry[];
    };

export type GuestSeedEntry = {
  fullName: string;
  email: string | null;
  phoneLast4: string | null;
};

export function normalizeGuestValue(value: string): string {
  return value
    .toLowerCase()
    .replace(punctuationPattern, " ")
    .replace(/\s+/g, " ")
    .trim();
}

export function toOptionalValue(value: string | null | undefined): string | null {
  if (typeof value !== "string") {
    return null;
  }

  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : null;
}

function normalizePhoneLast4(value: unknown): string | null {
  if (typeof value !== "string" && typeof value !== "number") {
    return null;
  }

  const digits = String(value).replace(digitsOnlyPattern, "");
  return digits.length === 4 ? digits : null;
}

function sanitizeGuestSeedEntry(entry: RawGuestSeedEntry): GuestSeedEntry | null {
  const fullName = toOptionalValue(typeof entry.fullName === "string" ? entry.fullName : null);
  if (!fullName) {
    return null;
  }

  return {
    fullName,
    email: toOptionalValue(typeof entry.email === "string" ? entry.email : null),
    phoneLast4: normalizePhoneLast4(entry.phoneLast4)
  };
}

function getRawGuestSeedEntries(value: RawGuestSeedData): RawGuestSeedEntry[] {
  if (Array.isArray(value)) {
    return value;
  }

  if (Array.isArray(value?.guests)) {
    return value.guests;
  }

  return [];
}

export const GUEST_SEED_ENTRIES: GuestSeedEntry[] = getRawGuestSeedEntries(guestlist as RawGuestSeedData)
  .map(sanitizeGuestSeedEntry)
  .filter((entry): entry is GuestSeedEntry => Boolean(entry));

export const GUEST_SEED_NAMES = GUEST_SEED_ENTRIES.map((entry) => entry.fullName);

export function buildGuestDisplayName(fullName: string): string {
  const parts = fullName.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) {
    return "";
  }

  if (parts.length === 1) {
    return parts[0];
  }

  const firstName = parts[0];
  const lastInitial = parts[parts.length - 1]?.charAt(0)?.toUpperCase() ?? "";
  return `${firstName} ${lastInitial}.`;
}
