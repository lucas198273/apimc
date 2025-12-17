// src/middleware/requireAuth.ts
import { Request, Response, NextFunction } from "express";
import { verifySupabaseToken } from "../lib/verififySupabaseToken";

export async function requireAuth(
  req: Request & { user?: any },
  res: Response,
  next: NextFunction
) {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader) {
      return res.status(401).json({ message: "Token de autenticação ausente." });
    }

    const token = authHeader.replace("Bearer ", "").trim();
    const user = await verifySupabaseToken(token);

    req.user = user;
    next();
  } catch (err: any) {
    return res.status(401).json({ message: err.message });
  }
}
