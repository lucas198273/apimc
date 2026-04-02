// src/utils/warmup.ts
import { infiniteAxios } from '../lib/axios-client';
import { logger } from './logger';
import { setWarmupComplete } from './warmupStatus';
import { INFINITEPAY_API } from '../config/constantes'; // ajuste o path se necessário

export async function warmupInfinitePay(): Promise<void> {
  const start = Date.now();

  try {
    logger.info('🔥 Iniciando warm-up da InfinitePay...');

    // ✅ Usamos o endpoint /status que já existe no seu serviço (mais limpo e seguro)
    await infiniteAxios.get(INFINITEPAY_API.STATUS_PATH || '/status', {
      timeout: 4000,
      validateStatus: (status) => status < 500, // aceita 4xx, rejeita só 5xx
      // Não precisamos do response body → economiza memória e evita log acidental
    });

    const duration = Date.now() - start;

    logger.info(`✅ Warm-up concluído com sucesso em ${duration}ms (conexão estabelecida)`);
    
    setWarmupComplete(true);

  } catch (error: any) {
    const duration = Date.now() - start;

    logger.warn('⚠️ Warm-up falhou (mas servidor continua rodando)', {
      message: error.message,
      code: error.code,
      duration,
      // Nunca logamos response.data aqui para evitar vazamento de ID
    });

    setWarmupComplete(false);
  }
}