import "dotenv/config";
import { createClient } from "@supabase/supabase-js";

const supabaseAdmin = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  }
);

async function createAuthUser() {
  const email = "thebrothersbetim@gmail.com";
  const password = "1#2#3#";

  const { data, error } = await supabaseAdmin.auth.admin.createUser({
    email,
    password,
    email_confirm: true, // Confirma automaticamente para permitir login imediato
  });

  if (error) {
    console.error("❌ Erro ao criar usuário no Auth:", error);
  } else {
    console.log("✅ Usuário Auth criado com sucesso:", data.user);
  }
}

createAuthUser();
