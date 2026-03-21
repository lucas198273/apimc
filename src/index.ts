// src/app.ts
import express from 'express';
import os from 'os';
import { env } from './config/env';
import { corsMiddleware } from './middleware/cors';
import { securityHeaders, validateContentType } from './middleware/security';
import { logger } from './utils/logger';
import { warmupInfinitePay } from './utils/warmup';
import paymentsRouter from './routes/payments';

const app = express();

// ===============================
// Middlewares de segurança
// ===============================
app.use(securityHeaders);
app.use(corsMiddleware);
app.use(express.json({ limit: '1mb' }));
app.use(validateContentType);

// ===============================
// Trust proxy (para rate limit por IP)
// ===============================
app.set('trust proxy', 1);

// ===============================
// Rotas
// ===============================
app.use('/api/payments', paymentsRouter);

// ===============================
// Health check
// ===============================
app.get('/health', (req, res) => {
  res.json({
    status: 'healthy',
    environment: env.NODE_ENV,
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    memory: process.memoryUsage(),
    cpu_cores: os.cpus().length,
    warmup_status: global.warmupComplete ? 'completed' : 'pending',
  });
});

app.get('/', (req, res) => {
  res.redirect('/health');
});

// ===============================
// 404 handler
// ===============================
app.use((req, res) => {
  res.status(404).json({ error: 'Rota não encontrada' });
});

// ===============================
// Error handler global
// ===============================
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  logger.error({ error: err.message, stack: err.stack }, 'Erro não tratado');
  
  res.status(500).json({ 
    error: 'Erro interno do servidor',
    request_id: req.headers['x-request-id'] || 'unknown',
  });
});

// ===============================
// Start do servidor
// ===============================
const server = app.listen(env.PORT, () => {
  logger.info(`🚀 API rodando em http://localhost:${env.PORT} (${env.NODE_ENV})`);
  logger.info(`📊 Servidor: ${os.cpus().length} CPUs, ${Math.round(os.totalmem() / 1024 / 1024 / 1024)}GB RAM`);

  // Inicia warm-up em background
  if (env.NODE_ENV === 'production') {
    warmupInfinitePay().catch(err => {
      logger.warn(`Warm-up falhou: ${err.message}`);
    });
  }
});

// ===============================
// Graceful shutdown
// ===============================
const shutdown = async (signal: string) => {
  logger.info(`${signal} recebido, iniciando shutdown...`);
  
  server.close(() => {
    logger.info('Servidor HTTP fechado');
    process.exit(0);
  });

  // Timeout forçado se não fechar em 10 segundos
  setTimeout(() => {
    logger.error('Shutdown forçado após timeout');
    process.exit(1);
  }, 10000);
};

process.on('SIGTERM', () => shutdown('SIGTERM'));
process.on('SIGINT', () => shutdown('SIGINT'));

export default app;