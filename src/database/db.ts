import Database from 'better-sqlite3';
import { join } from 'path';

const dbPath = join(__dirname, '../../data/orders.db');

const db = new Database(dbPath);

db.exec(`
  CREATE TABLE IF NOT EXISTS orders (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    order_nsu TEXT UNIQUE NOT NULL,
    slug TEXT,
    amount INTEGER NOT NULL,
    status TEXT NOT NULL,
    payment_method TEXT,
    customer_name TEXT,
    customer_email TEXT NOT NULL,
    items TEXT,
    paid_at TEXT,
    created_at TEXT DEFAULT CURRENT_TIMESTAMP,
    updated_at TEXT DEFAULT CURRENT_TIMESTAMP
  );

  -- Índice para buscar rápido por email
  CREATE INDEX IF NOT EXISTS idx_customer_email ON orders(customer_email);
`);

console.log('✅ Banco SQLite atualizado com sucesso');
export default db;