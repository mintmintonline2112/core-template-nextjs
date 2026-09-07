import { registerAs } from '@nestjs/config';
import { TypeOrmModuleOptions } from '@nestjs/typeorm';
import { join } from 'path';
import { createTypeOrmOptionsFromEnv } from 'src/database/typeorm-options';

export default registerAs('database', (): TypeOrmModuleOptions => {
  const retryAttempts = process.env.DB_RETRY_ATTEMPTS
    ? Number(process.env.DB_RETRY_ATTEMPTS)
    : 10;
  const retryDelay = process.env.DB_RETRY_DELAY_MS
    ? Number(process.env.DB_RETRY_DELAY_MS)
    : 3000;

  return {
    ...createTypeOrmOptionsFromEnv(process.env),
    autoLoadEntities: true,
    entities: [join(__dirname, '..', 'modules', '**', '*.entity.{ts,js}')],
    migrations: [join(__dirname, '..', 'database', 'migrations', '*.{ts,js}')],
    retryAttempts,
    retryDelay,
  };
});
