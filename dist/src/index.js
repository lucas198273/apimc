"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
require("dotenv/config");
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors")); // <-- importar cors
const pedidos_1 = __importDefault(require("./routes/pedidos"));
const app = (0, express_1.default)();
const port = process.env.PORT || 3000;
// Configurar CORS
app.use((0, cors_1.default)({
    origin: 'http://localhost:5173', // endereço do seu front-end
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    credentials: true
}));
app.use(express_1.default.json());
app.use('/api', pedidos_1.default);
app.get('/', (req, res) => {
    res.send('API de Pedidos - Supabase');
});
app.listen(port, () => {
    console.log(`Servidor rodando em http://localhost:${port}`);
});
