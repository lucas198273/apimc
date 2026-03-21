// src/utils/logger.ts
import pino from 'pino';
import { env } from '../config/env';
import { LOG_LEVELS } from '../config/constantes';

export const logger = pino({
  level: LOG_LEVELS[env.NODE_ENV],
  formatters: {
    level: (label) => ({ level: label }),
    bindings: (bindings) => ({
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