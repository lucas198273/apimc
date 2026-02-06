import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';

// ===============================
// 1️⃣ Carregar ENV corretamente
// ===============================
dotenv.config();

if (!process.env.INFINITEPAY_HANDLE) {
  console.error('❌ ERRO FATAL: INFINITEPAY_HANDLE não definido');
  process.exit(1);
}

const app = express();
const PORT = Number(process.env.PORT) || 10000;
const NODE_ENV = process.env.NODE_ENV || 'production';

// ===============================
// 2️⃣ Middlewares básicos
// ===============================
app.use(express.json());

// ===============================
// 3️⃣ CORS — produção real
// ===============================
const allowedOrigins = [
  'https://paginapagamento.netlify.app',
];

app.use(cors({
  origin: (origin, callback) => {
    // Permite chamadas server-to-server (webhook)
    if (!origin) return callback(null, true);

    if (allowedOrigins.includes(origin)) {
      return callback(null, true);
    }

    return callback(new Error('Not allowed by CORS'));
  },
  methods: ['GET', 'POST', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: false,
}));

// ===============================
// 4️⃣ Rotas
// ===============================
import paymentsRouter from './routes/payments';
app.use('/api/payments', paymentsRouter);

// ===============================
// 5️⃣ Health Check (produção)
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
// 6️⃣ Start server
// ===============================
app.listen(PORT, () => {
  console.log('🚀 API INFINITEPAY ONLINE');
  console.log(`🌍 Ambiente ........: ${NODE_ENV}`);
  console.log(`🔗 Porta ...........: ${PORT}`);
  console.log(`🏷️ Handle ..........: ${process.env.INFINITEPAY_HANDLE}`);
  console.log(`↪ Redirect URL ....: ${process.env.INFINITE_REDIRECT_URL}`);
  console.log(`🔔 Webhook URL .....: ${process.env.INFINITE_WEBHOOK_URL}`);
});
