// src/routes/authRoutes.ts
import express from "express";
import { loginUsuario, criarUsuario } from "../services/authService";

const router = express.Router();

/* ---------------------- LOGIN ---------------------- */
router.post("/login", async (req, res) => {
  const { username, senha } = req.body;

  try {
    const result = await loginUsuario(username, senha);
    res.json(result);
  } catch (err: any) {
    res.status(400).json({ message: err.message });
  }
});

/* ---------------------- REGISTRO ---------------------- */
router.post("/register", async (req, res) => {
  const { username, senha } = req.body;

  if (!username || !senha) {
    return res.status(400).json({ error: "Usuário e senha são obrigatórios." });
  }

  try {
    const result = await criarUsuario(username, senha);
    res.json({ message: "Usuário criado com sucesso!", result });
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

export default router;
