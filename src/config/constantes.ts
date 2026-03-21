// src/config/constants.ts
export const INFINITEPAY_API = {
  BASE_URL: 'https://api.infinitepay.io',
  CHECKOUT_PATH: '/invoices/public/checkout/links',
  STATUS_PATH: '/status',
  TIMEOUT: 30000,
  RETRIES: 3,
};

export const CACHE = {
  TTL: 5000, // 5 segundos
  CLEANUP_INTERVAL: 60000, // 1 minuto
};

export const SECURITY = {
  BCRYPT_ROUNDS: 12,
  JWT_EXPIRES_IN: '7d',
  RATE_LIMIT: {
    WINDOW_MS: 15 * 60 * 1000, // 15 minutos
    MAX: 100, // 100 requisições por IP
  },
};

export const LOG_LEVELS = {
  development: 'debug',
  production: 'info',
  test: 'error',
};