import { readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { parse } from "csv-parse/sync";
import { normalizeGuestValue, toOptionalValue } from "../lib/guests";

type GuestListEntry = {
  fullName: string;
  email: string | null;
  phoneLast4: string | null;
};

type CsvRow = {
  fullName?: string;
  email?: string;
  phoneLast4?: string;
};

type GuestListJsonShape = GuestListEntry[] | { guests?: GuestListEntry[] };

const digitsOnlyPattern = /\D/g;

function normalizePhoneLast4(value: string | null | undefined): string | null {
  if (!value) {
    return null;
  }

  const digits = value.replace(digitsOnlyPattern, "");
  return digits.length === 4 ? digits : null;
}

function sanitizeGuestEntry(entry: GuestListEntry): GuestListEntry | null {
  const fullName = toOptionalValue(entry.fullName);
  if (!fullName) {
    return null;
  }

  return {
    fullName,
    email: toOptionalValue(entry.email),
    phoneLast4: normalizePhoneLast4(entry.phoneLast4)
  };
}

function extractGuestEntries(value: GuestListJsonShape): GuestListEntry[] {
  if (Array.isArray(value)) {
    return value;
  }

  if (Array.isArray(value?.guests)) {
    return value.guests;
  }

  return [];
}

async function main(): Promise<void> {
  const csvPathArg = process.argv[2] || "content/guestlist.csv";
  const csvPath = path.resolve(process.cwd(), csvPathArg);
  const jsonPath = path.resolve(process.cwd(), "content/guestlist.json");

  const csvRaw = await readFile(csvPath, "utf-8");
  const headerRows = parse(csvRaw, {
    bom: true,
    to_line: 1
  }) as string[][];

  const headers = (headerRows[0] || []).map((value) => value.trim());
  if (!headers.includes("fullName")) {
    throw new Error("CSV must include a fullName column");
  }

  const parsedRows = parse(csvRaw, {
    columns: true,
    skip_empty_lines: true,
    trim: true,
    bom: true
  }) as CsvRow[];

  const existingRaw = JSON.parse(await readFile(jsonPath, "utf-8")) as GuestListJsonShape;
  const existing = extractGuestEntries(existingRaw)
    .map(sanitizeGuestEntry)
    .filter((entry): entry is GuestListEntry => Boolean(entry));

  const existingByNormalized = new Map<string, GuestListEntry>();
  for (const entry of existing) {
    existingByNormalized.set(normalizeGuestValue(entry.fullName), entry);
  }

  const csvSeen = new Set<string>();
  let csvDuplicateRows = 0;
  let csvInvalidRows = 0;
  let skippedExisting = 0;
  const inserted: GuestListEntry[] = [];

  for (const row of parsedRows) {
    const fullName = toOptionalValue(row.fullName);
    if (!fullName) {
      csvInvalidRows += 1;
      console.warn("[import:guests:csv] skipped row without fullName");
      continue;
    }

    const normalized = normalizeGuestValue(fullName);

    if (csvSeen.has(normalized)) {
      csvDuplicateRows += 1;
      console.warn(`[import:guests:csv] duplicate CSV row skipped: ${fullName}`);
      continue;
    }

    csvSeen.add(normalized);

    if (existingByNormalized.has(normalized)) {
      skippedExisting += 1;
      continue;
    }

    const entry: GuestListEntry = {
      fullName,
      email: toOptionalValue(row.email),
      phoneLast4: normalizePhoneLast4(row.phoneLast4)
    };

    inserted.push(entry);
    existingByNormalized.set(normalized, entry);
  }

  const merged = [...existing, ...inserted];
  const output: GuestListJsonShape = Array.isArray(existingRaw) ? merged : { guests: merged };
  await writeFile(jsonPath, `${JSON.stringify(output, null, 2)}\n`, "utf-8");

  console.log(`[import:guests:csv] file: ${csvPathArg}`);
  console.log(`[import:guests:csv] parsed rows: ${parsedRows.length}`);
  console.log(`[import:guests:csv] inserted: ${inserted.length}`);
  console.log(`[import:guests:csv] skipped existing: ${skippedExisting}`);
  console.log(`[import:guests:csv] duplicate CSV rows skipped: ${csvDuplicateRows}`);
  console.log(`[import:guests:csv] invalid rows skipped: ${csvInvalidRows}`);
  console.log(`[import:guests:csv] updated: content/guestlist.json`);
}

main().catch((error: unknown) => {
  console.error("[import:guests:csv] failed", error);
  process.exitCode = 1;
});
