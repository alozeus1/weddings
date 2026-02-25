import { randomUUID } from "node:crypto";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { sql } from "@vercel/postgres";
import { GUEST_SEED_ENTRIES, type GuestSeedEntry, buildGuestDisplayName, normalizeGuestValue, toOptionalValue } from "@/lib/guests";
import type { GuestRecord, GuestStatus, InviteRequestRecord, InviteRequestStatus, UploadRecord } from "@/types/content";

const dataDir = path.join(process.cwd(), ".data");
const uploadsFile = path.join(dataDir, "uploads.json");
const guestsFile = path.join(dataDir, "guests.json");
const inviteRequestsFile = path.join(dataDir, "invite-requests.json");
const shouldUseFilePersistence = process.env.NODE_ENV === "development";
const inviteRequestPersistenceError = "Invite request persistence requires DATABASE_URL outside development.";

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

type InviteRequestRow = {
  id: string;
  full_name: string;
  email: string | null;
  phone: string | null;
  message: string | null;
  status: string;
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
  phoneLast4?: string;
};

export type InviteRequestInput = {
  fullName: string;
  email?: string;
  phone?: string;
  message?: string;
};

export type SeedGuestsResult = {
  sourceTotal: number;
  sourceDuplicates: number;
  inserted: number;
  skippedExisting: number;
};

let memoryGuests: GuestRecord[] = [];
let memoryGuestsInitialized = false;
let memoryInviteRequests: InviteRequestRecord[] = [];

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
  return Boolean(process.env.DATABASE_URL);
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

function mapInviteRequestRow(row: InviteRequestRow): InviteRequestRecord {
  const status: InviteRequestStatus =
    row.status === "approved" || row.status === "rejected" || row.status === "pending" ? row.status : "pending";

  return {
    id: row.id,
    fullName: row.full_name,
    email: row.email,
    phone: row.phone,
    message: row.message,
    status,
    createdAt: toIsoString(row.created_at)
  };
}

