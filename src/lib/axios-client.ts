import axios, {
  type AxiosError,
  type AxiosInstance,
  type AxiosResponse,
  type InternalAxiosRequestConfig,  // ← Importante! Use isso nos interceptors
  isAxiosError,
} from 'axios';
import axiosRetry from 'axios-retry';
import https from 'https';
import { INFINITEPAY_API } from '../config/constantes';
import { logger } from '../utils/logger';

const httpsAgent = new https.Agent({
  keepAlive: true,
  keepAliveMsecs: 1000,
  maxSockets: 25,
  maxFreeSockets: 10,
  timeout: INFINITEPAY_API.TIMEOUT,
  scheduling: 'lifo',
});

export const infiniteAxios: AxiosInstance = axios.create({
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
    // Type guard para garantir que é AxiosError antes de acessar .response / .code
    if (!isAxiosError(error)) {
      return false; // ou true se quiser retry em qualquer Error
    }

    return (
      axiosRetry.isNetworkOrIdempotentRequestError(error) ||
      error.code === 'ECONNABORTED' ||
      error.response?.status === 429 ||
      (error.response?.status ?? 0) >= 500
    );
  },
  onRetry: (retryCount: number, error) => {
    // Aqui também pode usar isAxiosError se quiser acessar response
    logger.warn(`🔄 Retry ${retryCount} após erro: ${error.message}`);
  },
});

// Para evitar 'as any' no metadata, crie uma interface estendida (recomendado)
interface ExtendedRequestConfig extends InternalAxiosRequestConfig {
  metadata?: { startTime: number };
}

// Interceptores para métricas
infiniteAxios.interceptors.request.use((config: InternalAxiosRequestConfig) => {
  // Type assertion segura (ou use a interface acima)
  (config as ExtendedRequestConfig).metadata = { startTime: Date.now() };
  return config;
});

infiniteAxios.interceptors.response.use(
  (response: AxiosResponse) => {
    const duration =
      Date.now() -
      ((response.config as ExtendedRequestConfig).metadata?.startTime || 0);
    logger.debug(
      `${response.config.method?.toUpperCase()} ${response.config.url} - ${duration}ms`
    );
    return response;
  },
  (error: AxiosError) => {
    const duration =
      Date.now() -
      ((error.config as ExtendedRequestConfig)?.metadata?.startTime || 0);
    logger.error(`Erro após ${duration}ms: ${error.message}`);
    return Promise.reject(error);
  }
);