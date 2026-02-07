import axios from "axios";
import https from "https";

const httpsAgent = new https.Agent({
  keepAlive: true,
  maxSockets: 50,
  maxFreeSockets: 10,
  timeout: 60000,
});

export const httpClient = axios.create({
  httpsAgent,
  timeout: 30000,
  headers: {
    "Content-Type": "application/json",
  },
});
