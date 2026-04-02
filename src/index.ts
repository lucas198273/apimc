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

// ===============================
// CONFIG BASE
// ===============================
app.set('trust proxy', 1);

// ===============================
// MIDDLEWARES
// ===============================
app.use(securityHeaders);
app.use(corsMiddleware);
app.use(express.json({ limit: '1mb' }));
app.use(validateContentType);

// ===============================
// ROTAS
// ===============================
app.use('/api/payments', paymentsRouter);

// ===============================
// HEALTH CHECK (OTIMIZADO)
// ===============================
app.get('/health', (req, res) => {
  res.json({
    status: 'healthy',
    warmup: isWarmupComplete() ? 'done' : 'pending',
    environment: env.NODE_ENV,
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    memory: process.memoryUsage(),
    cpu_cores: os.cpus().length,
  });
});

// Redirect raiz
app.get('/', (req, res) => {
  res.redirect('/health');
});

// ===============================
// 404
// ===============================
app.use((req, res) => {
  res.status(404).json({ error: 'Rota não encontrada' });
});

// ===============================
// ERROR HANDLER
// ===============================
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  logger.error('Erro não tratado', { 
    error: err.message, 
    stack: err.stack,
    path: req.path,
    method: req.method,
  });

  res.status(500).json({ 
    error: 'Erro interno do servidor',
    request_id: req.headers['x-request-id'] || 'unknown',
  });
});

// ===============================
// START SERVER + WARMUP
// ===============================

// ... resto do arquivo igual ...

const server = app.listen(env.PORT, async () => {
  logger.info(`🚀 API rodando em http://localhost:${env.PORT} (${env.NODE_ENV})`);
  logger.info(`📊 Servidor: ${os.cpus().length} CPUs, ${Math.round(os.totalmem() / 1024 / 1024 / 1024)}GB RAM`);

  // 🔥 WARM-UP SEGURO
  await warmupInfinitePay();
});

// ===============================
// GRACEFUL SHUTDOWN
// ===============================
const shutdown = (signal: string) => {
  logger.info(`${signal} recebido, iniciando shutdown...`);

  server.close(() => {
    logger.info('Servidor HTTP fechado');
    process.exit(0);
  });

  setTimeout(() => {
    logger.error('Shutdown forçado após timeout');
    process.exit(1);
  }, 10000);
};

process.on('SIGTERM', () => shutdown('SIGTERM'));
process.on('SIGINT', () => shutdown('SIGINT'));

export default app;