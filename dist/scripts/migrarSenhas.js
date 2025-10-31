"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.migrarSenhasParaHash = migrarSenhasParaHash;
// src/scripts/migrarSenhasParaHash.ts
const supabaseClient_1 = require("../lib/supabaseClient");
const bcryptjs_1 = __importDefault(require("bcryptjs"));
async function migrarSenhasParaHash() {
    const { data: usuarios, error } = await supabaseClient_1.supabase.from("usuarios").select("*");
    if (error) {
        console.error("Erro ao buscar usuários:", error.message);
        return;
    }
    if (!usuarios || usuarios.length === 0) {
        console.log("Nenhum usuário encontrado.");
        return;
    }
    for (const user of usuarios) {
        // Verifica se existe um campo 'senha' e se ainda não tem hash
        if (user.senha && !user.password_hash) {
            const hash = await bcryptjs_1.default.hash(user.senha, 10);
            const { error: updateError } = await supabaseClient_1.supabase
                .from("usuarios")
                .update({ password_hash: hash })
                .eq("id", user.id);
            if (updateError) {
                console.error(`Erro ao migrar ${user.username}:`, updateError.message);
            }
            else {
                console.log(`✅ Usuário ${user.username} migrado com sucesso!`);
            }
        }
    }
    console.log("🚀 Migração concluída!");
}
//# sourceMappingURL=migrarSenhas.js.map