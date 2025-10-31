// src/scripts/migrarSenhasParaHash.ts
import { supabase } from "../lib/supabaseClient";
import bcrypt from "bcryptjs";

export async function migrarSenhasParaHash() {
  const { data: usuarios, error } = await supabase.from("usuarios").select("*");

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
    if ((user as any).senha && !user.password_hash) {
      const hash = await bcrypt.hash((user as any).senha, 10);

      const { error: updateError } = await supabase
        .from("usuarios")
        .update({ password_hash: hash })
        .eq("id", user.id);

      if (updateError) {
        console.error(`Erro ao migrar ${user.username}:`, updateError.message);
      } else {
        console.log(`✅ Usuário ${user.username} migrado com sucesso!`);
      }
    }
  }

  console.log("🚀 Migração concluída!");
}
