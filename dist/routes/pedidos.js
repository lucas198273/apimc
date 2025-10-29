"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
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
        const camposAtualizados = req.body;
        const pedidoAtualizado = await (0, pedidosService_1.updatePedidoByNumeroSeq)(numeroSeq, camposAtualizados);
        if (!pedidoAtualizado)
            return res.status(404).json({ message: 'Pedido não encontrado.' });
        res.json({ message: 'Pedido atualizado com sucesso.', pedido: pedidoAtualizado });
    }
    catch (error) {
        res.status(500).json({ message: 'Erro ao atualizar pedido', error });
    }
});
/* ----------------------- BUSCAR PEDIDOS ----------------------- */
router.get('/dbpedidos', async (_req, res) => {
    try {
        const pedidos = await (0, pedidosService_1.getPedidos)();
        res.json(pedidos);
    }
    catch (error) {
        res.status(500).json({ message: 'Erro ao obter pedidos', error });
    }
});
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
        res.status(500).json({ message: 'Erro ao buscar pedido', error });
    }
});
/* ----------------------- CRIAR PEDIDO AUTOMÁTICO ----------------------- */
router.post('/dbpedidos', async (req, res) => {
    try {
        const novoPedido = req.body;
        if (!novoPedido.pedido || !novoPedido.total || !novoPedido.nome_cliente) {
            return res.status(400).json({ message: 'Campos obrigatórios faltando.' });
        }
        const pedidoCriado = await (0, pedidosService_1.createPedidoComNumero)(novoPedido);
        res.status(201).json(pedidoCriado);
    }
    catch (error) {
        res.status(500).json({ message: 'Erro ao criar pedido automaticamente', error });
    }
});
/* ----------------------- FILTRAR PEDIDOS ----------------------- */
router.get('/dbpedidos/filtrar', async (req, res) => {
    try {
        const { numero_seq, nome_cliente, status } = req.query;
        // Valida status para ser um OrderStatus válido
        const validStatuses = [
            'aguardando confirmação',
            'pedido sendo preparado',
            'pedido pronto',
            'cancelado',
        ];
        const filtros = {
            numero_seq: numero_seq ? Number(numero_seq) : undefined,
            nome_cliente: nome_cliente ? String(nome_cliente) : undefined,
            status: status && validStatuses.includes(String(status))
                ? status
                : undefined,
        };
        const pedidos = await (0, pedidosService_1.getPedidosFiltrados)(filtros);
        res.json(pedidos);
    }
    catch (error) {
        res.status(500).json({ message: 'Erro ao buscar pedidos filtrados', error });
    }
});
exports.default = router;
//# sourceMappingURL=pedidos.js.map