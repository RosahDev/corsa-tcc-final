import type { PoolConfig } from "pg";

export function normalizeConnectionString(connectionString: string): string {
  const cleaned = connectionString.replace(/[?&]sslmode=[^&]+/gi, "");
  return cleaned.endsWith("?") ? cleaned.slice(0, -1) : cleaned;
}

export function getPoolConfig(connectionString: string): PoolConfig {
  const normalizedConnectionString = normalizeConnectionString(connectionString);
  const isSupabaseConnection = /supabase\.(?:co|com)/i.test(
    normalizedConnectionString,
  );

  return {
    connectionString: normalizedConnectionString,
    ...(isSupabaseConnection
      ? {
          ssl: {
            rejectUnauthorized: false,
          },
        }
      : {}),
  };
}
