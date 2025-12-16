import "dotenv/config";
import { createClient } from "@supabase/supabase-js";
import bcrypt from "bcrypt";

const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

async function createUser() {
  const username = "the brothers";
  const senha = "1#2#3#";

  const senhaHash = await bcrypt.hash(senha, 10);

  const { error } = await supabase
    .from("usuarios")
    .insert({
      username,
      senha: senhaHash,
    });

  if (error) {
    console.error("❌ Erro ao criar usuário:", error);
  } else {
    console.log("✅ Usuário criado com sucesso!");
  }
}

createUser();
