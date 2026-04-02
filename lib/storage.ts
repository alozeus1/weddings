import { randomUUID } from "node:crypto";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { GUEST_SEED_ENTRIES, type GuestSeedEntry, buildGuestDisplayName, normalizeGuestValue, toOptionalValue } from "@/lib/guests";
import { hasDatabaseConfig, sql } from "@/lib/db";
import { getPhoneLast4, normalizePhone } from "@/lib/phone";
import type { GuestRecord, GuestStatus, UploadRecord } from "@/types/content";

const dataDir = path.join(process.cwd(), ".data");
const uploadsFile = path.join(dataDir, "uploads.json");
const guestsFile = path.join(dataDir, "guests.json");
const shouldUseFilePersistence = process.env.NODE_ENV === "development";

type UploadRow = {
  id: string;
  url: string;
  uploaded_by_name: string | null;
  created_at: string | Date;
  status: string;
};

type GuestRow = {
  id: string;
  full_name: string;
  normalized: string;
  email: string | null;
  phone: string | null;
  phone_last4: string | null;
  status: string;
  plus_one_name: string | null;
  meal_category: string | null;
  protein: string | null;
  soup: string | null;
  dietary: string | null;
  message: string | null;
  updated_at: string | Date;
  created_at: string | Date;
};

export type GuestSearchResult = {
  id: string;
  displayName: string;
};

export type GuestRSVPInput = {
  status: Exclude<GuestStatus, "pending">;
  plusOneName?: string;
  mealCategory?: string;
  protein?: string;
  soup?: string;
  dietary?: string;
  message?: string;
  email?: string;
  phone?: string;
  phoneLast4?: string;
};

export type SeedGuestsResult = {
  sourceTotal: number;
  sourceDuplicates: number;
  inserted: number;
  skippedExisting: number;
};

let memoryGuests: GuestRecord[] = [];
let memoryGuestsInitialized = false;

async function readJsonFile<T>(filePath: string): Promise<T[]> {
  try {
    const raw = await readFile(filePath, "utf-8");
    return JSON.parse(raw) as T[];
  } catch {
    return [];
  }
}

async function writeJsonFile<T>(filePath: string, data: T[]): Promise<void> {
  await mkdir(dataDir, { recursive: true });
  await writeFile(filePath, JSON.stringify(data, null, 2), "utf-8");
}

function hasDatabase(): boolean {
  return hasDatabaseConfig();
}

function toIsoString(value: string | Date): string {
  return new Date(value).toISOString();
}

function mapGuestRow(row: GuestRow): GuestRecord {
  const status: GuestStatus = row.status === "yes" || row.status === "no" ? row.status : "pending";
  return {
    id: row.id,
    fullName: row.full_name,
    normalized: row.normalized,
    email: row.email,
    phone: row.phone,
    phoneLast4: row.phone_last4,
    status,
    plusOneName: row.plus_one_name,
    mealCategory: row.meal_category,
    protein: row.protein,
    soup: row.soup,
    dietary: row.dietary,
    message: row.message,
    updatedAt: toIsoString(row.updated_at),
    createdAt: toIsoString(row.created_at)
  };
}

function sanitizeGuestRecord(row: GuestRecord): GuestRecord {
  return {
    ...row,
    email: toOptionalValue(row.email),
    phone: normalizePhone(row.phone),
    phoneLast4: toOptionalValue(row.phoneLast4)
  };
}

