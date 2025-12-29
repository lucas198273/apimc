export interface Order {
  id: string;
  customerName: string;
  total: number;
  status: string;
  createdAt: string;
}

export type OrderStatus =
  | 'aguardando confirmação'
  | 'pedido sendo preparado'
  | 'pedido pronto'
  | 'cancelado';
// src/types/Orders.ts
export type OrderTipo =  'mesa' | 'delivery';
export interface OrderPdf {
  numero_seq: number;
  nome_cliente: string;
  total: number;
  created_at: string;
  status: OrderStatus;
  tipo: OrderTipo | null;
  mesa?: string | null;
  telefone?: string | null;
  atendente?: string | null;
  observacao?: string | null;
  pedido: Array<{
    name: string;
    price: number;
    quantity: number;
  }>;
}