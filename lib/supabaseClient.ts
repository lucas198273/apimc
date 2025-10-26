// lib/supabaseClient.ts
import { createClient } from "@supabase/supabase-js";

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

export const supabase = createClient(supabaseUrl, supabaseKey);

// 🔍 Teste de conexão
(async () => {
  try {
    const { data, error } = await supabase.from("dbpedidos").select("id").limit(1);
    if (error) {
      console.error("❌ Falha ao conectar ao Supabase:", error.message);
    } else {
      console.log(`✅ Conexão bem-sucedida. ${data?.length || 0} registros encontrados.`);
    }
  } catch (err) {
    console.error("❌ Erro inesperado ao testar conexão:", err);
  }
})();
