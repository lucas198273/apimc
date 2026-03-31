import axios, { type AxiosInstance, type InternalAxiosRequestConfig } from 'axios';
import https from 'https';
import { logger } from '../utils/logger';

const httpsAgent = new https.Agent({
  keepAlive: true,
  keepAliveMsecs: 1000,
  maxSockets: 25,
  maxFreeSockets: 10,
  timeout: 30000,
  scheduling: 'lifo',
});

export const infiniteAxios: AxiosInstance = axios.create({
  baseURL: 'https://api.infinitepay.io',
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
    'User-Agent': 'InfinitePay-API/2.0',
  },
  httpsAgent,
});

interface ExtendedRequestConfig extends InternalAxiosRequestConfig {
  metadata?: { startTime: number };
}

infiniteAxios.interceptors.request.use((config: InternalAxiosRequestConfig) => {
  (config as ExtendedRequestConfig).metadata = { startTime: Date.now() };
  return config;
});

infiniteAxios.interceptors.response.use(
  (response) => {
    const duration = Date.now() - ((response.config as ExtendedRequestConfig).metadata?.startTime || 0);
    if (process.env.NODE_ENV === 'development') {
      logger.debug(`${response.config.method?.toUpperCase()} ${response.config.url} - ${duration}ms`);
    }
    return response;
  },
  (error) => {
    const duration = Date.now() - ((error.config as ExtendedRequestConfig)?.metadata?.startTime || 0);
    logger.error(`Erro após ${duration}ms: ${error.message}`);
    return Promise.reject(error);
  }
);