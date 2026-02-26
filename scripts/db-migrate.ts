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

  await pool.query(`CREATE EXTENSION IF NOT EXISTS pgcrypto`);

  await pool.query(`
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
  `);
  await pool.query(`ALTER TABLE guests ADD COLUMN IF NOT EXISTS normalized TEXT`);
  await pool.query(`ALTER TABLE guests ADD COLUMN IF NOT EXISTS email TEXT`);
  await pool.query(`ALTER TABLE guests ADD COLUMN IF NOT EXISTS phone_last4 TEXT`);
  await pool.query(`ALTER TABLE guests ADD COLUMN IF NOT EXISTS status TEXT`);
  await pool.query(`ALTER TABLE guests ADD COLUMN IF NOT EXISTS plus_one_name TEXT`);
  await pool.query(`ALTER TABLE guests ADD COLUMN IF NOT EXISTS meal_category TEXT`);
  await pool.query(`ALTER TABLE guests ADD COLUMN IF NOT EXISTS protein TEXT`);
  await pool.query(`ALTER TABLE guests ADD COLUMN IF NOT EXISTS soup TEXT`);
  await pool.query(`ALTER TABLE guests ADD COLUMN IF NOT EXISTS dietary TEXT`);
  await pool.query(`ALTER TABLE guests ADD COLUMN IF NOT EXISTS message TEXT`);
  await pool.query(`ALTER TABLE guests ADD COLUMN IF NOT EXISTS created_at TIMESTAMPTZ NOT NULL DEFAULT now()`);
  await pool.query(`ALTER TABLE guests ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ NOT NULL DEFAULT now()`);
  await pool.query(`ALTER TABLE guests ALTER COLUMN status SET DEFAULT 'pending'`);
  await pool.query(`
    UPDATE guests
    SET normalized = lower(trim(regexp_replace(regexp_replace(full_name, '[^[:alnum:][:space:]]', ' ', 'g'), '\\s+', ' ', 'g')))
    WHERE normalized IS NULL
  `);
  await pool.query(`ALTER TABLE guests ALTER COLUMN normalized SET NOT NULL`);

  await pool.query(`
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
  `);
  await pool.query(`ALTER TABLE invite_requests ADD COLUMN IF NOT EXISTS email TEXT`);
  await pool.query(`ALTER TABLE invite_requests ADD COLUMN IF NOT EXISTS phone TEXT`);
  await pool.query(`ALTER TABLE invite_requests ADD COLUMN IF NOT EXISTS message TEXT`);
  await pool.query(`ALTER TABLE invite_requests ADD COLUMN IF NOT EXISTS status TEXT`);
  await pool.query(`ALTER TABLE invite_requests ADD COLUMN IF NOT EXISTS created_at TIMESTAMPTZ NOT NULL DEFAULT now()`);
  await pool.query(`ALTER TABLE invite_requests ALTER COLUMN status SET DEFAULT 'pending'`);

  await pool.query(`ALTER TABLE invite_requests ADD COLUMN IF NOT EXISTS normalized TEXT`);
  await pool.query(`
    UPDATE invite_requests
    SET normalized = lower(trim(regexp_replace(regexp_replace(full_name, '[^[:alnum:][:space:]]', ' ', 'g'), '\\s+', ' ', 'g')))
    WHERE normalized IS NULL
  `);
  await pool.query(`ALTER TABLE invite_requests ALTER COLUMN normalized SET NOT NULL`);

  await pool.query(`CREATE INDEX IF NOT EXISTS guests_normalized_idx ON guests(normalized)`);
  await pool.query(`CREATE INDEX IF NOT EXISTS invite_requests_status_idx ON invite_requests(status)`);

  console.log(
    JSON.stringify(
      {
        ok: true,
        migrated: ["guests", "invite_requests", "guests_normalized_idx", "invite_requests_status_idx"]
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
