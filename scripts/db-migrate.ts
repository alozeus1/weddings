import { createPool } from "@vercel/postgres";

function getDatabaseUrl(): string {
  const value = process.env.DATABASE_URL || process.env.POSTGRES_URL;
  if (!value) {
    throw new Error("DATABASE_URL is required for db:migrate. Run: vercel env pull .env.local");
  }

  return value;
}

async function main(): Promise<void> {
  const connectionString = getDatabaseUrl();
  const pool = createPool({ connectionString });
  const sql = pool.sql;

  await sql`CREATE EXTENSION IF NOT EXISTS pgcrypto`;

  await sql`
    CREATE TABLE IF NOT EXISTS guest_uploads (
      id TEXT PRIMARY KEY,
      url TEXT NOT NULL,
      uploaded_by_name TEXT,
      created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
      status TEXT NOT NULL DEFAULT 'pending'
    );
  `;
  await sql`ALTER TABLE guest_uploads ADD COLUMN IF NOT EXISTS uploaded_by_name TEXT`;
  await sql`ALTER TABLE guest_uploads ADD COLUMN IF NOT EXISTS created_at TIMESTAMPTZ NOT NULL DEFAULT now()`;
  await sql`ALTER TABLE guest_uploads ADD COLUMN IF NOT EXISTS status TEXT NOT NULL DEFAULT 'pending'`;
  await sql`ALTER TABLE guest_uploads ALTER COLUMN status SET DEFAULT 'pending'`;

  await sql`
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
  `;
  await sql`ALTER TABLE guests ADD COLUMN IF NOT EXISTS normalized TEXT`;
  await sql`ALTER TABLE guests ADD COLUMN IF NOT EXISTS email TEXT`;
  await sql`ALTER TABLE guests ADD COLUMN IF NOT EXISTS phone_last4 TEXT`;
  await sql`ALTER TABLE guests ADD COLUMN IF NOT EXISTS status TEXT`;
  await sql`ALTER TABLE guests ADD COLUMN IF NOT EXISTS plus_one_name TEXT`;
  await sql`ALTER TABLE guests ADD COLUMN IF NOT EXISTS meal_category TEXT`;
  await sql`ALTER TABLE guests ADD COLUMN IF NOT EXISTS protein TEXT`;
  await sql`ALTER TABLE guests ADD COLUMN IF NOT EXISTS soup TEXT`;
  await sql`ALTER TABLE guests ADD COLUMN IF NOT EXISTS dietary TEXT`;
  await sql`ALTER TABLE guests ADD COLUMN IF NOT EXISTS message TEXT`;
  await sql`ALTER TABLE guests ADD COLUMN IF NOT EXISTS created_at TIMESTAMPTZ NOT NULL DEFAULT now()`;
  await sql`ALTER TABLE guests ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ NOT NULL DEFAULT now()`;
  await sql`ALTER TABLE guests ALTER COLUMN status SET DEFAULT 'pending'`;
  await sql`
    UPDATE guests
    SET normalized = lower(trim(regexp_replace(regexp_replace(full_name, '[^[:alnum:][:space:]]', ' ', 'g'), '\\s+', ' ', 'g')))
    WHERE normalized IS NULL
  `;
  await sql`ALTER TABLE guests ALTER COLUMN normalized SET NOT NULL`;

  await sql`
    CREATE TABLE IF NOT EXISTS invite_requests (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      full_name TEXT NOT NULL,
      normalized TEXT NOT NULL,
      email TEXT NULL,
      phone TEXT NULL,
      message TEXT NULL,
      status TEXT NOT NULL DEFAULT 'pending',
      created_at TIMESTAMPTZ NOT NULL DEFAULT now()
    );
  `;
  await sql`ALTER TABLE invite_requests ADD COLUMN IF NOT EXISTS email TEXT`;
  await sql`ALTER TABLE invite_requests ADD COLUMN IF NOT EXISTS phone TEXT`;
  await sql`ALTER TABLE invite_requests ADD COLUMN IF NOT EXISTS message TEXT`;
  await sql`ALTER TABLE invite_requests ADD COLUMN IF NOT EXISTS status TEXT`;
  await sql`ALTER TABLE invite_requests ADD COLUMN IF NOT EXISTS created_at TIMESTAMPTZ NOT NULL DEFAULT now()`;
  await sql`ALTER TABLE invite_requests ALTER COLUMN status SET DEFAULT 'pending'`;

  await sql`ALTER TABLE invite_requests ADD COLUMN IF NOT EXISTS normalized TEXT`;
  await sql`
    UPDATE invite_requests
    SET normalized = lower(trim(regexp_replace(regexp_replace(full_name, '[^[:alnum:][:space:]]', ' ', 'g'), '\\s+', ' ', 'g')))
    WHERE normalized IS NULL
  `;
  await sql`ALTER TABLE invite_requests ALTER COLUMN normalized SET NOT NULL`;

  await sql`CREATE UNIQUE INDEX IF NOT EXISTS guests_normalized_idx ON guests(normalized)`;
  await sql`CREATE INDEX IF NOT EXISTS invite_requests_status_idx ON invite_requests(status)`;
  await sql`CREATE INDEX IF NOT EXISTS invite_requests_normalized_idx ON invite_requests(normalized)`;

  console.log(
    JSON.stringify(
      {
        ok: true,
        migrated: [
          "guest_uploads",
          "guests",
          "invite_requests",
          "guests_normalized_idx",
          "invite_requests_status_idx",
          "invite_requests_normalized_idx"
        ]
      },
      null,
      2
    )
  );
}

main().catch((error) => {
  console.error("db:migrate failed:", error instanceof Error ? error.message : "Unknown error");
  process.exitCode = 1;
});
