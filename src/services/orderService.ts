import db from '../database/db';

export interface OrderData {
  order_nsu: string;
  slug?: string;
  amount: number;
  status: string;
  payment_method?: string;
  customer?: {
    name?: string;
    email?: string;
  };
  items?: any[];
  paid_at?: string;
}

// Salvar / Atualizar pedido
export async function salvarPedido(orderData: OrderData) {
  const stmt = db.prepare(`
    INSERT INTO orders (
      order_nsu, slug, amount, status, payment_method, 
      customer_name, customer_email, items, paid_at
    )
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    ON CONFLICT(order_nsu) DO UPDATE SET
      status = excluded.status,
      paid_at = excluded.paid_at,
      updated_at = CURRENT_TIMESTAMP
  `);

  stmt.run(
    orderData.order_nsu,
    orderData.slug,
    orderData.amount,
    orderData.status,
    orderData.payment_method,
    orderData.customer?.name || null,
    orderData.customer?.email || null,
    JSON.stringify(orderData.items || []),
    orderData.paid_at || null
  );

  return { success: true, order_nsu: orderData.order_nsu };
}

// Buscar pedidos de UM cliente específico
export async function getPedidosByEmail(email: string) {
  const stmt = db.prepare(`
    SELECT * FROM orders 
    WHERE customer_email = ? 
    ORDER BY created_at DESC
  `);
  
  return stmt.all(email);
}