function createGuestRecord(entry: { fullName: string; email?: string | null; phone?: string | null; phoneLast4?: string | null }): GuestRecord {
  const phone = normalizePhone(entry.phone ?? null);
  const now = new Date().toISOString();
  return {
    id: randomUUID(),
    fullName: entry.fullName.trim(),
    normalized: normalizeGuestValue(entry.fullName),
    email: toOptionalValue(entry.email ?? null),
    phone,
    phoneLast4: toOptionalValue(entry.phoneLast4 ?? getPhoneLast4(phone)),
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

function createSeedGuest(entry: GuestSeedEntry): GuestRecord {
  return createGuestRecord({
    fullName: entry.fullName,
    email: entry.email,
    phoneLast4: entry.phoneLast4
  });
}

function dedupeSeedEntries(entries: GuestSeedEntry[]): {
  uniqueEntries: Array<GuestSeedEntry & { normalized: string }>;
  sourceDuplicates: number;
} {
  const seen = new Set<string>();
  const uniqueEntries: Array<GuestSeedEntry & { normalized: string }> = [];
  let sourceDuplicates = 0;

  for (const entry of entries) {
    const normalized = normalizeGuestValue(entry.fullName);
    if (!normalized) {
      continue;
    }

    if (seen.has(normalized)) {
      sourceDuplicates += 1;
      continue;
    }

    seen.add(normalized);
    uniqueEntries.push({ ...entry, normalized });
  }

  return { uniqueEntries, sourceDuplicates };
}

function buildInitialMemoryGuests(): GuestRecord[] {
  const { uniqueEntries } = dedupeSeedEntries(GUEST_SEED_ENTRIES);
  return uniqueEntries.map((entry) =>
    createGuestRecord({
      fullName: entry.fullName,
      email: entry.email,
      phoneLast4: entry.phoneLast4
    })
  );
}

function ensureMemoryGuestsInitialized(): void {
  if (memoryGuestsInitialized) {
    return;
  }

  memoryGuests = buildInitialMemoryGuests();
  memoryGuestsInitialized = true;
}

async function readGuestsNoDb(): Promise<GuestRecord[]> {
  if (shouldUseFilePersistence) {
    try {
      const rows = await readJsonFile<GuestRecord>(guestsFile);
      if (rows.length > 0) {
        memoryGuests = rows.map(sanitizeGuestRecord);
        memoryGuestsInitialized = true;
        return memoryGuests;
      }
    } catch (error) {
      console.error("[guests] Failed reading local guest store. Falling back to memory.", error);
    }
  }

  ensureMemoryGuestsInitialized();
  return memoryGuests;
}

async function writeGuestsNoDb(rows: GuestRecord[]): Promise<void> {
  memoryGuests = rows;
  memoryGuestsInitialized = true;

  if (!shouldUseFilePersistence) {
    return;
  }

  try {
    await writeJsonFile(guestsFile, rows);
  } catch (error) {
    console.error("[guests] Failed writing local guest store. Keeping in-memory state.", error);
  }
}

export async function ensureTables(): Promise<void> {
  if (!hasDatabase()) {
    return;
  }

  await sql`CREATE EXTENSION IF NOT EXISTS pgcrypto;`;

  await sql`
    CREATE TABLE IF NOT EXISTS guest_uploads (
      id TEXT PRIMARY KEY,
      url TEXT NOT NULL,
      uploaded_by_name TEXT,
      created_at TIMESTAMP NOT NULL,
      status TEXT NOT NULL
    );
  `;

  await sql`
    CREATE TABLE IF NOT EXISTS guests (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      full_name TEXT NOT NULL,
      normalized TEXT NOT NULL,
      email TEXT,
      phone TEXT,
      phone_last4 TEXT,
      status TEXT NOT NULL DEFAULT 'pending',
      plus_one_name TEXT,
      meal_category TEXT,
      protein TEXT,
      soup TEXT,
      dietary TEXT,
      message TEXT,
      created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
      updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
    );
  `;
  await sql`ALTER TABLE guests ADD COLUMN IF NOT EXISTS normalized TEXT;`;
  await sql`ALTER TABLE guests ADD COLUMN IF NOT EXISTS created_at TIMESTAMPTZ NOT NULL DEFAULT now();`;
  await sql`ALTER TABLE guests ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ NOT NULL DEFAULT now();`;
  await sql`ALTER TABLE guests ADD COLUMN IF NOT EXISTS phone TEXT;`;
  await sql`ALTER TABLE guests ALTER COLUMN status SET DEFAULT 'pending';`;
  await sql`
    UPDATE guests
    SET normalized = lower(trim(regexp_replace(regexp_replace(full_name, '[^[:alnum:][:space:]]', ' ', 'g'), '\s+', ' ', 'g')))
    WHERE normalized IS NULL
  `;
  await sql`ALTER TABLE guests ALTER COLUMN normalized SET NOT NULL;`;

  await sql`CREATE UNIQUE INDEX IF NOT EXISTS guests_normalized_idx ON guests (normalized);`;
  await sql`CREATE INDEX IF NOT EXISTS guests_normalized_search_idx ON guests (normalized);`;

}

export async function ensureGuestSeed(): Promise<void> {
  await seedGuests();
}

export async function seedGuests(seedEntries: GuestSeedEntry[] = GUEST_SEED_ENTRIES): Promise<SeedGuestsResult> {
  const { uniqueEntries, sourceDuplicates } = dedupeSeedEntries(seedEntries);
  const result: SeedGuestsResult = {
    sourceTotal: seedEntries.length,
    sourceDuplicates,
    inserted: 0,
    skippedExisting: 0
  };

  if (hasDatabase()) {
    await ensureTables();

    for (const entry of uniqueEntries) {
      const now = new Date().toISOString();
      const insertResult = await sql`
        INSERT INTO guests (
          id, full_name, normalized, email, phone, phone_last4, status, plus_one_name, meal_category, protein, soup, dietary, message, updated_at, created_at
        ) VALUES (
          ${randomUUID()}, ${entry.fullName}, ${entry.normalized}, ${entry.email}, ${null}, ${entry.phoneLast4}, ${"pending"}, ${null}, ${null}, ${null}, ${null}, ${null}, ${null}, ${now}, ${now}
        )
        ON CONFLICT (normalized) DO NOTHING
        RETURNING id
      `;

      if (insertResult.rowCount && insertResult.rowCount > 0) {
        result.inserted += 1;
      } else {
        result.skippedExisting += 1;
      }
    }

    return result;
  }

  const rows = await readGuestsNoDb();
  const existingNormalized = new Set(rows.map((row) => row.normalized));

  for (const entry of uniqueEntries) {
    if (existingNormalized.has(entry.normalized)) {
      result.skippedExisting += 1;
      continue;
    }

    existingNormalized.add(entry.normalized);
    rows.push(createSeedGuest(entry));
    result.inserted += 1;
  }

  if (result.inserted > 0) {
    await writeGuestsNoDb(rows);
  }

  return result;
}

export async function searchGuests(query: string): Promise<GuestSearchResult[]> {
  const normalizedQuery = normalizeGuestValue(query);
  if (normalizedQuery.length < 2) {
    return [];
  }

  await ensureGuestSeed();

  if (hasDatabase()) {
    const like = `%${normalizedQuery}%`;
    const result = await sql<Pick<GuestRow, "id" | "full_name">>`
      SELECT id, full_name
      FROM guests
      WHERE normalized LIKE ${like}
      ORDER BY full_name ASC
      LIMIT 5
    `;

    return result.rows.map((row) => ({
      id: row.id,
      displayName: buildGuestDisplayName(row.full_name)
    }));
  }

  const rows = await readGuestsNoDb();
  return rows
    .filter((row) => row.normalized.includes(normalizedQuery))
    .sort((a, b) => a.fullName.localeCompare(b.fullName))
    .slice(0, 5)
    .map((row) => ({
      id: row.id,
      displayName: buildGuestDisplayName(row.fullName)
    }));
}

export async function getGuestById(id: string): Promise<GuestRecord | null> {
  await ensureGuestSeed();

  if (hasDatabase()) {
    const result = await sql<GuestRow>`
      SELECT
        id,
        full_name,
        normalized,
        email,
        phone,
        phone_last4,
        status,
        plus_one_name,
        meal_category,
        protein,
        soup,
        dietary,
        message,
        updated_at,
        created_at
      FROM guests
      WHERE id = ${id}
      LIMIT 1
    `;

    const row = result.rows[0];
    return row ? mapGuestRow(row) : null;
  }

  const rows = await readGuestsNoDb();
  return rows.find((row) => row.id === id) ?? null;
}

export async function updateGuestRSVP(guestId: string, input: GuestRSVPInput): Promise<GuestRecord | null> {
  await ensureGuestSeed();

  const now = new Date().toISOString();
  const plusOneName = input.status === "yes" ? toOptionalValue(input.plusOneName) : null;
  const mealCategory = input.status === "yes" ? toOptionalValue(input.mealCategory) : null;
  const protein = input.status === "yes" ? toOptionalValue(input.protein) : null;
  const soup = input.status === "yes" ? toOptionalValue(input.soup) : null;
  const dietary = toOptionalValue(input.dietary);
  const message = toOptionalValue(input.message);
  const email = toOptionalValue(input.email);
  const phone = normalizePhone(input.phone);
  const phoneLast4 = toOptionalValue(input.phoneLast4) ?? getPhoneLast4(phone);

  if (hasDatabase()) {
    const result = await sql<GuestRow>`
      UPDATE guests
      SET
        status = ${input.status},
        plus_one_name = ${plusOneName},
        meal_category = ${mealCategory},
        protein = ${protein},
        soup = ${soup},
        dietary = ${dietary},
        message = ${message},
        email = COALESCE(${email}, email),
        phone = COALESCE(${phone}, phone),
        phone_last4 = COALESCE(${phoneLast4}, phone_last4),
        updated_at = ${now}
      WHERE id = ${guestId}
      RETURNING
        id,
        full_name,
        normalized,
        email,
        phone,
        phone_last4,
        status,
        plus_one_name,
        meal_category,
        protein,
        soup,
        dietary,
        message,
        updated_at,
        created_at
    `;

    const row = result.rows[0];
    return row ? mapGuestRow(row) : null;
  }

  const rows = await readGuestsNoDb();
  const index = rows.findIndex((row) => row.id === guestId);
  if (index < 0) {
    return null;
  }

  const current = rows[index];
  const updated: GuestRecord = {
    ...current,
    status: input.status,
    plusOneName,
    mealCategory,
    protein,
    soup,
    dietary,
    message,
    email: email ?? current.email,
    phone: phone ?? current.phone,
    phoneLast4: phoneLast4 ?? current.phoneLast4,
    updatedAt: now
  };
  rows[index] = updated;
  await writeGuestsNoDb(rows);
  return updated;
}

export async function getOrCreateGuestByFullName(
  fullName: string,
  contact?: { email?: string; phone?: string; phoneLast4?: string }
): Promise<GuestRecord> {
  await ensureGuestSeed();

  const normalized = normalizeGuestValue(fullName);
  if (!normalized) {
    throw new Error("Full name is required.");
  }

  const sanitizedFullName = fullName.trim();
  const email = toOptionalValue(contact?.email);
  const phone = normalizePhone(contact?.phone);
  const phoneLast4 = toOptionalValue(contact?.phoneLast4) ?? getPhoneLast4(phone);

  if (hasDatabase()) {
    const now = new Date().toISOString();
    const result = await sql<GuestRow>`
      INSERT INTO guests (
        id, full_name, normalized, email, phone, phone_last4, status, plus_one_name, meal_category, protein, soup, dietary, message, updated_at, created_at
      ) VALUES (
        ${randomUUID()},
        ${sanitizedFullName},
        ${normalized},
        ${email},
        ${phone},
        ${phoneLast4},
        ${"pending"},
        ${null},
        ${null},
        ${null},
        ${null},
        ${null},
        ${null},
        ${now},
        ${now}
      )
      ON CONFLICT (normalized) DO UPDATE
      SET full_name = guests.full_name
      RETURNING
        id,
        full_name,
        normalized,
        email,
        phone,
        phone_last4,
        status,
        plus_one_name,
        meal_category,
        protein,
        soup,
        dietary,
        message,
        updated_at,
        created_at
    `;

    return mapGuestRow(result.rows[0]);
  }

  const rows = await readGuestsNoDb();
  const existing = rows.find((guest) => guest.normalized === normalized);
  if (existing) {
    return existing;
  }

  const created = createGuestRecord({
    fullName: sanitizedFullName,
    email,
    phone,
    phoneLast4
  });
  rows.push(created);
  await writeGuestsNoDb(rows);
  return created;
}

export async function listGuestRSVPs(): Promise<GuestRecord[]> {
  await ensureGuestSeed();

  if (hasDatabase()) {
    const result = await sql<GuestRow>`
      SELECT
        id,
        full_name,
        normalized,
        email,
        phone,
        phone_last4,
        status,
        plus_one_name,
        meal_category,
        protein,
        soup,
        dietary,
        message,
        updated_at,
        created_at
      FROM guests
      ORDER BY updated_at DESC
    `;

    return result.rows.map(mapGuestRow);
  }

  const rows = await readGuestsNoDb();
  return rows.sort((a, b) => (a.updatedAt < b.updatedAt ? 1 : -1));
}

export async function listNotOnListAttendingRSVPs(): Promise<GuestRecord[]> {
  const seededNormalized = new Set(
    GUEST_SEED_ENTRIES.map((entry) => normalizeGuestValue(entry.fullName)).filter((value) => value.length > 0)
  );

  const guests = await listGuestRSVPs();
  return guests.filter((guest) => guest.status === "yes" && !seededNormalized.has(guest.normalized));
}

export async function saveUpload(entry: UploadRecord): Promise<void> {
  if (hasDatabase()) {
    await ensureTables();
    await sql`
      INSERT INTO guest_uploads (id, url, uploaded_by_name, created_at, status)
      VALUES (${entry.id}, ${entry.url}, ${entry.uploadedByName}, ${entry.createdAt}, ${entry.status})
    `;
    return;
  }

  const rows = await readJsonFile<UploadRecord>(uploadsFile);
  rows.push(entry);
  await writeJsonFile(uploadsFile, rows);
}

export async function listUploads(includePending = false): Promise<UploadRecord[]> {
  if (hasDatabase()) {
    await ensureTables();
    const result = includePending
      ? await sql<UploadRow>`SELECT id, url, uploaded_by_name, created_at, status FROM guest_uploads ORDER BY created_at DESC`
      : await sql<UploadRow>`
          SELECT id, url, uploaded_by_name, created_at, status
          FROM guest_uploads
          WHERE status = 'approved'
          ORDER BY created_at DESC
        `;

    return result.rows.map((row) => ({
      id: row.id,
      url: row.url,
      uploadedByName: row.uploaded_by_name,
      createdAt: toIsoString(row.created_at),
      status: row.status === "approved" ? "approved" : "pending"
    }));
  }

  const rows = await readJsonFile<UploadRecord>(uploadsFile);
  return rows
    .filter((row) => (includePending ? true : row.status === "approved"))
    .sort((a, b) => (a.createdAt < b.createdAt ? 1 : -1));
}

export async function approveUpload(id: string): Promise<void> {
  if (hasDatabase()) {
    await ensureTables();
    await sql`UPDATE guest_uploads SET status = 'approved' WHERE id = ${id}`;
    return;
  }

  const rows = await readJsonFile<UploadRecord>(uploadsFile);
  const updated = rows.map((row) => (row.id === id ? { ...row, status: "approved" as const } : row));
  await writeJsonFile(uploadsFile, updated);
}
