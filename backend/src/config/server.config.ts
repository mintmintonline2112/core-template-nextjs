import { registerAs } from '@nestjs/config';

export interface ServerConfig {
  port: number;
  frontendUrl: string;
  env?: string;
}

export default registerAs(
  'server',
  (): ServerConfig => ({
    port: Number(process.env.PORT ?? 3000),
    frontendUrl: process.env.FRONTEND_URL ?? 'http://localhost:4200',
    env: process.env.NODE_ENV,
  }),
);
