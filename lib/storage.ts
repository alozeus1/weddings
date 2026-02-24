import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { sql } from "@vercel/postgres";
import type { RSVPRecord, UploadRecord } from "@/types/content";

const dataDir = path.join(process.cwd(), ".data");
const rsvpFile = path.join(dataDir, "rsvp.json");
const uploadsFile = path.join(dataDir, "uploads.json");

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

export async function ensureTables(): Promise<void> {
  if (!hasDatabase()) {
    return;
  }

  await sql`
    CREATE TABLE IF NOT EXISTS rsvp_submissions (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      email TEXT NOT NULL,
      phone TEXT NOT NULL,
      attending BOOLEAN NOT NULL,
      plus_one_name TEXT NOT NULL,
      meal_category TEXT NOT NULL,
      protein TEXT NOT NULL,
      soup TEXT NOT NULL,
      dietary TEXT NOT NULL,
      message TEXT NOT NULL,
      created_at TIMESTAMP NOT NULL
    );
  `;

  await sql`
    CREATE TABLE IF NOT EXISTS guest_uploads (
      id TEXT PRIMARY KEY,
      url TEXT NOT NULL,
      uploaded_by_name TEXT,
      created_at TIMESTAMP NOT NULL,
      status TEXT NOT NULL
    );
  `;
}

export async function saveRSVP(entry: RSVPRecord): Promise<void> {
  if (hasDatabase()) {
    await ensureTables();
    await sql`
      INSERT INTO rsvp_submissions (
        id, name, email, phone, attending, plus_one_name, meal_category, protein, soup, dietary, message, created_at
      ) VALUES (
        ${entry.id}, ${entry.name}, ${entry.email}, ${entry.phone}, ${entry.attending}, ${entry.plusOneName},
        ${entry.mealCategory}, ${entry.protein}, ${entry.soup}, ${entry.dietary}, ${entry.message}, ${entry.createdAt}
      )
    `;
    return;
  }

  const rows = await readJsonFile<RSVPRecord>(rsvpFile);
  rows.push(entry);
  await writeJsonFile(rsvpFile, rows);
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
      ? await sql`SELECT id, url, uploaded_by_name, created_at, status FROM guest_uploads ORDER BY created_at DESC`
      : await sql`SELECT id, url, uploaded_by_name, created_at, status FROM guest_uploads WHERE status = 'approved' ORDER BY created_at DESC`;

    return result.rows.map((row) => ({
      id: row.id,
      url: row.url,
      uploadedByName: row.uploaded_by_name,
      createdAt: new Date(row.created_at).toISOString(),
      status: row.status
    })) as UploadRecord[];
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
