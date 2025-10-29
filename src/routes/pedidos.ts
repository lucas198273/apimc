import { Router, Request, Response } from 'express';
import {
  getPedidos,
  createPedidoComNumero,
  updatePedidoByNumeroSeq,
  deletePedido,
  getPedidoByNumeroSeq,
  getPedidosFiltrados
} from '../lib/pedidosService';
export type OrderStatus =
  | 'aguardando confirmação'
  | 'pedido sendo preparado'
  | 'pedido pronto'
  | 'cancelado';

const router = Router();

/* ----------------------- DELETAR PEDIDO ----------------------- */
router.delete('/dbpedidos/:id', async (req: Request, res: Response) => {
  try {
    const id = req.params.id?.trim();
    if (!id) return res.status(400).json({ message: 'ID do pedido não informado.' });

    const resultado = await deletePedido(id);
    res.json(resultado);
  } catch (error) {
    res.status(500).json({ message: 'Erro ao deletar pedido', error });
  }
});

/* ----------------------- ATUALIZAR PEDIDO ----------------------- */
router.put('/dbpedidos/numero/:numero_seq', async (req: Request, res: Response) => {
  try {
    const numeroSeq = Number(req.params.numero_seq);
    if (isNaN(numeroSeq)) return res.status(400).json({ message: 'Número do pedido inválido.' });

    const camposAtualizados = req.body;
    const pedidoAtualizado = await updatePedidoByNumeroSeq(numeroSeq, camposAtualizados);

    if (!pedidoAtualizado) return res.status(404).json({ message: 'Pedido não encontrado.' });

    res.json({ message: 'Pedido atualizado com sucesso.', pedido: pedidoAtualizado });
  } catch (error) {
    res.status(500).json({ message: 'Erro ao atualizar pedido', error });
  }
});

/* ----------------------- BUSCAR PEDIDOS ----------------------- */
router.get('/dbpedidos', async (_req: Request, res: Response) => {
  try {
    const pedidos = await getPedidos();
    res.json(pedidos);
  } catch (error) {
    res.status(500).json({ message: 'Erro ao obter pedidos', error });
  }
});

router.get('/dbpedidos/numero/:numero_seq', async (req: Request, res: Response) => {
  try {
    const numeroSeq = Number(req.params.numero_seq);
    if (isNaN(numeroSeq)) return res.status(400).json({ message: 'Número do pedido inválido.' });

    const pedido = await getPedidoByNumeroSeq(numeroSeq);
    if (!pedido) return res.status(404).json({ message: 'Pedido não encontrado.' });

    res.json(pedido);
  } catch (error) {
    res.status(500).json({ message: 'Erro ao buscar pedido', error });
  }
});

/* ----------------------- CRIAR PEDIDO AUTOMÁTICO ----------------------- */
router.post('/dbpedidos', async (req: Request, res: Response) => {
  try {
    const novoPedido = req.body;

    if (!novoPedido.pedido || !novoPedido.total || !novoPedido.nome_cliente) {
      return res.status(400).json({ message: 'Campos obrigatórios faltando.' });
    }

    const pedidoCriado = await createPedidoComNumero(novoPedido);
    res.status(201).json(pedidoCriado);
  } catch (error) {
    res.status(500).json({ message: 'Erro ao criar pedido automaticamente', error });
  }
});

/* ----------------------- FILTRAR PEDIDOS ----------------------- */
/* ----------------------- FILTRAR PEDIDOS ----------------------- */
router.get('/dbpedidos/filtrar', async (req: Request, res: Response) => {
  try {
    const { numero_seq, nome_cliente, status, data_inicio, data_fim } = req.query;

    const validStatuses: OrderStatus[] = [
      'aguardando confirmação',
      'pedido sendo preparado',
      'pedido pronto',
      'cancelado',
    ];

    const filtros = {
      numero_seq: numero_seq ? Number(numero_seq) : undefined,
      nome_cliente: nome_cliente ? String(nome_cliente) : undefined,
      status:
        status && validStatuses.includes(String(status) as OrderStatus)
          ? (status as OrderStatus)
          : undefined,
      data_inicio: data_inicio ? String(data_inicio) : undefined,
      data_fim: data_fim ? String(data_fim) : undefined,
    };

    const pedidos = await getPedidosFiltrados(filtros);
    res.json(pedidos);
  } catch (error) {
    res.status(500).json({ message: 'Erro ao buscar pedidos filtrados', error });
  }
});


export default router;
