// src/lib/axios-client.ts  (ou http-client.ts)
import axios from "axios";
import https from "https";
import http from "http";

const httpsAgent = new https.Agent({
  keepAlive: true,
  keepAliveMsecs: 15000,     // Mantém a conexão viva por 15 segundos (ideal)
  maxSockets: 80,            // Aumentado um pouco
  maxFreeSockets: 20,        // Mais sockets livres para reutilização
  timeout: 60000,
  scheduling: 'fifo',        // Mais justo em alta concorrência
});

const httpAgent = new http.Agent({
  keepAlive: true,
  keepAliveMsecs: 15000,
  maxSockets: 80,
  maxFreeSockets: 20,
  timeout: 60000,
});

export const infiniteAxios = axios.create({
  httpsAgent,
  httpAgent,                    // ← Adicionado (boa prática)
  timeout: 25000,               // Reduzido um pouco (30s é bastante)
  headers: {
    "Content-Type": "application/json",
    "Accept": "application/json",
  },
  // Opcional: reutilização de sessão TLS (ajuda bastante em HTTPS)
  validateStatus: (status) => status >= 200 && status < 500,
});