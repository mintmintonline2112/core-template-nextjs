type Env = NodeJS.ProcessEnv;

function required(env: Env, key: string): string {
  const value = env[key];
  if (value === undefined) {
    throw new Error(`Missing environment variable: ${key}`);
  }
  return value;
}

function toNumber(value: string | undefined, fallback: number): string {
  if (!value) return String(fallback);
  const parsed = Number.parseInt(value, 10);
  if (!Number.isFinite(parsed)) return String(fallback);
  return String(parsed);
}

export function validateEnv(env: Env): Env {
  required(env, 'DB_TYPE');
  required(env, 'DB_HOST');
  required(env, 'DB_USERNAME');
  required(env, 'DB_PASSWORD');
  required(env, 'DB_NAME');

  env.DB_PORT = toNumber(env.DB_PORT, 3306);

  required(env, 'JWT_ACCESS_SECRET');
  required(env, 'JWT_REFRESH_SECRET');
  env.JWT_EXPIRES = env.JWT_EXPIRES ?? '1d';

  env.PORT = toNumber(env.PORT, 3000);
  env.FRONTEND_URL = env.FRONTEND_URL ?? 'http://localhost:4200';

  return env;
}
