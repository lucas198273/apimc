// src/routes/authRoutes.ts
import express from "express";
import { loginUsuario } from "../services/authService";

const router = express.Router();

router.post("/login", async (req, res) => {
  const { username, senha } = req.body;

  try {
    const result = await loginUsuario(username, senha);
    return res.status(200).json(result);
  } catch (err: any) {
    console.error("🚨 Erro no login:", err.message);
    return res.status(400).json({ message: err.message });
  }
});

export default router;
