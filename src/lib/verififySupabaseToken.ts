// src/lib/verifySupabaseToken.ts
import { supabaseAdmin } from "./supabaseAdmin";

/**
 * Valida token JWT do Supabase e retorna o usuário
 */
export async function verifySupabaseToken(token: string) {
  if (!token) throw new Error("Token não fornecido");

  const { data, error } = await supabaseAdmin.auth.getUser(token);

  if (error || !data.user) {
    throw new Error("Token inválido ou expirado");
  }

  return data.user;
}
