import { Router, Request, Response } from 'express';
import {
  getPedidos,
  createPedidoComNumero,
  updatePedidoByNumeroSeq,
  deletePedido,
  getPedidoByNumeroSeq,
  getPedidosFiltrados,
} from '../lib/pedidosService';

const router = Router();

/* ----------------------- UTILS ----------------------- */
const handleError = (res: Response, error: any, customMessage: string) => {
  console.error('❌ Erro:', error);
  const message = error?.message || customMessage;
  return res.status(500).json({ success: false, message });
};

/* ----------------------- CRIAR PEDIDO ----------------------- */
router.post('/dbpedidos', async (req: Request, res: Response) => {
  try {
    const pedidoCriado = await createPedidoComNumero(req.body);
    return res.status(201).json({
      success: true,
      message: 'Pedido criado com sucesso!',
      data: pedidoCriado,
    });
  } catch (error: any) {
    return handleError(res, error, 'Erro ao criar pedido');
  }
});

/* ----------------------- BUSCAR TODOS OS PEDIDOS ----------------------- */
router.get('/dbpedidos', async (_req: Request, res: Response) => {
  try {
    const pedidos = await getPedidos();
    return res.json({
      success: true,
      total: pedidos.length,
      data: pedidos,
    });
  } catch (error: any) {
    return handleError(res, error, 'Erro ao obter pedidos');
  }
});

/* ----------------------- BUSCAR PEDIDO POR NUMERO_SEQ ----------------------- */
router.get('/dbpedidos/numero/:numero_seq', async (req: Request, res: Response) => {
  try {
    const numeroSeq = Number(req.params.numero_seq);
    if (isNaN(numeroSeq))
      return res.status(400).json({ success: false, message: 'Número do pedido inválido.' });

    const pedido = await getPedidoByNumeroSeq(numeroSeq);
    if (!pedido)
      return res.status(404).json({ success: false, message: 'Pedido não encontrado.' });

    return res.json({ success: true, data: pedido });
  } catch (error: any) {
    return handleError(res, error, 'Erro ao buscar pedido');
  }
});

/* ----------------------- ATUALIZAR PEDIDO ----------------------- */
router.put('/dbpedidos/numero/:numero_seq', async (req: Request, res: Response) => {
  try {
    const numeroSeq = Number(req.params.numero_seq);
    if (isNaN(numeroSeq))
      return res.status(400).json({ success: false, message: 'Número do pedido inválido.' });

    const pedidoAtualizado = await updatePedidoByNumeroSeq(numeroSeq, req.body);
    return res.json({
      success: true,
      message: 'Pedido atualizado com sucesso.',
      data: pedidoAtualizado,
    });
  } catch (error: any) {
    return handleError(res, error, 'Erro ao atualizar pedido');
  }
});

/* ----------------------- DELETAR PEDIDO ----------------------- */
router.delete('/dbpedidos/:id', async (req: Request, res: Response) => {
  try {
    const id = req.params.id?.trim();
    if (!id)
      return res.status(400).json({ success: false, message: 'ID do pedido não informado.' });

    const resultado = await deletePedido(id);
    return res.json({ success: true, message: resultado.message });
  } catch (error: any) {
    return handleError(res, error, 'Erro ao deletar pedido');
  }
});

/* ----------------------- FILTRAR PEDIDOS ----------------------- */
router.get('/dbpedidos/filtrar', async (req: Request, res: Response) => {
  try {
    const filtros = req.query;
    const pedidos = await getPedidosFiltrados(filtros);
    return res.json({
      success: true,
      total: pedidos.length,
      data: pedidos,
    });
  } catch (error: any) {
    return handleError(res, error, 'Erro ao filtrar pedidos');
  }
});

export default router;
