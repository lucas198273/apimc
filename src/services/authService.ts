import { supabase } from "../lib/supabaseClient";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET || "segredo_temporario";

interface User {
  id: string;
  username: string;
  password_hash: string;
}

/* ---------------- LOGIN ---------------- */
export async function loginUsuario(username: string, senha: string) {
  const { data, error } = await supabase
    .from("usuarios")
    .select("*")
    .eq("username", username)
    .single();

  if (error || !data) throw new Error("Usuário não encontrado");

  const usuario = data as User;

  // Compara a senha digitada com o hash do banco
  const senhaValida = await bcrypt.compare(senha, usuario.password_hash);
  if (!senhaValida) throw new Error("Senha incorreta");

  // Gera token JWT
  const token = jwt.sign(
    { id: usuario.id, username: usuario.username },
    JWT_SECRET,
    { expiresIn: "8h" }
  );

  return {
    token,
    user: {
      id: usuario.id,
      username: usuario.username,
    },
  };
}

/* ---------------- CRIAR USUÁRIO ---------------- */
export async function criarUsuario(username: string, senha: string) {
  const password_hash = await bcrypt.hash(senha, 10);

  const { data, error } = await supabase
    .from("usuarios")
    .insert([{ username, password_hash }])
    .select("*")
    .single();

  if (error) throw new Error(`Erro ao criar usuário: ${error.message}`);

  return data;
}
