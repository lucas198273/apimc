"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
require("dotenv/config");
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const pedidos_1 = __importDefault(require("./routes/pedidos"));
const userRoutes_1 = __importDefault(require("./routes/userRoutes")); // 👈 nova rota de autenticação
const order_routes_1 = __importDefault(require("./routes/order.routes"));
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
app.use('/api', pedidos_1.default);
app.use('/api/perfil', userRoutes_1.default); // 👈 adicionando o login aqui
// Rota raiz (teste rápido no navegador)
app.get('/', (req, res) => {
    res.send('✅ API do Sistema de Pedidos está rodando com autenticação!');
});
app.use("/api/orders", order_routes_1.default);
// 🚀 Inicializa o servidor
app.listen(port, () => {
    console.log(`Servidor rodando em http://localhost:${port}`);
});
//# sourceMappingURL=index.js.map