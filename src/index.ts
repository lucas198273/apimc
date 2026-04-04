// src/index.ts
import express from 'express';
import os from 'os';
import { env } from './config/env';
import { corsMiddleware } from './middleware/cors';
import { securityHeaders, validateContentType } from './middleware/security';
import { logger } from './utils/logger';
import paymentsRouter from './routes/payments';
import { warmupInfinitePay } from './utils/warmup';
import { isWarmupComplete } from './utils/warmupStatus';

const app = express();

// ====================== CONFIG ======================
app.set('trust proxy', 1);

// ====================== MIDDLEWARES (ordem otimizada) ======================
app.use(securityHeaders);
app.use(corsMiddleware);
app.use(express.json({ limit: '1mb' }));
app.use(validateContentType);

// ====================== ROTAS ======================
app.use('/api/payments', paymentsRouter);

// ====================== HEALTH CHECK (leve) ======================
app.get('/health', (req, res) => {
  res.json({
    status: 'healthy',
    warmup: isWarmupComplete() ? 'done' : 'pending',
    env: env.NODE_ENV,
    uptime: process.uptime(),
    timestamp: new Date().toISOString(),
  });
});

// Redirect raiz
app.get('/', (req, res) => res.redirect('/health'));

// ====================== 404 + ERROR HANDLER ======================
app.use((req, res) => {
  res.status(404).json({ error: 'Rota não encontrada' });
});

app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  logger.error('Erro não tratado', { 
    error: err.message, 
    path: req.path,
    method: req.method,
  });

  res.status(500).json({ 
    error: 'Erro interno do servidor' 
  });
});

// ====================== START SERVER ======================
const server = app.listen(env.PORT, () => {
  logger.info(`🚀 API rodando em http://localhost:${env.PORT} (${env.NODE_ENV})`);
  logger.info(`📊 CPUs: ${os.cpus().length} | RAM: ${Math.round(os.totalmem() / 1024 ** 3)}GB`);

  // Warm-up em background (não bloqueia o start do servidor)
  warmupInfinitePay().catch(err => {
    logger.warn('Warm-up falhou no startup', { error: err.message });
  });
});

// ====================== GRACEFUL SHUTDOWN ======================
const shutdown = (signal: string) => {
  logger.info(`${signal} recebido. Fechando servidor...`);
  
  server.close(() => {
    logger.info('Servidor HTTP fechado com sucesso');
    process.exit(0);
  });

  // Força shutdown após 8 segundos
  setTimeout(() => process.exit(1), 8000);
};

process.on('SIGTERM', () => shutdown('SIGTERM'));
process.on('SIGINT', () => shutdown('SIGINT'));

export default app;