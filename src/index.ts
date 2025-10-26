import 'dotenv/config';
import express from 'express';
import cors from 'cors'; // <-- importar cors
import pedidosRouter from './routes/pedidos';

const app = express();
const port = process.env.PORT || 3000;

// Configurar CORS
app.use(cors({
  origin: 'http://localhost:5173', // endereço do seu front-end
  methods: ['GET','POST','PUT','DELETE'],
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
