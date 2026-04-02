// src/utils/logger.ts
type LogLevel = 'debug' | 'info' | 'warn' | 'error';

const isDevelopment = process.env.NODE_ENV === 'development';

// Campos sensíveis que NUNCA devem aparecer em logs
const SENSITIVE_FIELDS = ['id', 'accountId', 'account_id', 'customer', 'email', 'cpf', 'token', 'key', 'secret'];

function redactSensitiveData(meta: any): any {
  if (!meta || typeof meta !== 'object') return meta;

  const redacted = { ...meta };

  for (const key in redacted) {
    if (SENSITIVE_FIELDS.some(field => key.toLowerCase().includes(field))) {
      redacted[key] = '[REDACTED]';
    }
    // Se for objeto aninhado, redige recursivamente
    if (typeof redacted[key] === 'object' && redacted[key] !== null) {
      redacted[key] = redactSensitiveData(redacted[key]);
    }
  }
  return redacted;
}

const formatMessage = (level: LogLevel, message: string, meta?: any): string => {
  const timestamp = new Date().toISOString();
  const safeMeta = meta ? ` ${JSON.stringify(redactSensitiveData(meta))}` : '';
  return `[${timestamp}] ${level.toUpperCase()}: ${message}${safeMeta}`;
};

export const logger = {
  debug: (message: string, meta?: any) => {
    if (isDevelopment) console.log(formatMessage('debug', message, meta));
  },
  info: (message: string, meta?: any) => {
    console.log(formatMessage('info', message, meta));
  },
  warn: (message: string, meta?: any) => {
    console.warn(formatMessage('warn', message, meta));
  },
  error: (message: string, meta?: any) => {
    console.error(formatMessage('error', message, meta));
  },
};