"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.loginUsuario = loginUsuario;
exports.criarUsuario = criarUsuario;
const supabaseClient_1 = require("../lib/supabaseClient");
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const JWT_SECRET = process.env.JWT_SECRET || "segredo_temporario";
/* ---------------- LOGIN ---------------- */
async function loginUsuario(username, senha) {
    const { data, error } = await supabaseClient_1.supabase
        .from("usuarios")
        .select("*")
        .eq("username", username)
        .single();
    if (error || !data)
        throw new Error("Usuário não encontrado");
    const usuario = data;
    // Compara a senha digitada com o hash do banco
    const senhaValida = await bcryptjs_1.default.compare(senha, usuario.password_hash);
    if (!senhaValida)
        throw new Error("Senha incorreta");
    // Gera token JWT
    const token = jsonwebtoken_1.default.sign({ id: usuario.id, username: usuario.username }, JWT_SECRET, { expiresIn: "8h" });
    return {
        token,
        user: {
            id: usuario.id,
            username: usuario.username,
        },
    };
}
/* ---------------- CRIAR USUÁRIO ---------------- */
async function criarUsuario(username, senha) {
    const password_hash = await bcryptjs_1.default.hash(senha, 10);
    const { data, error } = await supabaseClient_1.supabase
        .from("usuarios")
        .insert([{ username, password_hash }])
        .select("*")
        .single();
    if (error)
        throw new Error(`Erro ao criar usuário: ${error.message}`);
    return data;
}
//# sourceMappingURL=authService.js.map