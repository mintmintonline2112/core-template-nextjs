import { registerAs } from '@nestjs/config';

export interface MailConfig {
  host?: string;
  port?: number;
  user?: string;
  pass?: string;
  from?: string;
}

export default registerAs(
  'mail',
  (): MailConfig => ({
    host: process.env.MAIL_HOST,
    port: process.env.MAIL_PORT ? Number(process.env.MAIL_PORT) : 587,
    user: process.env.MAIL_USER,
    pass: process.env.MAIL_PASS,
    from: process.env.MAIL_FROM || process.env.MAIL_USER,
  }),
);
