"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.verifySupabaseToken = verifySupabaseToken;
// src/lib/verifySupabaseToken.ts
const supabaseAdmin_1 = require("./supabaseAdmin");
/**
 * Valida token JWT do Supabase e retorna o usuário
 */
async function verifySupabaseToken(token) {
    if (!token)
        throw new Error("Token não fornecido");
    const { data, error } = await supabaseAdmin_1.supabaseAdmin.auth.getUser(token);
    if (error || !data.user) {
        throw new Error("Token inválido ou expirado");
    }
    return data.user;
}
//# sourceMappingURL=verififySupabaseToken.js.map