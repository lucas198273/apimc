import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';

dotenv.config();

if (!process.env.INFINITEPAY_HANDLE) {
  console.error('❌ ERRO FATAL: INFINITEPAY_HANDLE não definido');
  process.exit(1);
}

const app = express();
const PORT = Number(process.env.PORT) || 10000;
const NODE_ENV = process.env.NODE_ENV || 'production';

// ===============================
// Middlewares
// ===============================
app.use(express.json());

// ===============================
// CORS — CORRETO E COMPATÍVEL
// ===============================
const allowedOrigins = [
  'http://localhost:5173',
];

app.use(cors({
  origin: (origin, callback) => {
    // server-to-server, curl, webhook
    if (!origin) return callback(null, true);

    if (allowedOrigins.includes(origin)) {
      return callback(null, true);
    }

    console.error('🚫 CORS bloqueado para:', origin);
    return callback(new Error('Not allowed by CORS'));
  },
  methods: ['GET', 'POST', 'OPTIONS'],
  allowedHeaders: [
    'Content-Type',
    'Authorization',
    'X-Frontend-Env',
  ],
}));

// ❌ REMOVIDO: app.options('*', cors());

// ===============================
// Rotas
// ===============================
import paymentsRouter from './routes/payments';
app.use('/api/payments', paymentsRouter);

// ===============================
// Health check
// ===============================
app.get('/', (req, res) => {
  res.json({
    status: 'API InfinitePay rodando',
    environment: NODE_ENV,
    handle: process.env.INFINITEPAY_HANDLE,
    redirect_url: process.env.INFINITE_REDIRECT_URL,
    webhook_url: process.env.INFINITE_WEBHOOK_URL,
  });
});

// ===============================
// Start
// ===============================
app.listen(PORT, () => {
  console.log(`🚀 API InfinitePay rodando em http://localhost:${PORT} (env: ${NODE_ENV})`)  ;
});
