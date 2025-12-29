"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const pedidosService_1 = require("../services/pedidosService");
const router = (0, express_1.Router)();
const supabaseClient_1 = require("../lib/supabaseClient");
/* ----------------------- UTILS ----------------------- */
const handleError = (res, error, customMessage) => {
    console.error('❌ Erro:', error);
    const message = error?.message || customMessage;
    return res.status(500).json({ success: false, message });
};
/* ----------------------- CRIAR PEDIDO ----------------------- */
router.post('/dbpedidos', async (req, res) => {
    try {
        const pedidoCriado = await (0, pedidosService_1.createPedidoComNumero)(req.body);
        return res.status(201).json({
            success: true,
            message: 'Pedido criado com sucesso!',
            data: pedidoCriado,
        });
    }
    catch (error) {
        return handleError(res, error, 'Erro ao criar pedido');
    }
});
/* ----------------------- BUSCAR PEDIDO POR NUMERO_SEQ ----------------------- */
router.get('/dbpedidos/numero/:numero_seq', async (req, res) => {
    try {
        const numeroSeq = Number(req.params.numero_seq);
        if (isNaN(numeroSeq))
            return res.status(400).json({ success: false, message: 'Número do pedido inválido.' });
        const pedido = await (0, pedidosService_1.getPedidoByNumeroSeq)(numeroSeq);
        if (!pedido)
            return res.status(404).json({ success: false, message: 'Pedido não encontrado.' });
        return res.json({ success: true, data: pedido });
    }
    catch (error) {
        return handleError(res, error, 'Erro ao buscar pedido');
    }
});
/* ----------------------- ATUALIZAR PEDIDO ----------------------- */
router.put('/dbpedidos/numero/:numero_seq', async (req, res) => {
    try {
        const numeroSeq = Number(req.params.numero_seq);
        if (isNaN(numeroSeq))
            return res.status(400).json({ success: false, message: 'Número do pedido inválido.' });
        const pedidoAtualizado = await (0, pedidosService_1.updatePedidoByNumeroSeq)(numeroSeq, req.body);
        return res.json({
            success: true,
            message: 'Pedido atualizado com sucesso.',
            data: pedidoAtualizado,
        });
    }
    catch (error) {
        return handleError(res, error, 'Erro ao atualizar pedido');
    }
});
/* ----------------------- DELETAR PEDIDO ----------------------- */
router.delete('/dbpedidos/:id', async (req, res) => {
    try {
        const id = req.params.id?.trim();
        if (!id)
            return res.status(400).json({ success: false, message: 'ID do pedido não informado.' });
        const resultado = await (0, pedidosService_1.deletePedido)(id);
        return res.json({ success: true, message: resultado.message });
    }
    catch (error) {
        return handleError(res, error, 'Erro ao deletar pedido');
    }
});
/* ----------------------- FILTRAR PEDIDOS ----------------------- */
/* ----------------------- FILTRAR PEDIDOS (COM PAGINAÇÃO) ----------------------- */
router.get('/dbpedidos/filtrar', async (req, res) => {
    try {
        const { page: pageStr, limit: limitStr, numero_seq: numeroSeqStr, nome_cliente, status, data_inicio, data_fim, } = req.query;
        const page = parseInt(pageStr) || 1;
        const limit = Math.min(parseInt(limitStr) || 50, 100);
        if (page < 1 || limit < 1) {
            return res.status(400).json({ success: false, message: 'Parâmetros de paginação inválidos.' });
        }
        const pedidos = await (0, pedidosService_1.getPedidosFiltrados)({
            page,
            limit,
            numero_seq: numeroSeqStr ? Number(numeroSeqStr) : undefined,
            nome_cliente: typeof nome_cliente === 'string' ? nome_cliente : undefined,
            status: typeof status === 'string' ? status : undefined,
            data_inicio: typeof data_inicio === 'string' ? data_inicio : undefined,
            data_fim: typeof data_fim === 'string' ? data_fim : undefined,
            formatDates: false,
            useCache: false,
        });
        return res.json({
            success: true,
            data: pedidos,
            pagination: {
                page,
                limit,
                hasMore: pedidos.length === limit,
            },
        });
    }
    catch (error) {
        return handleError(res, error, 'Erro ao filtrar pedidos');
    }
});
exports.default = router;
/* ----------------------- BUSCAR TODOS OS PEDIDOS (COM PAGINAÇÃO) ----------------------- */
router.get('/dbpedidos', async (req, res) => {
    try {
        // Parâmetros de query string: ?page=2&limit=30
        const page = parseInt(req.query.page) || 1;
        const limit = Math.min(parseInt(req.query.limit) || 50, 100); // máx 100 por segurança
        if (page < 1 || limit < 1) {
            return res.status(400).json({ success: false, message: 'Parâmetros de paginação inválidos.' });
        }
        const pedidos = await (0, pedidosService_1.getPedidosResumo)(page, limit, {
            formatDates: false, // formata no frontend, mais rápido aqui
            useCache: false, // cache em memória não ajuda em serverless
        });
        // Opcional: contar total para paginação infinita/frontend saber quantas páginas tem
        const { count, error: countError } = await supabaseClient_1.supabase
            .from('dbpedidos')
            .select('*', { count: 'exact', head: true });
        if (countError) {
            console.warn('Erro ao contar pedidos:', countError);
        }
        return res.json({
            success: true,
            data: pedidos,
            pagination: {
                page,
                limit,
                total: count ?? undefined,
                hasMore: pedidos.length === limit, // simples indicador se tem mais páginas
            },
        });
    }
    catch (error) {
        return handleError(res, error, 'Erro ao obter pedidos');
    }
});
//# sourceMappingURL=pedidos.js.map