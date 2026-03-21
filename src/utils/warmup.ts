// src/utils/warmup.ts
import { infiniteAxios } from '../lib/axios-client.ts';
import { logger } from './logger';
import { env } from '../config/env';

declare global {
  var warmupComplete: boolean;
}

global.warmupComplete = false;

export async function warmupInfinitePay(): Promise<void> {
  if (env.NODE_ENV !== 'production') {
    logger.info('🔄 Warm-up ignorado em desenvolvimento');
    return;
  }

  logger.info('🔥 Iniciando warm-up da InfinitePay...');
  
  const endpoints = ['/status', '/invoices/public/checkout/links'];
  const results = await Promise.allSettled(
    endpoints.map(endpoint => 
      infiniteAxios.get(endpoint, { timeout: 5000 })
        .catch(() => null)
    )
  );

  const successCount = results.filter(r => r.status === 'fulfilled' && r.value).length;
  
  if (successCount > 0) {
    global.warmupComplete = true;
    logger.info(`✅ Warm-up concluído: ${successCount}/${endpoints.length} endpoints aquecidos`);
  } else {
    logger.warn('⚠️ Warm-up falhou, continuando sem cache de conexão');
  }
}

// Mantém conexão aquecida
setInterval(async () => {
  if (global.warmupComplete && env.NODE_ENV === 'production') {
    try {
      await infiniteAxios.get('/status', { timeout: 3000 });
      logger.debug('🔄 Keep-alive: conexão mantida');
    } catch (error) {
      logger.warn('Keep-alive falhou, tentando reconectar...');
      global.warmupComplete = false;
      warmupInfinitePay();
    }
  }
}, 300000); // 5 minutos