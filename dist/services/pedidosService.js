"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.supabase = void 0;
exports.getNextNumeroPedido = getNextNumeroPedido;
exports.createPedidoComNumero = createPedidoComNumero;
exports.updatePedidoByNumeroSeq = updatePedidoByNumeroSeq;
exports.getPedidoByNumeroSeq = getPedidoByNumeroSeq;
exports.getPedidosResumo = getPedidosResumo;
exports.getPedidosFiltrados = getPedidosFiltrados;
exports.deletePedido = deletePedido;
exports.getPedidosParaPdf = getPedidosParaPdf;
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
/* ---------------- Helpers ---------------- */
function getCurrentTimestamp() {
    const now = new Date();
    return now.toISOString(); // UTC
}
function formatDateLocal(dateString) {
    if (!dateString)
        return dateString ?? '';
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
const CACHE_TTL_MS = Number(process.env.PEDIDOS_CACHE_TTL_MS ?? 20000); // 20s default
const cache = new Map();
function cacheGet(key) {
    const e = cache.get(key);
    if (!e)
        return null;
    if (Date.now() > e.expiresAt) {
        cache.delete(key);
        return null;
    }
    return e.value;
}
function cacheSet(key, value, ttlMs = CACHE_TTL_MS) {
    cache.set(key, { value, expiresAt: Date.now() + ttlMs });
}
/* ---------------- Core DB helpers ---------------- */
async function insertPedido(pedido) {
    if (!pedido.nome_cliente || pedido.total == null || !pedido.pedido) {
        throw new Error('Campos obrigatórios faltando: nome_cliente, total ou pedido');
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
        created_at: formatDateLocal(data.created_at),
        updated_at: formatDateLocal(data.updated_at),
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
    if (camposAtualizados.status && !validStatuses.includes(camposAtualizados.status)) {
        throw new Error('Status inválido');
    }
    const { data, error } = await exports.supabase
        .from('dbpedidos')
        .update({ ...camposAtualizados, updated_at: getCurrentTimestamp() })
        .eq('numero_seq', numero_seq)
        .select('*')
        .single();
    if (error)
        throw new Error(`Erro ao atualizar pedido: ${error.message}`);
    // Invalidate cache broadly (simples)
    cache.clear();
    return {
        ...data,
        created_at: formatDateLocal(data.created_at),
        updated_at: formatDateLocal(data.updated_at),
    };
}
/* ---------------- Get pedido detalhe ---------------- */
async function getPedidoByNumeroSeq(numero_seq) {
    const cacheKey = `pedido:${numero_seq}`;
    const cached = cacheGet(cacheKey);
    if (cached)
        return cached;
    const { data, error } = await exports.supabase
        .from('dbpedidos')
        .select('*')
        .eq('numero_seq', numero_seq)
        .single();
    if (error && error.code !== 'PGRST116') {
        // PGRST116 is "No rows found" in PostgREST sometimes — keep generic safe handling
        throw new Error(`Erro ao buscar pedido: ${error.message}`);
    }
    if (!data)
        return null;
    const result = {
        ...data,
        created_at: formatDateLocal(data.created_at),
        updated_at: formatDateLocal(data.updated_at),
    };
    cacheSet(cacheKey, result);
    return result;
}
/* ---------------- Listagem otimizada com paginação e campos selecionados ---------------- */
async function getPedidosResumo(page = 1, limit = 50, opts) {
    const from = (page - 1) * limit;
    const to = from + limit - 1;
    const cacheKey = `pedidos:resumo:p=${page}:l=${limit}:fmt=${Boolean(opts?.formatDates)}`;
    if (opts?.useCache) {
        const cached = cacheGet(cacheKey);
        if (cached)
            return cached;
    }
    const { data, error } = await exports.supabase
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
    const result = (data ?? []).map((r) => ({
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
function toStartOfDayISO(dateYmd) {
    return new Date(dateYmd + 'T00:00:00Z').toISOString();
}
function toEndOfDayISO(dateYmd) {
    return new Date(dateYmd + 'T23:59:59.999Z').toISOString();
}
async function getPedidosFiltrados(params) {
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
        const cached = cacheGet(cacheKey);
        if (cached)
            return cached;
    }
    let query = exports.supabase
        .from('dbpedidos')
        .select('id, numero_seq, nome_cliente, total, status, created_at, atendente, tipo');
    if (params.numero_seq !== undefined)
        query = query.eq('numero_seq', params.numero_seq);
    if (params.nome_cliente)
        query = query.ilike('nome_cliente', `%${params.nome_cliente}%`);
    if (params.status)
        query = query.eq('status', params.status);
    if (params.data_inicio)
        query = query.gte('created_at', toStartOfDayISO(params.data_inicio));
    if (params.data_fim)
        query = query.lte('created_at', toEndOfDayISO(params.data_fim));
    query = query.order('created_at', { ascending: false }).range(from, to);
    const { data, error } = await query;
    if (error)
        throw new Error(error.message || 'Erro ao buscar pedidos filtrados');
    const rows = (data ?? []);
    const result = rows.map((r) => ({
        id: r.id,
        numero_seq: Number(r.numero_seq),
        nome_cliente: r.nome_cliente,
        total: Number(r.total),
        created_at: params.formatDates ? formatDateLocal(r.created_at) : r.created_at,
        status: r.status,
        atendente: r.atendente ?? null,
        tipo: r.tipo ?? null,
    }));
    if (params.useCache)
        cacheSet(cacheKey, result);
    return result;
}
/* ---------------- Delete ---------------- */
async function deletePedido(id) {
    const { error } = await exports.supabase.from('dbpedidos').delete().eq('id', id);
    if (error)
        throw new Error(`Erro ao deletar pedido: ${error.message}`);
    cache.clear(); // invalida cache simples
    return { message: 'Pedido removido com sucesso.' };
}
function toStartOfDayUTC(date) {
    const d = new Date(date);
    d.setUTCHours(0, 0, 0, 0);
    return d.toISOString();
}
function toEndOfDayUTC(date) {
    const d = new Date(date);
    d.setUTCHours(23, 59, 59, 999);
    return d.toISOString();
}
async function getPedidosParaPdf(filters = {}) {
    let query = exports.supabase
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
    return (data ?? []);
}
//# sourceMappingURL=pedidosService.js.map