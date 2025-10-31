import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import pedidosRouter from './routes/pedidos';
import authRouter from './routes/authRoutes'; // 👈 nova rota de autenticação

const app = express();
const port = process.env.PORT || 3000;

// 🔐 Domínios permitidos (frontend local + produção)
const allowedOrigins = [
  'http://localhost:5173',
  process.env.FRONTEND_URL,
];

// ⚙️ Configuração do CORS
app.use(cors({
  origin: (origin, callback) => {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  credentials: true,
}));

app.use(express.json());

// 🧩 Rotas principais
app.use('/api', pedidosRouter);
app.use('/api/auth', authRouter); // 👈 adicionando o login aqui

// Rota raiz (teste rápido no navegador)
app.get('/', (req, res) => {
  res.send('✅ API do Sistema de Pedidos está rodando com autenticação!');
});

// 🚀 Inicializa o servidor
app.listen(port, () => {
  console.log(`Servidor rodando em http://localhost:${port}`);
});
