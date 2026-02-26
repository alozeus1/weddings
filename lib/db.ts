import { createPool, type QueryResult, type QueryResultRow } from "@vercel/postgres";

type Primitive = string | number | boolean | undefined | null;

const DATABASE_URL_ERROR = "DATABASE_URL is required (fallback: POSTGRES_URL). Run `vercel env pull .env.local`.";

let pool: ReturnType<typeof createPool> | null = null;

export function getDatabaseUrl(): string {
  const value = process.env.DATABASE_URL || process.env.POSTGRES_URL;
  if (!value) {
    throw new Error(DATABASE_URL_ERROR);
  }

  return value;
}

export function hasDatabaseConfig(): boolean {
  return Boolean(process.env.DATABASE_URL || process.env.POSTGRES_URL);
}

function getPool(): ReturnType<typeof createPool> {
  if (!pool) {
    pool = createPool({ connectionString: getDatabaseUrl() });
  }

  return pool;
}

export function sql<O extends QueryResultRow>(
  strings: TemplateStringsArray,
  ...values: Primitive[]
): Promise<QueryResult<O>> {
  return getPool().sql<O>(strings, ...values);
}
