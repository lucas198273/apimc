// src/lib/supabaseClient.ts
import { createClient } from "@supabase/supabase-js";
import type { Database } from "./supabaseTypes";

const supabaseUrl = process.env.SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

if (!supabaseUrl || !supabaseServiceKey) {
  throw new Error("Supabase URL ou SERVICE_ROLE_KEY não configurados.");
}

export const supabase = createClient<Database>(supabaseUrl, supabaseServiceKey);

console.log("✅ Supabase Client backend inicializado.");

// Teste de conexão opcional
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
