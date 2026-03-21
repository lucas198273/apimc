// src/lib/axios-client.ts
import axios from 'axios';
import axiosRetry from 'axios-retry';
import https from 'https';
import { INFINITEPAY_API } from '../config/constantes';
import { logger } from '../utils/logger';

const httpsAgent = new https.Agent({
  keepAlive: true,
  keepAliveMsecs: 1000,
  maxSockets: 25, // Reduzido para evitar sobrecarga
  maxFreeSockets: 10,
  timeout: INFINITEPAY_API.TIMEOUT,
  scheduling: 'lifo',
});

export const infiniteAxios = axios.create({
  baseURL: INFINITEPAY_API.BASE_URL,
  timeout: INFINITEPAY_API.TIMEOUT,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
    'User-Agent': 'InfinitePay-API/2.0',
  },
  httpsAgent,
});

// Configura retries com backoff exponencial
axiosRetry(infiniteAxios, {
  retries: INFINITEPAY_API.RETRIES,
  retryDelay: axiosRetry.exponentialDelay,
  retryCondition: (error) => {
    return axiosRetry.isNetworkOrIdempotentRequestError(error) || 
           error.code === 'ECONNABORTED' ||
           error.response?.status === 429 ||
           (error.response?.status || 0) >= 500;
  },
  onRetry: (retryCount, error) => {
    logger.warn(`🔄 Retry ${retryCount} após erro: ${error.message}`);
  },
});

// Interceptores para métricas
infiniteAxios.interceptors.request.use((config) => {
  config.metadata = { startTime: Date.now() };
  return config;
});

infiniteAxios.interceptors.response.use(
  (response) => {
    const duration = Date.now() - (response.config.metadata?.startTime || 0);
    logger.debug(`${response.config.method?.toUpperCase()} ${response.config.url} - ${duration}ms`);
    return response;
  },
  (error) => {
    const duration = Date.now() - (error.config?.metadata?.startTime || 0);
    logger.error(`Erro após ${duration}ms: ${error.message}`);
    return Promise.reject(error);
  }
);