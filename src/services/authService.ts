// src/services/authService.ts
import { supabase } from "../lib/supabaseClient";
import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET || "segredo_temporario";

interface User {
  id: string;
  username: string;
  senha: string;
}

/* ---------------- LOGIN ---------------- */
export async function loginUsuario(username: string, senha: string) {
  const { data, error } = await supabase
    .from("usuarios")
    .select("id, username, senha")
    .eq("username", username)
    .limit(1)
    .single();

  if (error || !data) throw new Error("Usuário não encontrado");

  const usuario = data as User;

  if (usuario.senha !== senha) throw new Error("Senha incorreta");

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