function createGuestRecord(entry: { fullName: string; email?: string | null; phoneLast4?: string | null }): GuestRecord {
  const now = new Date().toISOString();
  return {
    id: randomUUID(),
    fullName: entry.fullName.trim(),
    normalized: normalizeGuestValue(entry.fullName),
    email: toOptionalValue(entry.email ?? null),
    phoneLast4: toOptionalValue(entry.phoneLast4 ?? null),
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

function extractPhoneLast4(phone: string | null | undefined): string | null {
  const cleaned = (phone ?? "").replace(/\D/g, "");
  if (cleaned.length < 4) {
    return null;
  }

  return cleaned.slice(-4);
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
        memoryGuests = rows;
        memoryGuestsInitialized = true;
        return rows;
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

async function readInviteRequestsNoDb(): Promise<InviteRequestRecord[]> {
  if (!shouldUseFilePersistence) {
    throw new Error(inviteRequestPersistenceError);
  }

  if (shouldUseFilePersistence) {
    try {
      const rows = await readJsonFile<InviteRequestRecord>(inviteRequestsFile);
      memoryInviteRequests = rows;
      return rows;
    } catch (error) {
      console.error("[invite-requests] Failed reading local invite request store. Falling back to memory.", error);
    }
  }

  return memoryInviteRequests;
}

async function writeInviteRequestsNoDb(rows: InviteRequestRecord[]): Promise<void> {
  if (!shouldUseFilePersistence) {
    throw new Error(inviteRequestPersistenceError);
  }

  memoryInviteRequests = rows;

  try {
    await writeJsonFile(inviteRequestsFile, rows);
  } catch (error) {
    console.error("[invite-requests] Failed writing local invite request store. Keeping in-memory state.", error);
  }
}

export async function ensureTables(): Promise<void> {
  if (!hasDatabase()) {
    return;
  }

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

  await sql`
    CREATE TABLE IF NOT EXISTS invite_requests (
      id TEXT PRIMARY KEY,
      full_name TEXT NOT NULL,
      email TEXT,
      phone TEXT,
      message TEXT,
      status TEXT NOT NULL DEFAULT 'pending',
      created_at TIMESTAMP NOT NULL
    );
  `;
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
          id, full_name, normalized, email, phone_last4, status, plus_one_name, meal_category, protein, soup, dietary, message, updated_at, created_at
        ) VALUES (
          ${randomUUID()}, ${entry.fullName}, ${entry.normalized}, ${entry.email}, ${entry.phoneLast4}, ${"pending"}, ${null}, ${null}, ${null}, ${null}, ${null}, ${null}, ${now}, ${now}
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
  const phoneLast4 = toOptionalValue(input.phoneLast4);

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
        phone_last4 = COALESCE(${phoneLast4}, phone_last4),
        updated_at = ${now}
      WHERE id = ${guestId}
      RETURNING
        id,
        full_name,
        normalized,
        email,
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
    phoneLast4: phoneLast4 ?? current.phoneLast4,
    updatedAt: now
  };
  rows[index] = updated;
  await writeGuestsNoDb(rows);
  return updated;
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

async function ensureGuestFromInviteRequest(request: InviteRequestRecord): Promise<GuestRecord> {
  const normalized = normalizeGuestValue(request.fullName);
  const phoneLast4 = extractPhoneLast4(request.phone);

  if (hasDatabase()) {
    await ensureTables();

    const existing = await sql<GuestRow>`
      SELECT
        id,
        full_name,
        normalized,
        email,
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
      WHERE normalized = ${normalized}
      LIMIT 1
    `;

    if (existing.rows[0]) {
      return mapGuestRow(existing.rows[0]);
    }

    const now = new Date().toISOString();
    const inserted = await sql<GuestRow>`
      INSERT INTO guests (
        id, full_name, normalized, email, phone_last4, status, plus_one_name, meal_category, protein, soup, dietary, message, updated_at, created_at
      ) VALUES (
        ${randomUUID()},
        ${request.fullName},
        ${normalized},
        ${toOptionalValue(request.email)},
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
      RETURNING
        id,
        full_name,
        normalized,
        email,
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

    return mapGuestRow(inserted.rows[0]);
  }

  const guests = await readGuestsNoDb();
  const existing = guests.find((guest) => guest.normalized === normalized);
  if (existing) {
    return existing;
  }

  const created = createGuestRecord({
    fullName: request.fullName,
    email: request.email,
    phoneLast4
  });
  guests.push(created);
  await writeGuestsNoDb(guests);
  return created;
}

export async function createInviteRequest(input: InviteRequestInput): Promise<InviteRequestRecord> {
  const fullName = toOptionalValue(input.fullName);
  if (!fullName) {
    throw new Error("Full name is required.");
  }

  const record: InviteRequestRecord = {
    id: randomUUID(),
    fullName,
    email: toOptionalValue(input.email),
    phone: toOptionalValue(input.phone),
    message: toOptionalValue(input.message),
    status: "pending",
    createdAt: new Date().toISOString()
  };

  if (hasDatabase()) {
    await ensureTables();
    await sql`
      INSERT INTO invite_requests (id, full_name, email, phone, message, status, created_at)
      VALUES (${record.id}, ${record.fullName}, ${record.email}, ${record.phone}, ${record.message}, ${record.status}, ${record.createdAt})
    `;
    return record;
  }

  if (!shouldUseFilePersistence) {
    throw new Error(inviteRequestPersistenceError);
  }

  const rows = await readInviteRequestsNoDb();
  rows.push(record);
  await writeInviteRequestsNoDb(rows);
  return record;
}

export async function listInviteRequests(status: InviteRequestStatus | "all" = "all"): Promise<InviteRequestRecord[]> {
  if (hasDatabase()) {
    await ensureTables();
    const rows =
      status === "all"
        ? await sql<InviteRequestRow>`
            SELECT id, full_name, email, phone, message, status, created_at
            FROM invite_requests
            ORDER BY created_at DESC
          `
        : await sql<InviteRequestRow>`
            SELECT id, full_name, email, phone, message, status, created_at
            FROM invite_requests
            WHERE status = ${status}
            ORDER BY created_at DESC
          `;

    return rows.rows.map(mapInviteRequestRow);
  }

  if (!shouldUseFilePersistence) {
    throw new Error(inviteRequestPersistenceError);
  }

  const rows = await readInviteRequestsNoDb();
  return rows
    .filter((row) => (status === "all" ? true : row.status === status))
    .sort((a, b) => (a.createdAt < b.createdAt ? 1 : -1));
}

async function updateInviteRequestStatus(
  id: string,
  status: InviteRequestStatus
): Promise<InviteRequestRecord | null> {
  if (hasDatabase()) {
    await ensureTables();
    const result = await sql<InviteRequestRow>`
      UPDATE invite_requests
      SET status = ${status}
      WHERE id = ${id}
      RETURNING id, full_name, email, phone, message, status, created_at
    `;

    const row = result.rows[0];
    return row ? mapInviteRequestRow(row) : null;
  }

  if (!shouldUseFilePersistence) {
    throw new Error(inviteRequestPersistenceError);
  }

  const rows = await readInviteRequestsNoDb();
  const index = rows.findIndex((row) => row.id === id);
  if (index < 0) {
    return null;
  }

  const updated = { ...rows[index], status };
  rows[index] = updated;
  await writeInviteRequestsNoDb(rows);
  return updated;
}

export async function approveInviteRequest(id: string): Promise<{ request: InviteRequestRecord; guest: GuestRecord } | null> {
  const request = await updateInviteRequestStatus(id, "approved");
  if (!request) {
    return null;
  }

  const guest = await ensureGuestFromInviteRequest(request);
  return { request, guest };
}

export async function rejectInviteRequest(id: string): Promise<InviteRequestRecord | null> {
  return updateInviteRequestStatus(id, "rejected");
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
