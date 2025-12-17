// src/services/authService.ts
import { supabaseAdmin } from "../lib/supabaseAdmin";

/**
 * Verifica e valida o token enviado pelo cliente.
 * @param token JWT do Supabase Auth
 */
export async function verifySupabaseToken(token: string) {
  if (!token) {
    throw new Error("Token de autenticação não informado.");
  }

  const { data, error } = await supabaseAdmin.auth.getUser(token);

  if (error || !data.user) {
    throw new Error("Token inválido ou usuário não encontrado.");
  }

  return data.user; // retorna objeto user com sub, email, role etc.
}
