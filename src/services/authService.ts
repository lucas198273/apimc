import { supabase } from "../lib/supabaseClient";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";

const JWT_SECRET = process.env.JWT_SECRET || "segredo_temporario";

interface User {
  id: string;
  username: string;
  senha: string;
}

export async function loginUsuario(username: string, senha: string) {
  if (!username || !senha) {
    throw new Error("Usuário e senha são obrigatórios.");
  }

  const { data, error } = await supabase
    .from("usuarios")
    .select("id, username, senha")
    .eq("username", username.trim())
    .limit(1)
    .maybeSingle();

  if (error) {
    console.error("Erro Supabase:", error);
    throw new Error("Erro ao acessar o sistema.");
  }

  if (!data) {
    throw new Error("Usuário não encontrado.");
  }

  const usuario = data as User;

  // 🔐 Comparação com bcrypt
  const senhaValida = await bcrypt.compare(
    senha.trim(),
    usuario.senha
  );

  if (!senhaValida) {
    throw new Error("Senha incorreta.");
  }

  const token = jwt.sign(
    { id: usuario.id, username: usuario.username },
    JWT_SECRET,
    { expiresIn: "8h" }
  );

  return {
    message: "Login realizado com sucesso.",
    token,
    user: {
      id: usuario.id,
      username: usuario.username,
    },
  };
}
