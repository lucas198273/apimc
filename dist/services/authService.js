"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.verifySupabaseToken = verifySupabaseToken;
// src/services/authService.ts
const supabaseAdmin_1 = require("../lib/supabaseAdmin");
/**
 * Verifica e valida o token enviado pelo cliente.
 * @param token JWT do Supabase Auth
 */
async function verifySupabaseToken(token) {
    if (!token) {
        throw new Error("Token de autenticação não informado.");
    }
    const { data, error } = await supabaseAdmin_1.supabaseAdmin.auth.getUser(token);
    if (error || !data.user) {
        throw new Error("Token inválido ou usuário não encontrado.");
    }
    return data.user; // retorna objeto user com sub, email, role etc.
}
//# sourceMappingURL=authService.js.map