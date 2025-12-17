"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const pedidosService_1 = require("../services/pedidosService");
const router = (0, express_1.Router)();
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
/* ----------------------- BUSCAR TODOS OS PEDIDOS ----------------------- */
router.get('/dbpedidos', async (_req, res) => {
    try {
        const pedidos = await (0, pedidosService_1.getPedidos)();
        return res.json({
            success: true,
            total: pedidos.length,
            data: pedidos,
        });
    }
    catch (error) {
        return handleError(res, error, 'Erro ao obter pedidos');
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
router.get('/dbpedidos/filtrar', async (req, res) => {
    try {
        const filtros = req.query;
        const pedidos = await (0, pedidosService_1.getPedidosFiltrados)(filtros);
        return res.json({
            success: true,
            total: pedidos.length,
            data: pedidos,
        });
    }
    catch (error) {
        return handleError(res, error, 'Erro ao filtrar pedidos');
    }
});
exports.default = router;
//# sourceMappingURL=pedidos.js.map