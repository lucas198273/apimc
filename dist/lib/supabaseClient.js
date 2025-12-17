"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.supabase = void 0;
// src/lib/supabaseClient.ts
const supabase_js_1 = require("@supabase/supabase-js");
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
if (!supabaseUrl || !supabaseServiceKey) {
    throw new Error("Supabase URL ou SERVICE_ROLE_KEY não configurados.");
}
exports.supabase = (0, supabase_js_1.createClient)(supabaseUrl, supabaseServiceKey);
console.log("✅ Supabase Client backend inicializado.");
// Teste de conexão opcional
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