"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.supabase = void 0;
// lib/supabaseClient.ts
const supabase_js_1 = require("@supabase/supabase-js");
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
if (!supabaseUrl || !supabaseKey) {
    console.error("❌ Variáveis de ambiente ausentes!");
    console.error("SUPABASE_URL:", supabaseUrl);
    console.error("SUPABASE_SERVICE_ROLE_KEY:", supabaseKey ? "Definida" : "Indefinida");
    throw new Error("Variáveis de ambiente do Supabase não configuradas.");
}
console.log("✅ Supabase client inicializado.");
console.log("🔗 URL:", supabaseUrl);
exports.supabase = (0, supabase_js_1.createClient)(supabaseUrl, supabaseKey);
// 🔍 Teste de conexão
(() => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { data, error } = yield exports.supabase.from("dbpedidos").select("id").limit(1);
        if (error) {
            console.error("❌ Falha ao conectar ao Supabase:", error.message);
        }
        else {
            console.log(`✅ Conexão bem-sucedida. ${(data === null || data === void 0 ? void 0 : data.length) || 0} registros encontrados.`);
        }
    }
    catch (err) {
        console.error("❌ Erro inesperado ao testar conexão:", err);
    }
}))();
