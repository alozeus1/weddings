// @ts-nocheck
const { randomUUID } = require("node:crypto");
const { mkdir, readFile, writeFile } = require("node:fs/promises");
const path = require("node:path");

const rootDir = process.cwd();
const guestListFile = path.join(rootDir, "content", "guestlist.json");
const dataDir = path.join(rootDir, ".data");
const guestsFile = path.join(dataDir, "guests.json");

function normalizeGuestValue(value) {
  return String(value || "")
    .toLowerCase()
    .replace(/[^\p{L}\p{N}\s]/gu, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function toOptionalValue(value) {
  if (typeof value !== "string") {
    return null;
  }

  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : null;
}

function extractSeedEntries(raw) {
  if (Array.isArray(raw)) {
    return raw;
  }

  if (raw && Array.isArray(raw.guests)) {
    return raw.guests;
  }

  return [];
}

function sanitizeEntry(entry) {
  const fullName = toOptionalValue(entry?.fullName);
  if (!fullName) {
    return null;
  }

  return {
    fullName,
    email: toOptionalValue(entry?.email),
    phoneLast4: toOptionalValue(entry?.phoneLast4)
  };
}

async function loadSeedEntries() {
  const raw = await readFile(guestListFile, "utf-8");
  const parsed = JSON.parse(raw);
  return extractSeedEntries(parsed).map(sanitizeEntry).filter(Boolean);
}

function dedupeSeedEntries(entries) {
  const seen = new Set();
  const unique = [];
  let duplicates = 0;

  for (const entry of entries) {
    const normalized = normalizeGuestValue(entry.fullName);
    if (!normalized) {
      continue;
    }

    if (seen.has(normalized)) {
      duplicates += 1;
      continue;
    }

    seen.add(normalized);
    unique.push({ ...entry, normalized });
  }

  return { unique, duplicates };
}

function createGuestRecord(entry) {
  const now = new Date().toISOString();
  return {
    id: randomUUID(),
    fullName: entry.fullName,
    normalized: entry.normalized,
    email: entry.email || null,
    phoneLast4: entry.phoneLast4 || null,
    status: "pending",
    plusOneName: null,
    mealCategory: null,
    protein: null,
    soup: null,
    dietary: null,
    message: null,
    updatedAt: now,
    createdAt: now
  };
}

async function seedGuestsInDatabase(entries) {
  const { sql } = await import("@vercel/postgres");

  await sql`
    CREATE TABLE IF NOT EXISTS guests (
      id TEXT PRIMARY KEY,
      full_name TEXT NOT NULL,
      normalized TEXT NOT NULL,
      email TEXT,
      phone_last4 TEXT,
      status TEXT NOT NULL DEFAULT 'pending',
      plus_one_name TEXT,
      meal_category TEXT,
      protein TEXT,
      soup TEXT,
      dietary TEXT,
      message TEXT,
      updated_at TIMESTAMP NOT NULL,
      created_at TIMESTAMP NOT NULL
    );
  `;
  await sql`CREATE UNIQUE INDEX IF NOT EXISTS guests_normalized_idx ON guests (normalized);`;

  let inserted = 0;
  let skippedExisting = 0;

  for (const entry of entries) {
    const now = new Date().toISOString();
    const result = await sql`
      INSERT INTO guests (
        id, full_name, normalized, email, phone_last4, status, plus_one_name, meal_category, protein, soup, dietary, message, updated_at, created_at
      ) VALUES (
        ${randomUUID()}, ${entry.fullName}, ${entry.normalized}, ${entry.email}, ${entry.phoneLast4}, ${"pending"}, ${null}, ${null}, ${null}, ${null}, ${null}, ${null}, ${now}, ${now}
      )
      ON CONFLICT (normalized) DO NOTHING
      RETURNING id
    `;

    if (result.rowCount && result.rowCount > 0) {
      inserted += 1;
    } else {
      skippedExisting += 1;
    }
  }

  return { inserted, skippedExisting };
}

async function readExistingJsonGuests() {
  try {
    const raw = await readFile(guestsFile, "utf-8");
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

async function seedGuestsInJson(entries) {
  const existing = await readExistingJsonGuests();
  const seen = new Set(existing.map((entry) => entry.normalized).filter(Boolean));
  let inserted = 0;
  let skippedExisting = 0;

  for (const entry of entries) {
    if (seen.has(entry.normalized)) {
      skippedExisting += 1;
      continue;
    }

    seen.add(entry.normalized);
    existing.push(createGuestRecord(entry));
    inserted += 1;
  }

  if (inserted > 0) {
    await mkdir(dataDir, { recursive: true });
    await writeFile(guestsFile, JSON.stringify(existing, null, 2), "utf-8");
  }

  return { inserted, skippedExisting };
}

async function main() {
  const seedEntries = await loadSeedEntries();
  const { unique, duplicates } = dedupeSeedEntries(seedEntries);

  if (!process.env.DATABASE_URL) {
    const result = await seedGuestsInJson(unique);
    console.log(
      JSON.stringify(
        {
          sourceTotal: seedEntries.length,
          sourceDuplicates: duplicates,
          inserted: result.inserted,
          skippedExisting: result.skippedExisting,
          storage: "json"
        },
        null,
        2
      )
    );
    return;
  }

  const result = await seedGuestsInDatabase(unique);
  console.log(
    JSON.stringify(
      {
        sourceTotal: seedEntries.length,
        sourceDuplicates: duplicates,
        inserted: result.inserted,
        skippedExisting: result.skippedExisting,
        storage: "database"
      },
      null,
      2
    )
  );
}

main().catch((error) => {
  console.error("Failed to seed guests:", error);
  process.exitCode = 1;
});
