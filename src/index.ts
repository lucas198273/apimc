import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import pedidosRouter from './routes/pedidos';
import userRouter from './routes/userRoutes'; // 👈 nova rota de autenticação

const app = express();
const port = process.env.PORT || 3000;

// 🔐 Domínios permitidos (frontend local + produção)
const allowedOrigins = [
  'http://localhost:5173',
  'http://localhost:5174',
  process.env.FRONTEND_URL_PND,
  process.env.FRONTEND_URLS_CLI,
].filter(Boolean); // remove undefined caso alguma não esteja setada


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

// ⚙️ Configuração do CORS (ajustada para Render)
app.use((req, res, next) => {
  res.header("Access-Control-Allow-Origin", allowedOrigins.includes(req.headers.origin) ? req.headers.origin : "null");
  res.header("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
  res.header("Access-Control-Allow-Headers", "Content-Type, Authorization");
  res.header("Access-Control-Allow-Credentials", "true");
  if (req.method === "OPTIONS") {
    return res.sendStatus(200);
  }
  next();
});

// 🧩 Rotas principais
app.use('/api', pedidosRouter);
app.use('/api/perfil', userRouter); // 👈 adicionando o login aqui

// Rota raiz (teste rápido no navegador)
app.get('/', (req, res) => {
  res.send('✅ API do Sistema de Pedidos está rodando com autenticação!');
});

// 🚀 Inicializa o servidor
app.listen(port, () => {
  console.log(`Servidor rodando em http://localhost:${port}`);
});
