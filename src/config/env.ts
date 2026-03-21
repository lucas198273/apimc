// src/config/env.ts
import dotenv from 'dotenv';

dotenv.config();

interface EnvConfig {
  INFINITEPAY_HANDLE: string;
  INFINITE_REDIRECT_URL?: string;
  INFINITE_WEBHOOK_URL?: string;
  PORT: number;
  NODE_ENV: 'development' | 'production' | 'test';
  RATE_LIMIT_WINDOW: number;
  RATE_LIMIT_MAX: number;
  CACHE_TTL: number;
}

function validateEnv(): EnvConfig {
  const required = ['INFINITEPAY_HANDLE'];
  
  for (const field of required) {
    if (!process.env[field]) {
      console.error(`❌ ERRO FATAL: ${field} não definido`);
      process.exit(1);
    }
  }

  return {
    INFINITEPAY_HANDLE: process.env.INFINITEPAY_HANDLE!,
    INFINITE_REDIRECT_URL: process.env.INFINITE_REDIRECT_URL,
    INFINITE_WEBHOOK_URL: process.env.INFINITE_WEBHOOK_URL,
    PORT: Number(process.env.PORT) || 10000,
    NODE_ENV: (process.env.NODE_ENV as EnvConfig['NODE_ENV']) || 'production',
    RATE_LIMIT_WINDOW: Number(process.env.RATE_LIMIT_WINDOW) || 15 * 60 * 1000, // 15 minutos
    RATE_LIMIT_MAX: Number(process.env.RATE_LIMIT_MAX) || 100,
    CACHE_TTL: Number(process.env.CACHE_TTL) || 5000,
  };
}

export const env = validateEnv();