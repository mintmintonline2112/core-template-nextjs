import * as fs from 'fs';
import * as path from 'path';
import pino from 'pino';

function getLogFilePath() {
  const today = new Date().toISOString().split('T')[0];
  const logDir = path.join(process.cwd(), 'logs');

  if (!fs.existsSync(logDir)) {
    fs.mkdirSync(logDir, { recursive: true });
  }

  return path.join(logDir, `error-${today}.log`);
}

export class LoggerService {
  private static logger = pino({
    level: 'debug',

    timestamp: pino.stdTimeFunctions.isoTime,

    transport: {
      targets: [
        {
          target: 'pino-pretty',
          level: 'debug',
          options: {
            colorize: true,
            translateTime: 'SYS:standard',
            ignore: 'pid,hostname',
          },
        },

        {
          target: 'pino/file',
          level: 'error',
          options: {
            destination: getLogFilePath(),
            mkdir: true,
          },
        },
      ],
    },
  });

  static info(message: string, data?: any) {
    this.logger.info(data || {}, message);
  }

  static error(message: string, data?: any) {
    this.logger.error(data || {}, message);
  }

  static debug(message: string, data?: any) {
    this.logger.debug(data || {}, message);
  }
}
