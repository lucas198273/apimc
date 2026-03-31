// src/utils/warmup.ts
import { logger } from './logger';

export async function warmupInfinitePay(): Promise<void> {
  // Warm-up desabilitado porque o endpoint /status não existe
  logger.info('🔥 Warm-up desabilitado (nenhuma ação necessária)');
  return;
}