"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const dotenv_1 = __importDefault(require("dotenv"));
const path_1 = __importDefault(require("path"));
const payments_1 = __importDefault(require("./routes/payments"));
dotenv_1.default.config();
// Carrega .env correto baseado em NODE_ENV (opcional, mas ajuda em alguns deploys)
const envFile = process.env.NODE_ENV === 'production'
    ? '.env.production'
    : '.env.development';
dotenv_1.default.config({ path: path_1.default.resolve(process.cwd(), envFile), override: true });
if (!process.env.INFINITEPAY_HANDLE) {
    console.error('ERRO FATAL: INFINITEPAY_HANDLE não definido no .env');
    process.exit(1);
}
const app = (0, express_1.default)();
const PORT = Number(process.env.PORT) || 5000;
const NODE_ENV = process.env.NODE_ENV || 'production';
app.use(express_1.default.json());
// ==================== CORS ====================
const allowedOrigins = [
    'http://127.0.0.1:5173',
    'http://localhost:5173',
    // Adicione seu domínio de produção real aqui
    // 'https://paginapagamento.netlify.app',
];
if (NODE_ENV === 'development') {
    console.log('⚠️ Modo desenvolvimento: CORS liberado para todas as origens (teste local)');
    app.use((0, cors_1.default)({ origin: '*' }));
}
else {
    app.use((0, cors_1.default)({
        origin: allowedOrigins,
        methods: ['GET', 'POST', 'OPTIONS'],
        allowedHeaders: ['Content-Type', 'Authorization'],
        maxAge: 86400,
    }));
}
// ==============================================
app.use('/api/payments', payments_1.default);
// Health check + debug de config
app.get('/', (req, res) => {
    res.json({
        status: 'API InfinitePay rodando com sucesso',
        environment: NODE_ENV,
        port: PORT,
        handle: process.env.INFINITEPAY_HANDLE,
        redirect_url_configurado: process.env.INFINITE_REDIRECT_URL || '(não definido – use .env)',
        webhook_url_configurado: process.env.INFINITE_WEBHOOK_URL || '(não definido – use .env)',
    });
});
app.listen(PORT, () => {
    console.log(`🚀 Servidor rodando em http://localhost:${PORT}`);
    console.log(`   Ambiente ........: ${NODE_ENV}`);
    console.log(`   Handle ...........: ${process.env.INFINITEPAY_HANDLE}`);
    console.log(`   Redirect URL .....: ${process.env.INFINITE_REDIRECT_URL || '(não definido)'}`);
    console.log(`   Webhook URL ......: ${process.env.INFINITE_WEBHOOK_URL || '(não definido)'}`);
    console.log(`   CORS mode ........: ${NODE_ENV === 'development' ? 'Aberto (dev)' : 'Restrito (prod)'}`);
});
//# sourceMappingURL=index.js.map