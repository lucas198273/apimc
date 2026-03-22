import pino, { type Logger, type Bindings } from 'pino';
import { env } from '../config/env';
import { LOG_LEVELS } from '../config/constantes';

export const logger: Logger = pino({
  level: LOG_LEVELS[env.NODE_ENV as keyof typeof LOG_LEVELS],
  formatters: {
    level: (label: string) => ({ level: label }),
    bindings: (bindings: Bindings) => ({
      pid: bindings.pid,
      host: bindings.hostname,
    }),
  },
  timestamp: pino.stdTimeFunctions.isoTime,
  ...(env.NODE_ENV === 'development' && {
    transport: {
      target: 'pino-pretty',
      options: {
        colorize: true,
        translateTime: 'SYS:standard',
        ignore: 'pid,hostname',
      },
    },
  }),
});