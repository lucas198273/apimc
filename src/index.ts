// src/index.ts
import express from 'express';
import cors from 'cors';
import { env } from './config/env';
import paymentsRouter from './routes/payments'; // ✅ Isso funciona se payments.ts tem "export default router"

const app = express();

// Middlewares
app.use(cors());
app.use(express.json({ limit: '1mb' }));

// Rotas
app.use('/api/payments', paymentsRouter);

// Health check
app.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
  });
});

app.get('/', (req, res) => {
  res.json({
    message: 'API InfinitePay rodando',
    endpoints: {
      create: 'POST /api/payments/create',
      webhook: 'POST /api/payments/webhook',
      orders: 'GET /api/payments/orders/:email',
      diagnostico: 'GET /api/payments/diagnostico',
    }
  });
});

// Tratamento de erro 404
app.use((req, res) => {
  res.status(404).json({ error: 'Rota não encontrada' });
});

// Tratamento de erro geral
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error('Erro:', err.message);
  res.status(500).json({ error: 'Erro interno do servidor' });
});

// Iniciar servidor
const PORT = env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`🚀 Servidor rodando na porta ${PORT}`);
  console.log(`✅ Health: http://localhost:${PORT}/health`);
  console.log(`✅ Create: http://localhost:${PORT}/api/payments/create`);
});

export default app;