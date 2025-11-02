"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
require("dotenv/config");
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const pedidos_1 = __importDefault(require("./routes/pedidos"));
const authRoutes_1 = __importDefault(require("./routes/authRoutes")); // 👈 nova rota de autenticação
const app = (0, express_1.default)();
const port = process.env.PORT || 3000;
// 🔐 Domínios permitidos (frontend local + produção)
const allowedOrigins = [
    'http://localhost:5173',
    'http://localhost:5174',
    process.env.FRONTEND_URL_PND,
    process.env.FRONTEND_URLS_CLI,
].filter(Boolean); // remove undefined caso alguma não esteja setada
// ⚙️ Configuração do CORS
app.use((0, cors_1.default)({
    origin: (origin, callback) => {
        if (!origin || allowedOrigins.includes(origin)) {
            callback(null, true);
        }
        else {
            callback(new Error('Not allowed by CORS'));
        }
    },
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    credentials: true,
}));
app.use(express_1.default.json());
// 🧩 Rotas principais
app.use('/api', pedidos_1.default);
app.use('/api/auth', authRoutes_1.default); // 👈 adicionando o login aqui
// Rota raiz (teste rápido no navegador)
app.get('/', (req, res) => {
    res.send('✅ API do Sistema de Pedidos está rodando com autenticação!');
});
// 🚀 Inicializa o servidor
app.listen(port, () => {
    console.log(`Servidor rodando em http://localhost:${port}`);
});
//# sourceMappingURL=index.js.map