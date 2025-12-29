// src/lib/pedidosService.ts
import { createClient } from '@supabase/supabase-js';
import { type OrderPdf } from '../types/Orders';

const supabaseUrl = process.env.SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
export const supabase = createClient(supabaseUrl, supabaseKey);

/* ---------------- Types ---------------- */
export type OrderStatus =
  | 'aguardando confirmação'
  | 'pedido sendo preparado'
  | 'pedido pronto'
  | 'cancelado';

  
export interface OrderItem {
  name: string;
  price: number;
  quantity: number;
}

/** Tipo enxuto para listagem (mais leve) */
export interface OrderResumo {
  id: string;
  numero_seq: number;
  nome_cliente: string;
  telefone?: string;
  total: number;
  created_at: string; // já formatado se solicitado
  status: OrderStatus | string;
  atendente?: string | null;
  tipo?: string | null;
  endereco?: | null;
  mesa?: string | null;
  observacao?: string | null;
}

/** Tipo completo para detalhes do pedido */
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
/* ---------------- Helpers ---------------- */

function getCurrentTimestamp(): string {
  const now = new Date();

  return now.toISOString(); // UTC
}


function formatDateLocal(dateString: string | undefined | null) {
  if (!dateString) return dateString ?? '';

  const date = new Date(dateString);

  // Apenas formata corretamente no fuso de São Paulo (para logs ou debug)
  return date.toLocaleString('pt-BR', {
    timeZone: 'America/Sao_Paulo',
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}



/* ---------------- Simple in-memory cache (TTL) ----------------
   - chave: string construída a partir dos params (página/limit/filtros)
   - TTL padrão: 20s (configurável aqui)
   - Caveat: em ambientes serverless a cache pode não persistir entre invocações.
*/
type CacheEntry<T> = { value: T; expiresAt: number };
const CACHE_TTL_MS = Number(process.env.PEDIDOS_CACHE_TTL_MS ?? 20000); // 20s default
const cache = new Map<string, CacheEntry<unknown>>();

function cacheGet<T>(key: string): T | null {
  const e = cache.get(key) as CacheEntry<T> | undefined;
  if (!e) return null;
  if (Date.now() > e.expiresAt) {
    cache.delete(key);
    return null;
  }
  return e.value;
}
function cacheSet<T>(key: string, value: T, ttlMs = CACHE_TTL_MS) {
  cache.set(key, { value, expiresAt: Date.now() + ttlMs });
}

/* ---------------- Core DB helpers ---------------- */

async function insertPedido(pedido: Partial<Order>) {
  if (!pedido.nome_cliente || pedido.total == null || !pedido.pedido) {
    throw new Error('Campos obrigatórios faltando: nome_cliente, total ou pedido');
  }

  const { data, error } = await supabase
    .from('dbpedidos')
    .insert([pedido])
    .select('*')
    .single();

  if (error) throw new Error(error.message);

  return {
    ...data,
    created_at: formatDateLocal(data.created_at),
    updated_at: formatDateLocal(data.updated_at),
  } as Order;
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

export async function updatePedidoByNumeroSeq(
  numero_seq: number,
  camposAtualizados: Partial<Order>
) {
  if (camposAtualizados.status && !validStatuses.includes(camposAtualizados.status as OrderStatus)) {
    throw new Error('Status inválido');
  }

  const { data, error } = await supabase
    .from('dbpedidos')
    .update({ ...camposAtualizados, updated_at: getCurrentTimestamp() })
    .eq('numero_seq', numero_seq)
    .select('*')
    .single();

  if (error) throw new Error(`Erro ao atualizar pedido: ${error.message}`);

  // Invalidate cache broadly (simples)
  cache.clear();

  return {
    ...data,
    created_at: formatDateLocal(data.created_at),
    updated_at: formatDateLocal(data.updated_at),
  } as Order;
}

/* ---------------- Get pedido detalhe ---------------- */
export async function getPedidoByNumeroSeq(numero_seq: number): Promise<Order | null> {
  const cacheKey = `pedido:${numero_seq}`;
  const cached = cacheGet<Order>(cacheKey);
  if (cached) return cached;

  const { data, error } = await supabase
    .from('dbpedidos')
    .select('*')
    .eq('numero_seq', numero_seq)
    .single();

  if (error && error.code !== 'PGRST116') {
    // PGRST116 is "No rows found" in PostgREST sometimes — keep generic safe handling
    throw new Error(`Erro ao buscar pedido: ${error.message}`);
  }

  if (!data) return null;

  const result: Order = {
    ...data,
    created_at: formatDateLocal(data.created_at),
    updated_at: formatDateLocal(data.updated_at),
  } as unknown as Order;

  cacheSet(cacheKey, result);
  return result;
}

/* ---------------- Listagem otimizada com paginação e campos selecionados ---------------- */
export async function getPedidosResumo(
  page = 1,
  limit = 50,
  opts?: { formatDates?: boolean; useCache?: boolean }
): Promise<OrderResumo[]> {
  const from = (page - 1) * limit;
  const to = from + limit - 1;

  const cacheKey = `pedidos:resumo:p=${page}:l=${limit}:fmt=${Boolean(
    opts?.formatDates
  )}`;

  if (opts?.useCache) {
    const cached = cacheGet<OrderResumo[]>(cacheKey);
    if (cached) return cached;
  }

  const { data, error } = await supabase
    .from("dbpedidos")
    .select(`
      id,
      numero_seq,
      nome_cliente,
      total,
      created_at,
      status,
      atendente,
      tipo,
      mesa,
      telefone
    `)
    .order("created_at", { ascending: false })
    .range(from, to);

  if (error) {
    throw new Error(`Erro ao buscar pedidos: ${error.message}`);
  }

  const result: OrderResumo[] = (data ?? []).map((r) => ({
    id: r.id,
    numero_seq: Number(r.numero_seq),
    nome_cliente: r.nome_cliente,
    total: Number(r.total),
    created_at: opts?.formatDates
      ? formatDateLocal(r.created_at)
      : r.created_at,
    status: r.status,
    atendente: r.atendente ?? null,
    tipo: r.tipo,
    mesa: r.tipo === "mesa" ? r.mesa : null,
    telefone: r.telefone ?? null,
  }));

  if (opts?.useCache) {
    cacheSet(cacheKey, result);
  }

  return result;
}


/* ---------------- Filtragem paginada (retorna OrderResumo) ----------------
   - Sempre retorna [] quando nada encontrado
   - Recomendo usar índices nas colunas numero_seq, status, created_at, nome_cliente
*/
function toStartOfDayISO(dateYmd: string) {
  return new Date(dateYmd + 'T00:00:00Z').toISOString();
}
function toEndOfDayISO(dateYmd: string) {
  return new Date(dateYmd + 'T23:59:59.999Z').toISOString();
}

export async function getPedidosFiltrados(params: {
  page?: number;
  limit?: number;
  numero_seq?: number;
  nome_cliente?: string;
  status?: OrderStatus;
  data_inicio?: string; // "YYYY-MM-DD"
  data_fim?: string;    // "YYYY-MM-DD"
  useCache?: boolean;
  formatDates?: boolean;
}): Promise<OrderResumo[]> {
  const page = params.page ?? 1;
  const limit = params.limit ?? 50;
  const from = (page - 1) * limit;
  const to = from + limit - 1;

  const cacheKey = `pedidosFiltro:${JSON.stringify({
    page,
    limit,
    numero_seq: params.numero_seq,
    nome_cliente: params.nome_cliente,
    status: params.status,
    data_inicio: params.data_inicio,
    data_fim: params.data_fim,
  })}`;

  if (params.useCache) {
    const cached = cacheGet<OrderResumo[]>(cacheKey);
    if (cached) return cached;
  }

  let query = supabase
    .from('dbpedidos')
    .select('id, numero_seq, nome_cliente, total, status, created_at, atendente, tipo');

  if (params.numero_seq !== undefined) query = query.eq('numero_seq', params.numero_seq);
  if (params.nome_cliente) query = query.ilike('nome_cliente', `%${params.nome_cliente}%`);
  if (params.status) query = query.eq('status', params.status);
  if (params.data_inicio) query = query.gte('created_at', toStartOfDayISO(params.data_inicio));
  if (params.data_fim) query = query.lte('created_at', toEndOfDayISO(params.data_fim));

  query = query.order('created_at', { ascending: false }).range(from, to);

  const { data, error } = await query;
  if (error) throw new Error(error.message || 'Erro ao buscar pedidos filtrados');

  const rows = (data ?? []) as any[];

  const result: OrderResumo[] = rows.map((r) => ({
    id: r.id,
    numero_seq: Number(r.numero_seq),
    nome_cliente: r.nome_cliente,
    total: Number(r.total),
    created_at: params.formatDates ? formatDateLocal(r.created_at) : r.created_at,
    status: r.status,
    atendente: r.atendente ?? null,
    tipo: r.tipo ?? null,
    
  }));

  if (params.useCache) cacheSet(cacheKey, result);
  return result;
}

/* ---------------- Delete ---------------- */
export async function deletePedido(id: string) {
  const { error } = await supabase.from('dbpedidos').delete().eq('id', id);
  if (error) throw new Error(`Erro ao deletar pedido: ${error.message}`);
  cache.clear(); // invalida cache simples
  return { message: 'Pedido removido com sucesso.' };
}
interface PedidosPdfFilters {
  data_inicio?: string;
  data_fim?: string;
}
function toStartOfDayUTC(date: string) {
  const d = new Date(date);
  d.setUTCHours(0, 0, 0, 0);
  return d.toISOString();
}

function toEndOfDayUTC(date: string) {
  const d = new Date(date);
  d.setUTCHours(23, 59, 59, 999);
  return d.toISOString();
}

export async function getPedidosParaPdf(
  filters: PedidosPdfFilters = {}
): Promise<OrderPdf[]> {

  let query = supabase
    .from('dbpedidos')
    .select(`
      numero_seq,
      nome_cliente,
      total,
      created_at,
      status,
      tipo,
      mesa,
      telefone,
      atendente,
      observacao,
      pedido
    `)
    .order('created_at', { ascending: false });

  if (filters.data_inicio?.trim()) {
    query = query.gte('created_at', toStartOfDayUTC(filters.data_inicio));
  }

  if (filters.data_fim?.trim()) {
    query = query.lte('created_at', toEndOfDayUTC(filters.data_fim));
  }

  const { data, error } = await query;

  if (error) {
    console.error('Erro Supabase PDF:', error);
    throw new Error('Erro ao buscar pedidos para PDF');
  }

  return (data ?? []) as OrderPdf[];
}


