// src/lib/pedidosService.ts
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
export const supabase = createClient(supabaseUrl, supabaseKey);

export type OrderStatus = 'aguardando confirmação' | 'pedido sendo preparado' | 'pedido pronto' | 'cancelado';

export interface OrderItem {
  name: string;
  price: number;
  quantity: number;
}

export interface Order {
  id: string;
  numero_seq: number;
  total: number;
  created_at: string;
  updated_at: string;
  status: OrderStatus;
  tipo: string | null;
  mesa: string | null;
  observacao: string | null;
  nome_cliente: string;
  telefone?: string;
  endereco?: any;
  pedido: OrderItem[];
  atendente?: string;
}

const validStatuses: OrderStatus[] = [
  'aguardando confirmação',
  'pedido sendo preparado',
  'pedido pronto',
  'cancelado',
];

function formatDate(dateString: string) {
  const date = new Date(dateString);
  return date.toLocaleString("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function getCurrentTimestamp(): string {
  return new Date().toISOString();
}

async function insertPedido(pedido: Partial<Order>) {
  // Validação básica
  if (!pedido.nome_cliente || !pedido.total || !pedido.pedido) {
    throw new Error("Campos obrigatórios faltando: nome_cliente, total ou pedido");
  }

  const { data, error } = await supabase
    .from('dbpedidos')
    .insert([pedido])
    .select('*')
    .single();

  if (error) throw new Error(error.message);

  return {
    ...data,
    created_at: formatDate(data.created_at),
    updated_at: formatDate(data.updated_at),
  };
}

export async function getNextNumeroPedido(): Promise<number> {
  const { data, error } = await supabase
    .from('dbpedidos')
    .select('numero_seq')
    .order('numero_seq', { ascending: false })
    .limit(1);

  if (error) throw new Error(error.message);
  return data?.[0]?.numero_seq ? data[0].numero_seq + 1 : 1;
}

export async function createPedidoComNumero(novoPedido: Partial<Order>) {
  const numero_seq = await getNextNumeroPedido();
  return insertPedido({
    ...novoPedido,
    numero_seq,
    created_at: getCurrentTimestamp(),
    updated_at: getCurrentTimestamp(),
  });
}

export async function updatePedidoByNumeroSeq(numero_seq: number, camposAtualizados: Partial<Order>) {
  // Valida status se enviado
  if (camposAtualizados.status && !validStatuses.includes(camposAtualizados.status as OrderStatus)) {
    throw new Error("Status inválido");
  }

  const { data, error } = await supabase
    .from('dbpedidos')
    .update({ ...camposAtualizados, updated_at: getCurrentTimestamp() })
    .eq('numero_seq', numero_seq)
    .select('*')
    .single();

  if (error) throw new Error(`Erro ao atualizar pedido: ${error.message}`);

  return {
    ...data,
    created_at: formatDate(data.created_at),
    updated_at: formatDate(data.updated_at),
  };
}

export async function getPedidoByNumeroSeq(numero_seq: number): Promise<Order | null> {
  const { data, error } = await supabase
    .from('dbpedidos')
    .select('*')
    .eq('numero_seq', numero_seq)
    .single();

  if (error) throw new Error(`Erro ao buscar pedido: ${error.message}`);

  return data
    ? { ...data, created_at: formatDate(data.created_at), updated_at: formatDate(data.updated_at) }
    : null;
}

export async function getPedidos(): Promise<Order[]> {
  const { data, error } = await supabase
    .from('dbpedidos')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) throw new Error(`Erro ao buscar pedidos: ${error.message}`);

  return (data as Order[]).map(order => ({
    ...order,
    created_at: formatDate(order.created_at),
    updated_at: formatDate(order.updated_at),
  }));
}

function toStartOfDayISO(dateYmd: string) {
  return new Date(dateYmd + 'T00:00:00Z').toISOString();
}

function toEndOfDayISO(dateYmd: string) {
  return new Date(dateYmd + 'T23:59:59.999Z').toISOString();
}

export async function getPedidosFiltrados(filters: {
  numero_seq?: number;
  nome_cliente?: string;
  status?: OrderStatus;
  data_inicio?: string;
  data_fim?: string;
}): Promise<Order[]> {
  let query = supabase.from('dbpedidos').select('*');

  if (filters.numero_seq !== undefined) query = query.eq('numero_seq', filters.numero_seq);
  if (filters.nome_cliente) query = query.ilike('nome_cliente', `%${filters.nome_cliente}%`);
  if (filters.status) query = query.eq('status', filters.status);
  if (filters.data_inicio) query = query.gte('created_at', toStartOfDayISO(filters.data_inicio));
  if (filters.data_fim) query = query.lte('created_at', toEndOfDayISO(filters.data_fim));

  query = query.order('created_at', { ascending: false });

  const { data, error } = await query;
  if (error) throw new Error(error.message || 'Erro ao buscar pedidos filtrados');

  return (data as Order[]).map(o => ({
    ...o,
    created_at: o.created_at,
    updated_at: o.updated_at ?? undefined,
  }));
}

export async function deletePedido(id: string) {
  const { error } = await supabase.from('dbpedidos').delete().eq('id', id);
  if (error) throw new Error(`Erro ao deletar pedido: ${error.message}`);
  return { message: 'Pedido removido com sucesso.' };
}
