import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const supabase = createClient(supabaseUrl, supabaseKey);

export interface Order {
  id: string;
  numero_seq: number;
  total: number | null;
  data: string;
  status: string | null;
  tipo: string | null;
  mesa: string | null;
  observacao: string | null;
  nome_cliente: string | null;
  telefone?: string;
  endereco: any;
  pedido: { name: string; price: number; quantity: number }[] | null;
  atendente?: string;
}

/* ----------------------- Funções auxiliares ----------------------- */
function formatDate(dateString: string): string {
  const d = new Date(dateString);
  return isNaN(d.getTime())
    ? 'Data inválida'
    : d.toLocaleString('pt-BR', { timeZone: 'America/Sao_Paulo', hour12: false });
}

/* ----------------------- CRUD de pedidos ----------------------- */

// Deletar pedido pelo ID
export async function deletePedido(id: string) {
  const { error } = await supabase.from('dbpedidos').delete().eq('id', id);
  if (error) throw new Error(`Erro ao deletar pedido: ${error.message}`);
  return { message: 'Pedido removido com sucesso.' };
}

// Retorna o próximo número sequencial
export async function getNextNumeroPedido(): Promise<number> {
  const { data, error } = await supabase
    .from('dbpedidos')
    .select('numero_seq')
    .order('numero_seq', { ascending: false })
    .limit(1);

  if (error) throw error;
  return data?.[0]?.numero_seq ? data[0].numero_seq + 1 : 1;
}

// Criar pedido com número sequencial automático
export async function createPedidoComNumero(novoPedido: Partial<Order>) {
  const numero_seq = await getNextNumeroPedido();
  const { data, error } = await supabase
    .from('dbpedidos')
    .insert([{ ...novoPedido, numero_seq }])
    .select('*')
    .single();

  if (error) throw error;
  return { ...data, data: formatDate(data.data) };
}

// Criar pedido normalmente (caso já tenha número definido)
export async function createPedido(novoPedido: Partial<Order>) {
  const { data, error } = await supabase
    .from('dbpedidos')
    .insert([novoPedido])
    .select('*')
    .single();

  if (error) throw error;
  return { ...data, data: formatDate(data.data) };
}
// Atualizar pedido pelo número sequencial
export async function updatePedidoByNumeroSeq(numero_seq: number, camposAtualizados: Partial<Order>) {
  const { data, error } = await supabase
    .from('dbpedidos')
    .update(camposAtualizados)
    .eq('numero_seq', numero_seq)
    .select('*')
    .single();

  if (error) throw new Error(`Erro ao atualizar pedido: ${error.message}`);
  return { ...data, data: formatDate(data.data) };
}


// Buscar pedido específico pelo número sequencial
export async function getPedidoByNumeroSeq(numero_seq: number): Promise<Order | null> {
  const { data, error } = await supabase
    .from('dbpedidos')
    .select('*')
    .eq('numero_seq', numero_seq)
    .single();

  if (error) throw new Error(`Erro ao buscar pedido: ${error.message}`);
  return data ? { ...data, data: formatDate(data.data) } : null;
}

// Buscar todos os pedidos (ordenados por data)
export async function getPedidos(): Promise<Order[]> {
  const { data, error } = await supabase
    .from('dbpedidos')
    .select('*')
    .order('data', { ascending: false });

  if (error) throw new Error(`Erro ao buscar pedidos: ${error.message}`);
  return (data as Order[]).map(order => ({
    ...order,
    data: formatDate(order.data),
  }));
}

/* ----------------------- FILTROS ----------------------- */
// Filtrar por número, nome do cliente ou status
export async function getPedidosFiltrados(filtros: {
  numero_seq?: number;
  nome_cliente?: string;
  status?: string;
}): Promise<Order[]> {
  let query = supabase.from('dbpedidos').select('*').order('data', { ascending: false });

  if (filtros.numero_seq) {
    query = query.eq('numero_seq', filtros.numero_seq);
  }

  if (filtros.nome_cliente) {
    query = query.ilike('nome_cliente', `%${filtros.nome_cliente}%`);
  }

  if (filtros.status) {
    query = query.ilike('status', `%${filtros.status}%`);
  }

  const { data, error } = await query;
  if (error) throw new Error(`Erro ao aplicar filtros: ${error.message}`);

  return (data as Order[]).map(order => ({
    ...order,
    data: formatDate(order.data),
  }));
}
