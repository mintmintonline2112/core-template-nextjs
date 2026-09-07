import { DataSourceOptions, LoggerOptions } from 'typeorm';

type Env = NodeJS.ProcessEnv;
type SupportedDbType = 'mysql' | 'mariadb' | 'mssql';

function toBoolean(value: string | undefined, fallback = false): boolean {
  if (value === undefined) return fallback;
  return ['1', 'true', 'yes', 'on'].includes(value.toLowerCase());
}

function toInt(
  value: string | undefined,
  fallback?: number,
): number | undefined {
  if (value === undefined || value === '') return fallback;
  const parsed = Number.parseInt(value, 10);
  return Number.isFinite(parsed) ? parsed : fallback;
}

function parseLogging(value: string | undefined): LoggerOptions {
  if (!value) return false;
  const v = value.trim().toLowerCase();
  if (v === 'true' || v === '1') return true;
  if (v === 'false' || v === '0') return false;
  if (v === 'all') return 'all';
  if (v === 'error') return ['error'];
  if (v === 'schema') return ['schema'];
  if (v === 'warn' || v === 'warning') return ['warn'];
  if (v.includes(',')) return v.split(',').map((s) => s.trim()) as any;
  return false;
}

export function createTypeOrmOptionsFromEnv(env: Env): DataSourceOptions {
  const rawType = (env.DB_TYPE ?? '').toLowerCase();
  if (!['mysql', 'mariadb', 'mssql'].includes(rawType)) {
    throw new Error(
      `Unsupported DB_TYPE="${env.DB_TYPE}". Supported: mysql, mariadb, mssql`,
    );
  }
  const dbType = rawType as SupportedDbType;

  const base = {
    type: dbType,
    host: env.DB_HOST,
    port: toInt(env.DB_PORT),
    username: env.DB_USERNAME,
    password: env.DB_PASSWORD,
    database: env.DB_NAME,
    synchronize: false,
    migrationsRun: false,
    legacySpatialSupport: false,
    logging: parseLogging(env.DB_LOGGING),
  } satisfies DataSourceOptions;

  const sslEnabled = toBoolean(env.DB_SSL, false);

  if (dbType === 'mysql' || dbType === 'mariadb') {
    const rejectUnauthorized = toBoolean(env.DB_SSL_REJECT_UNAUTHORIZED, true);
    const ssl = sslEnabled ? { rejectUnauthorized } : undefined;

    return {
      ...(base as DataSourceOptions),
      ssl,
      extra: {
        ...(sslEnabled ? { ssl } : {}),
        connectionLimit: toInt(env.DB_POOL_MAX, 10),
      },
    } as DataSourceOptions;
  }

  if (dbType === 'mssql') {
    const trustServerCertificate = toBoolean(
      env.DB_SSL_TRUST_SERVER_CERTIFICATE,
      false,
    );

    return {
      ...(base as DataSourceOptions),
      options: {
        encrypt: sslEnabled,
        trustServerCertificate,
      },
      pool: {
        max: toInt(env.DB_POOL_MAX, 10),
        min: toInt(env.DB_POOL_MIN, 0),
        idleTimeoutMillis: toInt(env.DB_POOL_IDLE_MS, 30000),
      },
    } as DataSourceOptions;
  }

  return base;
}
