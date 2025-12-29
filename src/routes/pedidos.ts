import { Router, Request, Response } from 'express';
import {
  getPedidosResumo,
  createPedidoComNumero,
  updatePedidoByNumeroSeq,
  deletePedido,
  getPedidoByNumeroSeq,
  getPedidosFiltrados,
} from '../services/pedidosService';
import {type OrderStatus} from '../types/Orders';
const router = Router();
import { supabase } from '../lib/supabaseClient';
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
/* ----------------------- FILTRAR PEDIDOS (COM PAGINAÇÃO) ----------------------- */
router.get('/dbpedidos/filtrar', async (req: Request, res: Response) => {
  try {
    const {
      page: pageStr,
      limit: limitStr,
      numero_seq: numeroSeqStr,
      nome_cliente,
      status,
      data_inicio,
      data_fim,
    } = req.query;

    const page = parseInt(pageStr as string) || 1;
    const limit = Math.min(parseInt(limitStr as string) || 50, 100);

    if (page < 1 || limit < 1) {
      return res.status(400).json({ success: false, message: 'Parâmetros de paginação inválidos.' });
    }

    const pedidos = await getPedidosFiltrados({
      page,
      limit,
      numero_seq: numeroSeqStr ? Number(numeroSeqStr) : undefined,
      nome_cliente: typeof nome_cliente === 'string' ? nome_cliente : undefined,
      status: typeof status === 'string' ? status as OrderStatus : undefined,
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
  } catch (error: any) {
    return handleError(res, error, 'Erro ao filtrar pedidos');
  }
});
export default router;
/* ----------------------- BUSCAR TODOS OS PEDIDOS (COM PAGINAÇÃO) ----------------------- */
router.get('/dbpedidos', async (req: Request, res: Response) => {
  try {
    // Parâmetros de query string: ?page=2&limit=30
    const page = parseInt(req.query.page as string) || 1;
    const limit = Math.min(parseInt(req.query.limit as string) || 50, 100); // máx 100 por segurança

    if (page < 1 || limit < 1) {
      return res.status(400).json({ success: false, message: 'Parâmetros de paginação inválidos.' });
    }

    const pedidos = await getPedidosResumo(page, limit, {
      formatDates: false, // formata no frontend, mais rápido aqui
      useCache: false,    // cache em memória não ajuda em serverless
    });

    // Opcional: contar total para paginação infinita/frontend saber quantas páginas tem
    const { count, error: countError } = await supabase
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
  } catch (error: any) {
    return handleError(res, error, 'Erro ao obter pedidos');
  }
});