"use strict";
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
(async () => {
    try {
        const { data, error } = await exports.supabase.from("dbpedidos").select("id").limit(1);
        if (error) {
            console.error("❌ Falha ao conectar ao Supabase:", error.message);
        }
        else {
            console.log(`✅ Conexão bem-sucedida. ${data?.length || 0} registros encontrados.`);
        }
    }
    catch (err) {
        console.error("❌ Erro inesperado ao testar conexão:", err);
    }
})();
//# sourceMappingURL=supabaseClient.js.map