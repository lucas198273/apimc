import { Request, Response, NextFunction } from 'express';
import crypto from 'crypto';

// Gera nonce seguro por requisição
const generateNonce = (): string => {
  return crypto.randomBytes(16).toString('base64');
};

export const securityHeaders = (req: Request, res: Response, next: NextFunction) => {
  const nonce = generateNonce();

  const csp = `
    default-src 'self';
    script-src 'self'
      'unsafe-eval'
      'nonce-${nonce}'
      'strict-dynamic'
      'sha256-UybBLO3i0QiaEJZkOLjFmbqE0x840dbH2isZjUTB3lE='
      'sha256-/OSCzUqB33sqYLgV4kz84aOAUOaWhIG3O64pfh0mYnI='
      *.infinitepay.io 
      *.google.com 
      *.google.com.br 
      applepay.cdn-apple.com 
      *.unico.io 
      *.amplitude.com 
      *.cloudflare.com 
      *.clarity.ms 
      *.onlinemetrix.net 
      *.online-metrix.net;
    style-src 'self' 'unsafe-inline';
    img-src 'self' data: https:;
    connect-src 'self' *.infinitepay.io *.unico.io *.amplitude.com *.cloudflare.com *.onlinemetrix.net;
    frame-src 'self' *.infinitepay.io;
    object-src 'none';
    base-uri 'self';
    form-action 'self';
    upgrade-insecure-requests;
  `.replace(/\s+/g, ' ').trim();

  res.setHeader('Content-Security-Policy', csp);

  // Headers de segurança básicos
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'DENY');
  res.setHeader('X-XSS-Protection', '1; mode=block');
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');

  next();   // ← Aqui estava o erro
};

export const validateContentType = (req: Request, res: Response, next: NextFunction) => {
  if (req.method === 'POST' && !req.is('application/json')) {
    return res.status(415).json({ error: 'Content-Type must be application/json' });
  }
  next();
};