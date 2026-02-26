// @ts-nocheck
const { readFile } = require("node:fs/promises");
const path = require("node:path");

const rootDir = process.cwd();
const guestListFile = path.join(rootDir, "content", "guestlist.json");

function getDatabaseUrl() {
  return process.env.DATABASE_URL || process.env.POSTGRES_URL || "";
}

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
    normalized: normalizeGuestValue(fullName),
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
    if (!entry.normalized) {
      continue;
    }

    if (seen.has(entry.normalized)) {
      duplicates += 1;
      continue;
    }

    seen.add(entry.normalized);
    unique.push(entry);
  }

  return { unique, duplicates };
}

async function ensureGuestsTable(pool) {
  await pool.query(`
    CREATE EXTENSION IF NOT EXISTS pgcrypto;

    CREATE TABLE IF NOT EXISTS guests (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      full_name TEXT NOT NULL,
      normalized TEXT NOT NULL UNIQUE,
      email TEXT NULL,
      phone_last4 TEXT NULL,
      status TEXT NOT NULL DEFAULT 'pending',
      plus_one_name TEXT NULL,
      meal_category TEXT NULL,
      protein TEXT NULL,
      soup TEXT NULL,
      dietary TEXT NULL,
      message TEXT NULL,
      created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
      updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
    );

    CREATE INDEX IF NOT EXISTS guests_normalized_idx ON guests(normalized);
  `);
}

async function seedGuestsInDatabase(entries) {
  const { createPool } = await import("@vercel/postgres");
  const pool = createPool({ connectionString: getDatabaseUrl() });

  await ensureGuestsTable(pool);

  let inserted = 0;
  let skippedExisting = 0;

  for (const entry of entries) {
    const result = await pool.query(
      `
        INSERT INTO guests (full_name, normalized, email, phone_last4)
        VALUES ($1, $2, $3, $4)
        ON CONFLICT (normalized) DO NOTHING
        RETURNING id
      `,
      [entry.fullName, entry.normalized, entry.email, entry.phoneLast4]
    );

    if (result.rowCount && result.rowCount > 0) {
      inserted += 1;
    } else {
      skippedExisting += 1;
    }
  }

  return { inserted, skippedExisting };
}

async function main() {
  const databaseUrl = getDatabaseUrl();
  if (!databaseUrl) {
    console.error("DATABASE_URL is required for seeding guests.");
    console.error("Run: vercel env pull .env.local");
    process.exitCode = 1;
    return;
  }

  const seedEntries = await loadSeedEntries();
  const { unique, duplicates } = dedupeSeedEntries(seedEntries);
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
