// src/routes/authRoutes.ts
import express from "express";
import { loginUsuario } from "../services/authService";

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


export default router;
