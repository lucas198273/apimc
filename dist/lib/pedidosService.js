"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.supabase = void 0;
exports.getNextNumeroPedido = getNextNumeroPedido;
exports.createPedidoComNumero = createPedidoComNumero;
exports.updatePedidoByNumeroSeq = updatePedidoByNumeroSeq;
exports.getPedidoByNumeroSeq = getPedidoByNumeroSeq;
exports.getPedidos = getPedidos;
exports.getPedidosFiltrados = getPedidosFiltrados;
exports.deletePedido = deletePedido;
// src/lib/pedidosService.ts
const supabase_js_1 = require("@supabase/supabase-js");
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
exports.supabase = (0, supabase_js_1.createClient)(supabaseUrl, supabaseKey);
const validStatuses = [
    'aguardando confirmação',
    'pedido sendo preparado',
    'pedido pronto',
    'cancelado',
];
function formatDate(dateString) {
    const date = new Date(dateString);
    return date.toLocaleString("pt-BR", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
    });
}
function getCurrentTimestamp() {
    return new Date().toISOString();
}
async function insertPedido(pedido) {
    // Validação básica
    if (!pedido.nome_cliente || !pedido.total || !pedido.pedido) {
        throw new Error("Campos obrigatórios faltando: nome_cliente, total ou pedido");
    }
    const { data, error } = await exports.supabase
        .from('dbpedidos')
        .insert([pedido])
        .select('*')
        .single();
    if (error)
        throw new Error(error.message);
    return {
        ...data,
        created_at: formatDate(data.created_at),
        updated_at: formatDate(data.updated_at),
    };
}
async function getNextNumeroPedido() {
    const { data, error } = await exports.supabase
        .from('dbpedidos')
        .select('numero_seq')
        .order('numero_seq', { ascending: false })
        .limit(1);
    if (error)
        throw new Error(error.message);
    return data?.[0]?.numero_seq ? data[0].numero_seq + 1 : 1;
}
async function createPedidoComNumero(novoPedido) {
    const numero_seq = await getNextNumeroPedido();
    return insertPedido({
        ...novoPedido,
        numero_seq,
        created_at: getCurrentTimestamp(),
        updated_at: getCurrentTimestamp(),
    });
}
async function updatePedidoByNumeroSeq(numero_seq, camposAtualizados) {
    // Valida status se enviado
    if (camposAtualizados.status && !validStatuses.includes(camposAtualizados.status)) {
        throw new Error("Status inválido");
    }
    const { data, error } = await exports.supabase
        .from('dbpedidos')
        .update({ ...camposAtualizados, updated_at: getCurrentTimestamp() })
        .eq('numero_seq', numero_seq)
        .select('*')
        .single();
    if (error)
        throw new Error(`Erro ao atualizar pedido: ${error.message}`);
    return {
        ...data,
        created_at: formatDate(data.created_at),
        updated_at: formatDate(data.updated_at),
    };
}
async function getPedidoByNumeroSeq(numero_seq) {
    const { data, error } = await exports.supabase
        .from('dbpedidos')
        .select('*')
        .eq('numero_seq', numero_seq)
        .single();
    if (error)
        throw new Error(`Erro ao buscar pedido: ${error.message}`);
    return data
        ? { ...data, created_at: formatDate(data.created_at), updated_at: formatDate(data.updated_at) }
        : null;
}
async function getPedidos() {
    const { data, error } = await exports.supabase
        .from('dbpedidos')
        .select('*')
        .order('created_at', { ascending: false });
    if (error)
        throw new Error(`Erro ao buscar pedidos: ${error.message}`);
    return data.map(order => ({
        ...order,
        created_at: formatDate(order.created_at),
        updated_at: formatDate(order.updated_at),
    }));
}
function toStartOfDayISO(dateYmd) {
    return new Date(dateYmd + 'T00:00:00Z').toISOString();
}
function toEndOfDayISO(dateYmd) {
    return new Date(dateYmd + 'T23:59:59.999Z').toISOString();
}
async function getPedidosFiltrados(filters) {
    let query = exports.supabase.from('dbpedidos').select('*');
    if (filters.numero_seq !== undefined)
        query = query.eq('numero_seq', filters.numero_seq);
    if (filters.nome_cliente)
        query = query.ilike('nome_cliente', `%${filters.nome_cliente}%`);
    if (filters.status)
        query = query.eq('status', filters.status);
    if (filters.data_inicio)
        query = query.gte('created_at', toStartOfDayISO(filters.data_inicio));
    if (filters.data_fim)
        query = query.lte('created_at', toEndOfDayISO(filters.data_fim));
    query = query.order('created_at', { ascending: false });
    const { data, error } = await query;
    if (error)
        throw new Error(error.message || 'Erro ao buscar pedidos filtrados');
    return data.map(o => ({
        ...o,
        created_at: o.created_at,
        updated_at: o.updated_at ?? undefined,
    }));
}
async function deletePedido(id) {
    const { error } = await exports.supabase.from('dbpedidos').delete().eq('id', id);
    if (error)
        throw new Error(`Erro ao deletar pedido: ${error.message}`);
    return { message: 'Pedido removido com sucesso.' };
}
//# sourceMappingURL=pedidosService.js.map