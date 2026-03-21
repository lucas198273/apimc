// src/middleware/rate-limit.ts - VERSÃO ALTERNATIVA
import rateLimit from 'express-rate-limit';
import { Request } from 'express';

export const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: 100, // 100 requisições por IP
  message: {
    error: 'Muitas requisições. Tente novamente mais tarde.',
    retry_after: Math.ceil((15 * 60 * 1000) / 1000),
  },
  standardHeaders: true,
  legacyHeaders: false,
  // ✅ CORREÇÃO MANUAL para IPv6
  keyGenerator: (req: Request): string => {
    // Pega o IP real considerando proxy
    const ip = req.ip || 
               req.headers['x-forwarded-for']?.toString() || 
               req.socket.remoteAddress || 
               'unknown';
    
    // Remove prefixo IPv6 se existir (::ffff:)
    return ip.replace(/^::ffff:/, '');
  },
  skip: (req: Request) => req.path === '/health', // Não limitar health check
});