// src/utils/warmup.ts
import { infiniteAxios } from '../lib/axios-client';
import { logger } from './logger';
import { setWarmupComplete } from './warmupStatus';
import { INFINITEPAY_API } from '../config/constantes';

const MAX_RETRIES = 3;
const INITIAL_TIMEOUT = 2500; // reduzi um pouco

export async function warmupInfinitePay(): Promise<void> {
  const start = Date.now();
  logger.info('🔥 Iniciando warm-up da InfinitePay...');

  for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
    try {
      await infiniteAxios.get(INFINITEPAY_API.STATUS_PATH || '/status', {
        timeout: INITIAL_TIMEOUT,
        validateStatus: (status) => status < 500,
      });

      const duration = Date.now() - start;
      logger.info(`✅ Warm-up concluído em ${duration}ms (tentativa ${attempt})`);
      setWarmupComplete(true);
      return; // sucesso → sai imediatamente

    } catch (error: any) {
      const isLastAttempt = attempt === MAX_RETRIES;

      if (isLastAttempt) {
        const duration = Date.now() - start;
        logger.warn('⚠️ Warm-up falhou após todas as tentativas', {
          message: error.message,
          code: error.code,
          duration,
          attempt,
        });
        setWarmupComplete(false);
      } else {
        // backoff simples (1s, 2s...)
        await new Promise((resolve) => setTimeout(resolve, attempt * 1000));
        logger.warn(`⚠️ Warm-up tentativa ${attempt} falhou, tentando novamente...`);
      }
    }
  }
}