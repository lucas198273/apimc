import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import pedidosRouter from './routes/pedidos';

const app = express();
const port = process.env.PORT || 3000;

const allowedOrigins = [
  'http://localhost:5173',
  process.env.FRONTEND_URL
];

app.use(cors({
  origin: (origin, callback) => {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  credentials: true
}));

app.use(express.json());
app.use('/api', pedidosRouter);

app.get('/', (req, res) => {
  res.send('API de Pedidos - Supabase');
});

app.listen(port, () => {
  console.log(`Servidor rodando em http://localhost:${port}`);
});
