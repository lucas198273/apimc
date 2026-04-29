// src/index.ts
import express from 'express';
import os from 'os';
import { env } from './config/env';
import { corsMiddleware } from './middleware/cors';
import { securityHeaders, validateContentType } from './middleware/security';
import { logger } from './utils/logger';
import paymentsRouter from './routes/payments';

const app = express();

// ====================== CONFIG ======================
app.set('trust proxy', 1);

// ====================== MIDDLEWARES ======================
app.use(securityHeaders);
app.use(corsMiddleware);
app.use(express.json({ limit: '1mb' }));
app.use(validateContentType);

// ====================== ROTAS ======================
app.use('/api/payments', paymentsRouter);

// ====================== HEALTH CHECK SIMPLES ======================
app.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    env: env.NODE_ENV,
    uptime: process.uptime(),
    timestamp: new Date().toISOString(),
  });
});

// Redirect raiz
app.get('/', (req, res) => res.redirect('/health'));

// ====================== 404 ======================
app.use((req, res) => {
  res.status(404).json({ error: 'Rota não encontrada' });
});

// ====================== ERROR HANDLER ======================
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
  logger.info(`✅ Servidor pronto para receber requisições`);
});

// ====================== GRACEFUL SHUTDOWN ======================
const shutdown = (signal: string) => {
  logger.info(`${signal} recebido. Fechando servidor...`);
  
  server.close(() => {
    logger.info('Servidor HTTP fechado com sucesso');
    process.exit(0);
  });

  // Força shutdown após 8 segundos
  setTimeout(() => {
    logger.error('Shutdown forçado após timeout');
    process.exit(1);
  }, 8000);
};

process.on('SIGTERM', () => shutdown('SIGTERM'));
process.on('SIGINT', () => shutdown('SIGINT'));

export default app;