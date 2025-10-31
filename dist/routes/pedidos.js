"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
// src/routes/pedidosRoutes.ts
const express_1 = require("express");
const pedidosService_1 = require("../lib/pedidosService");
const router = (0, express_1.Router)();
/* ----------------------- DELETAR PEDIDO ----------------------- */
router.delete('/dbpedidos/:id', async (req, res) => {
    try {
        const id = req.params.id?.trim();
        if (!id)
            return res.status(400).json({ message: 'ID do pedido não informado.' });
        const resultado = await (0, pedidosService_1.deletePedido)(id);
        res.json(resultado);
    }
    catch (error) {
        res.status(500).json({ message: 'Erro ao deletar pedido', error });
    }
});
/* ----------------------- ATUALIZAR PEDIDO ----------------------- */
router.put('/dbpedidos/numero/:numero_seq', async (req, res) => {
    try {
        const numeroSeq = Number(req.params.numero_seq);
        if (isNaN(numeroSeq))
            return res.status(400).json({ message: 'Número do pedido inválido.' });
        const pedidoAtualizado = await (0, pedidosService_1.updatePedidoByNumeroSeq)(numeroSeq, req.body);
        res.json({ message: 'Pedido atualizado com sucesso.', pedido: pedidoAtualizado });
    }
    catch (error) {
        res.status(500).json({ message: error.message || 'Erro ao atualizar pedido', error });
    }
});
/* ----------------------- BUSCAR TODOS OS PEDIDOS ----------------------- */
router.get('/dbpedidos', async (_req, res) => {
    try {
        const pedidos = await (0, pedidosService_1.getPedidos)();
        res.json(pedidos);
    }
    catch (error) {
        res.status(500).json({ message: error.message || 'Erro ao obter pedidos', error });
    }
});
/* ----------------------- BUSCAR PEDIDO POR NUMERO_SEQ ----------------------- */
router.get('/dbpedidos/numero/:numero_seq', async (req, res) => {
    try {
        const numeroSeq = Number(req.params.numero_seq);
        if (isNaN(numeroSeq))
            return res.status(400).json({ message: 'Número do pedido inválido.' });
        const pedido = await (0, pedidosService_1.getPedidoByNumeroSeq)(numeroSeq);
        if (!pedido)
            return res.status(404).json({ message: 'Pedido não encontrado.' });
        res.json(pedido);
    }
    catch (error) {
        res.status(500).json({ message: error.message || 'Erro ao buscar pedido', error });
    }
});
/* ----------------------- CRIAR PEDIDO ----------------------- */
router.post('/dbpedidos', async (req, res) => {
    try {
        const pedidoCriado = await (0, pedidosService_1.createPedidoComNumero)(req.body);
        res.status(201).json(pedidoCriado);
    }
    catch (error) {
        res.status(500).json({ message: error.message || 'Erro ao criar pedido', error });
    }
});
/* ----------------------- FILTRAR PEDIDOS ----------------------- */
router.get('/dbpedidos/filtrar', async (req, res) => {
    try {
        const filtros = req.query;
        const pedidos = await (0, pedidosService_1.getPedidosFiltrados)(filtros);
        res.json(pedidos);
    }
    catch (error) {
        res.status(500).json({ message: error.message || 'Erro ao filtrar pedidos', error });
    }
});
exports.default = router;
//# sourceMappingURL=pedidos.js.map