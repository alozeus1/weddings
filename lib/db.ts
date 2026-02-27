import { createPool, type QueryResult, type QueryResultRow } from "@vercel/postgres";

type Primitive = string | number | boolean | undefined | null;

const DATABASE_URL_ERROR =
  "DATABASE_URL is required (fallbacks: POSTGRES_URL, NEON_DATABASE_URL). Run `vercel env pull .env.local`.";

let pool: ReturnType<typeof createPool> | null = null;

type DatabaseConfig = {
  source: "DATABASE_URL" | "POSTGRES_URL" | "NEON_DATABASE_URL";
  value: string;
};

export function resolveDatabaseConfig(): DatabaseConfig | null {
  if (process.env.DATABASE_URL) {
    return { source: "DATABASE_URL", value: process.env.DATABASE_URL };
  }

  if (process.env.POSTGRES_URL) {
    return { source: "POSTGRES_URL", value: process.env.POSTGRES_URL };
  }

  if (process.env.NEON_DATABASE_URL) {
    return { source: "NEON_DATABASE_URL", value: process.env.NEON_DATABASE_URL };
  }

  return null;
}

export function getDatabaseDebugMeta(): {
  source: "DATABASE_URL" | "POSTGRES_URL" | "NEON_DATABASE_URL" | "unknown";
  hasUrl: boolean;
  host?: string;
} {
  const config = resolveDatabaseConfig();
  if (!config) {
    return { source: "unknown", hasUrl: false };
  }

  try {
    const host = new URL(config.value).host || undefined;
    return host ? { source: config.source, hasUrl: true, host } : { source: config.source, hasUrl: true };
  } catch {
    return { source: config.source, hasUrl: true };
  }
}

export function getDatabaseUrl(): string {
  const config = resolveDatabaseConfig();
  if (!config) {
    throw new Error(DATABASE_URL_ERROR);
  }

  return config.value;
}

export function hasDatabaseConfig(): boolean {
  return Boolean(resolveDatabaseConfig());
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
