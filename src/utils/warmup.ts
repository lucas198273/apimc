// src/utils/warmup.ts (ou src/services/infinitepay.ts)
import axios from 'axios';
import axiosRetry from 'axios-retry';
import { logger } from '../utils/logger';
import { isWarmupComplete, setWarmupComplete } from '../utils/warmupStatus';

const infinitepayAxios = axios.create({
  baseURL: 'https://api.infinitepay.io',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

axiosRetry(infinitepayAxios, {
  retries: 3,
  retryDelay: (retryCount) => retryCount * 1000, // backoff simples: 1s, 2s, 3s
});

export async function warmupInfinitePay() {
  const start = Date.now();
  let success = false;

  try {
    const handle = process.env.INFINITEPAY_HANDLE;
    if (!handle) {
      throw new Error('INFINITEPAY_HANDLE não está configurado no .env');
    }

    const payload = {
      handle,  // "pereira-lucas-p46" (sem $)
      items: [
        {
          quantity: 1,
          price: 1000,  // Mudei para 1000 (R$ 10,00) – valores muito baixos (ex: 100) frequentemente dão 400 Bad Request na InfinitePay
          description: 'Warm-up API - teste de conexão (não finalizar pagamento)',
        },
      ],
      customer: {
        name: 'Warmup Teste',
        email: 'warmup@teste.com',
      },
      // Opcional: adicione se precisar evitar 400 em alguns casos
      // order_nsu: `warmup-${Date.now()}`,  // número único do pedido (se não tiver, a API gera)
      // redirect_url: 'https://seusite.com/ok',  // página de sucesso fake
    };

    const response = await infinitepayAxios.post('/invoices/public/checkout/links', payload);

    if (response.status === 200 || response.status === 201) {
      logger.info(`Warm-up InfinitePay OK para handle ${handle} em ${Date.now() - start}ms`);
      success = true;
    } else {
      throw new Error(`Status inesperado: ${response.status}`);
    }
  } catch (error: any) {
    const time = Date.now() - start;
    const status = error.response?.status ?? 'sem resposta';

    logger.error(`Warm-up falhou após ${time}ms: ${error.message} (status ${status})`);

    if (status === 401 || status === 403) {
      logger.warn(`Autenticação falhou – verifique se INFINITEPAY_HANDLE="${process.env.INFINITEPAY_HANDLE}" está correto no app InfinitePay`);
    } else if (status === 400) {
      logger.warn('Erro 400: payload inválido. Verifique price (mínimo recomendado 1000 centavos), items ou campos obrigatórios');
    } else if (status === 404) {
      logger.warn('Endpoint errado – deve ser /invoices/public/checkout/links');
    }
  } finally {
    setWarmupComplete(true);  // Marca como concluído SEMPRE (evita /health ficar "pending" pra sempre)
  }

  // Log de falha só se não deu certo
  if (!success) {
    logger.warn('Warm-up da InfinitePay falhou, continuando sem cache de conexão');
  }

  return isWarmupComplete();  // Retorna o boolean atual (true)
}