"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.loginUsuario = loginUsuario;
const supabaseClient_1 = require("../lib/supabaseClient");
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const bcrypt_1 = __importDefault(require("bcrypt"));
const JWT_SECRET = process.env.JWT_SECRET || "segredo_temporario";
async function loginUsuario(username, senha) {
    if (!username || !senha) {
        throw new Error("Usuário e senha são obrigatórios.");
    }
    const { data, error } = await supabaseClient_1.supabase
        .from("usuarios")
        .select("id, username, senha")
        .eq("username", username.trim())
        .limit(1)
        .maybeSingle();
    if (error) {
        console.error("Erro Supabase:", error);
        throw new Error("Erro ao acessar o sistema.");
    }
    if (!data) {
        throw new Error("Usuário não encontrado.");
    }
    const usuario = data;
    // 🔐 Comparação com bcrypt
    const senhaValida = await bcrypt_1.default.compare(senha.trim(), usuario.senha);
    if (!senhaValida) {
        throw new Error("Senha incorreta.");
    }
    const token = jsonwebtoken_1.default.sign({ id: usuario.id, username: usuario.username }, JWT_SECRET, { expiresIn: "8h" });
    return {
        message: "Login realizado com sucesso.",
        token,
        user: {
            id: usuario.id,
            username: usuario.username,
        },
    };
}
//# sourceMappingURL=authService.js.map