import axios from 'axios';
import axiosRetry from 'axios-retry';  // Novo: para retries
import https from 'https';

const httpsAgent = new https.Agent({
  keepAlive: true,
  maxSockets: 30,  // Reduzi para 30: evita saturação em servidores pequenos; ajuste baseado no seu traffic
  maxFreeSockets: 10,
  timeout: 90000,  // Aumentado para 90s no agent (dá margem)
});

export const infiniteAxios = axios.create({
  baseURL: 'https://api.infinitepay.io',
  timeout: 60000,  // Aumentado para 60s: cobre demoras comuns em gateways BR
  headers: {
    'Content-Type': 'application/json',
  },
  httpsAgent,
});

// Configura retries: tenta 3x em falhas transitórias (5xx, timeouts, rede)
axiosRetry(infiniteAxios, {
  retries: 3,
  retryDelay: (retryCount) => retryCount * 1000,  // Exponential backoff: 1s, 2s, 3s
  retryCondition: (error) => {
    return axiosRetry.isNetworkOrIdempotentRequestError(error) || error.code === 'ECONNABORTED';  // Retenta em timeouts/rede
  },
});