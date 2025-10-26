"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
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
function deletePedido(id) {
    return __awaiter(this, void 0, void 0, function* () {
        const { error } = yield supabase.from('dbpedidos').delete().eq('id', id);
        if (error)
            throw new Error(`Erro ao deletar pedido: ${error.message}`);
        return { message: 'Pedido removido com sucesso.' };
    });
}
// Retorna o próximo número sequencial
function getNextNumeroPedido() {
    return __awaiter(this, void 0, void 0, function* () {
        var _a;
        const { data, error } = yield supabase
            .from('dbpedidos')
            .select('numero_seq')
            .order('numero_seq', { ascending: false })
            .limit(1);
        if (error)
            throw error;
        return ((_a = data === null || data === void 0 ? void 0 : data[0]) === null || _a === void 0 ? void 0 : _a.numero_seq) ? data[0].numero_seq + 1 : 1;
    });
}
// Criar pedido com número sequencial automático
function createPedidoComNumero(novoPedido) {
    return __awaiter(this, void 0, void 0, function* () {
        const numero_seq = yield getNextNumeroPedido();
        const { data, error } = yield supabase
            .from('dbpedidos')
            .insert([Object.assign(Object.assign({}, novoPedido), { numero_seq })])
            .select('*')
            .single();
        if (error)
            throw error;
        return Object.assign(Object.assign({}, data), { data: formatDate(data.data) });
    });
}
// Criar pedido normalmente (caso já tenha número definido)
function createPedido(novoPedido) {
    return __awaiter(this, void 0, void 0, function* () {
        const { data, error } = yield supabase
            .from('dbpedidos')
            .insert([novoPedido])
            .select('*')
            .single();
        if (error)
            throw error;
        return Object.assign(Object.assign({}, data), { data: formatDate(data.data) });
    });
}
// Atualizar pedido pelo número sequencial
function updatePedidoByNumeroSeq(numero_seq, camposAtualizados) {
    return __awaiter(this, void 0, void 0, function* () {
        const { data, error } = yield supabase
            .from('dbpedidos')
            .update(camposAtualizados)
            .eq('numero_seq', numero_seq)
            .select('*')
            .single();
        if (error)
            throw new Error(`Erro ao atualizar pedido: ${error.message}`);
        return Object.assign(Object.assign({}, data), { data: formatDate(data.data) });
    });
}
// Buscar pedido específico pelo número sequencial
function getPedidoByNumeroSeq(numero_seq) {
    return __awaiter(this, void 0, void 0, function* () {
        const { data, error } = yield supabase
            .from('dbpedidos')
            .select('*')
            .eq('numero_seq', numero_seq)
            .single();
        if (error)
            throw new Error(`Erro ao buscar pedido: ${error.message}`);
        return data ? Object.assign(Object.assign({}, data), { data: formatDate(data.data) }) : null;
    });
}
// Buscar todos os pedidos (ordenados por data)
function getPedidos() {
    return __awaiter(this, void 0, void 0, function* () {
        const { data, error } = yield supabase
            .from('dbpedidos')
            .select('*')
            .order('data', { ascending: false });
        if (error)
            throw new Error(`Erro ao buscar pedidos: ${error.message}`);
        return data.map(order => (Object.assign(Object.assign({}, order), { data: formatDate(order.data) })));
    });
}
/* ----------------------- FILTROS ----------------------- */
// Filtrar por número, nome do cliente ou status
function getPedidosFiltrados(filtros) {
    return __awaiter(this, void 0, void 0, function* () {
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
        const { data, error } = yield query;
        if (error)
            throw new Error(`Erro ao aplicar filtros: ${error.message}`);
        return data.map(order => (Object.assign(Object.assign({}, order), { data: formatDate(order.data) })));
    });
}
