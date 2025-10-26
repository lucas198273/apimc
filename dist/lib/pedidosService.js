"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.deletePedido = deletePedido;
exports.getNextNumeroPedido = getNextNumeroPedido;
exports.createPedidoComNumero = createPedidoComNumero;
exports.createPedido = createPedido;
exports.updatePedidoByNumeroSeq = updatePedidoByNumeroSeq;
exports.getPedidoByNumeroSeq = getPedidoByNumeroSeq;
exports.getPedidos = getPedidos;
exports.getPedidosFiltrados = getPedidosFiltrados;
const supabase_js_1 = require("@supabase/supabase-js");
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const supabase = (0, supabase_js_1.createClient)(supabaseUrl, supabaseKey);
/* ----------------------- Funções auxiliares ----------------------- */
function formatDate(dateString) {
    const d = new Date(dateString);
    return isNaN(d.getTime())
        ? 'Data inválida'
        : d.toLocaleString('pt-BR', { timeZone: 'America/Sao_Paulo', hour12: false });
}
/* ----------------------- CRUD de pedidos ----------------------- */
// Deletar pedido pelo ID
async function deletePedido(id) {
    const { error } = await supabase.from('dbpedidos').delete().eq('id', id);
    if (error)
        throw new Error(`Erro ao deletar pedido: ${error.message}`);
    return { message: 'Pedido removido com sucesso.' };
}
// Retorna o próximo número sequencial
async function getNextNumeroPedido() {
    const { data, error } = await supabase
        .from('dbpedidos')
        .select('numero_seq')
        .order('numero_seq', { ascending: false })
        .limit(1);
    if (error)
        throw error;
    return data?.[0]?.numero_seq ? data[0].numero_seq + 1 : 1;
}
// Criar pedido com número sequencial automático
async function createPedidoComNumero(novoPedido) {
    const numero_seq = await getNextNumeroPedido();
    const { data, error } = await supabase
        .from('dbpedidos')
        .insert([{ ...novoPedido, numero_seq }])
        .select('*')
        .single();
    if (error)
        throw error;
    return { ...data, data: formatDate(data.data) };
}
// Criar pedido normalmente (caso já tenha número definido)
async function createPedido(novoPedido) {
    const { data, error } = await supabase
        .from('dbpedidos')
        .insert([novoPedido])
        .select('*')
        .single();
    if (error)
        throw error;
    return { ...data, data: formatDate(data.data) };
}
// Atualizar pedido pelo número sequencial
async function updatePedidoByNumeroSeq(numero_seq, camposAtualizados) {
    const { data, error } = await supabase
        .from('dbpedidos')
        .update(camposAtualizados)
        .eq('numero_seq', numero_seq)
        .select('*')
        .single();
    if (error)
        throw new Error(`Erro ao atualizar pedido: ${error.message}`);
    return { ...data, data: formatDate(data.data) };
}
// Buscar pedido específico pelo número sequencial
async function getPedidoByNumeroSeq(numero_seq) {
    const { data, error } = await supabase
        .from('dbpedidos')
        .select('*')
        .eq('numero_seq', numero_seq)
        .single();
    if (error)
        throw new Error(`Erro ao buscar pedido: ${error.message}`);
    return data ? { ...data, data: formatDate(data.data) } : null;
}
// Buscar todos os pedidos (ordenados por data)
async function getPedidos() {
    const { data, error } = await supabase
        .from('dbpedidos')
        .select('*')
        .order('data', { ascending: false });
    if (error)
        throw new Error(`Erro ao buscar pedidos: ${error.message}`);
    return data.map(order => ({
        ...order,
        data: formatDate(order.data),
    }));
}
/* ----------------------- FILTROS ----------------------- */
// Filtrar por número, nome do cliente ou status
async function getPedidosFiltrados(filtros) {
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
    if (error)
        throw new Error(`Erro ao aplicar filtros: ${error.message}`);
    return data.map(order => ({
        ...order,
        data: formatDate(order.data),
    }));
}
//# sourceMappingURL=pedidosService.js.map