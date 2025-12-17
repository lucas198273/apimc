// src/routes/userRoutes.ts
import express from "express";
import { requireAuth } from "../middleware/requireAuth";

const router = express.Router();

router.get("/perfil", requireAuth, (req: any, res) => {
  // req.user contém usuário autenticado do Supabase
  res.json({ user: req.user });
});

export default router;
