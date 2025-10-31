// src/routes/pedidosRoutes.ts
import { Router, Request, Response } from 'express';
import {
  getPedidos,
  createPedidoComNumero,
  updatePedidoByNumeroSeq,
  deletePedido,
  getPedidoByNumeroSeq,
  getPedidosFiltrados,
  OrderStatus
} from '../lib/pedidosService';

const router = Router();

/* ----------------------- DELETAR PEDIDO ----------------------- */
router.delete('/dbpedidos/:id', async (req: Request, res: Response) => {
  try {
    const id = req.params.id?.trim();
    if (!id) return res.status(400).json({ message: 'ID do pedido não informado.' });

    const resultado = await deletePedido(id);
    res.json(resultado);
  } catch (error: any) {
    res.status(500).json({ message: 'Erro ao deletar pedido', error });
  }
});

/* ----------------------- ATUALIZAR PEDIDO ----------------------- */
router.put('/dbpedidos/numero/:numero_seq', async (req: Request, res: Response) => {
  try {
    const numeroSeq = Number(req.params.numero_seq);
    if (isNaN(numeroSeq)) return res.status(400).json({ message: 'Número do pedido inválido.' });

    const pedidoAtualizado = await updatePedidoByNumeroSeq(numeroSeq, req.body);
    res.json({ message: 'Pedido atualizado com sucesso.', pedido: pedidoAtualizado });
  } catch (error: any) {
    res.status(500).json({ message: error.message || 'Erro ao atualizar pedido', error });
  }
});

/* ----------------------- BUSCAR TODOS OS PEDIDOS ----------------------- */
router.get('/dbpedidos', async (_req: Request, res: Response) => {
  try {
    const pedidos = await getPedidos();
    res.json(pedidos);
  } catch (error: any) {
    res.status(500).json({ message: error.message || 'Erro ao obter pedidos', error });
  }
});

/* ----------------------- BUSCAR PEDIDO POR NUMERO_SEQ ----------------------- */
router.get('/dbpedidos/numero/:numero_seq', async (req: Request, res: Response) => {
  try {
    const numeroSeq = Number(req.params.numero_seq);
    if (isNaN(numeroSeq)) return res.status(400).json({ message: 'Número do pedido inválido.' });

    const pedido = await getPedidoByNumeroSeq(numeroSeq);
    if (!pedido) return res.status(404).json({ message: 'Pedido não encontrado.' });

    res.json(pedido);
  } catch (error: any) {
    res.status(500).json({ message: error.message || 'Erro ao buscar pedido', error });
  }
});

/* ----------------------- CRIAR PEDIDO ----------------------- */
router.post('/dbpedidos', async (req: Request, res: Response) => {
  try {
    const pedidoCriado = await createPedidoComNumero(req.body);
    res.status(201).json(pedidoCriado);
  } catch (error: any) {
    res.status(500).json({ message: error.message || 'Erro ao criar pedido', error });
  }
});

/* ----------------------- FILTRAR PEDIDOS ----------------------- */
router.get('/dbpedidos/filtrar', async (req: Request, res: Response) => {
  try {
    const filtros: any = req.query;
    const pedidos = await getPedidosFiltrados(filtros);
    res.json(pedidos);
  } catch (error: any) {
    res.status(500).json({ message: error.message || 'Erro ao filtrar pedidos', error });
  }
});

export default router;
