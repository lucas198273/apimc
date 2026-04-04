// src/routes/payments.ts
import { Router, Request, Response } from 'express';
import { InfinitePayService } from '../services/infinitepay';
import { logger } from '../utils/logger';
import { limiter } from '../middleware/rate-limit';
import { salvarPedido, getPedidosByEmail } from '../services/orderService'; // ← importações essenciais

const router = Router();
const paymentService = InfinitePayService.getInstance();

// ===========================================
// CREATE PAYMENT
// ===========================================
router.post(
  '/create',
  limiter,
  async (req: Request, res: Response) => {
    const startTime = Date.now();

    try {
      const { items, customer, external_reference, return_url } = req.body;

      if (!items || !Array.isArray(items) || items.length === 0) {
        return res.status(400).json({ success: false, error: 'O carrinho deve conter pelo menos um item' });
      }

      for (const item of items) {
        if (!item?.description?.trim()) {
          return res.status(400).json({ success: false, error: 'Descrição do item é obrigatória' });
        }
        if (item.description.length > 200) {
          return res.status(400).json({ success: false, error: 'Descrição do item muito longa (max 200)' });
        }
        if (!item.quantity || item.quantity < 1 || item.quantity > 999) {
          return res.status(400).json({ success: false, error: 'Quantidade inválida (1-999)' });
        }
        if (!item.unit_price || item.unit_price <= 0) {
          return res.status(400).json({ success: false, error: 'Preço unitário deve ser maior que zero' });
        }
      }

      if (customer?.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(customer.email)) {
        return res.status(400).json({ success: false, error: 'Email do cliente inválido' });
      }
      if (customer?.phone && !/^\+55\d{10,11}$/.test(customer.phone)) {
        return res.status(400).json({ success: false, error: 'Telefone deve estar no formato +55XXXXXXXXXXX' });
      }
      if (external_reference?.length > 100) {
        return res.status(400).json({ success: false, error: 'external_reference muito longo (max 100)' });
      }
      if (return_url && !/^https?:\/\/[^\s]+$/.test(return_url)) {
        return res.status(400).json({ success: false, error: 'URL de retorno inválida' });
      }

      const order_nsu = external_reference || `order-${Date.now()}`;
      const totalCentavos = items.reduce((sum: number, item: any) => {
        return sum + Math.round(Number(item.unit_price) * 100 * Number(item.quantity));
      }, 0);

      if (totalCentavos <= 0) throw new Error('Valor total inválido');

      const result = await paymentService.createPaymentLink({
        amountCentavos: totalCentavos,
        items,
        orderNsu: order_nsu,
        redirectUrl: return_url || process.env.INFINITEPAY_RETURN_URL,
        webhookUrl: process.env.INFINITEPAY_CALLBACK_URL,
        customer: customer ? {
          name: customer.name?.trim(),
          email: customer.email?.trim().toLowerCase(),
        } : undefined,
      });

      const duration = Date.now() - startTime;
      logger.info('Pagamento criado com sucesso', { duration, order_nsu, total_centavos: totalCentavos, link: result.link });

      return res.status(201).json({
        success: true,
        link: result.link,
        slug: result.slug,
        order_nsu,
        total: (totalCentavos / 100).toFixed(2),
        duration_ms: duration,
      });
    } catch (error: any) {
      logger.error('Falha ao criar pagamento', { error: error.message, duration: Date.now() - startTime });
      return res.status(500).json({ success: false, error: error.message || 'Erro ao criar pagamento' });
    }
  }
);

// ===========================================
// WEBHOOK - INFINITEPAY
// ===========================================
router.post('/webhook/infinitepay', async (req: Request, res: Response) => {
  const payload = req.body;

  try {
    logger.info('🔄 Webhook InfinitePay recebido', {
      order_nsu: payload.order_nsu || payload.external_reference,
      status: payload.status,
      amount: payload.amount,
    });

    if (['approved', 'paid', 'success', 'completed'].includes(payload.status?.toLowerCase())) {
      await salvarPedido({
        order_nsu: payload.order_nsu || payload.external_reference,
        slug: payload.slug,
        amount: payload.amount || payload.value,
        status: payload.status,
        payment_method: payload.payment_method,
        customer: payload.customer,
        items: payload.items,
        paid_at: payload.paid_at,
      });
      logger.info('✅ Pedido salvo no Supabase com sucesso');
    }

    return res.status(200).json({ received: true });
  } catch (error: any) {
    logger.error('❌ Erro no webhook', { error: error.message, order_nsu: payload.order_nsu });
    return res.status(200).json({ received: true });
  }
});

// ===========================================
// MEUS PEDIDOS (consulta por email)
// ===========================================
router.get('/meus-pedidos', async (req: Request, res: Response) => {
  const { email } = req.query;

  if (!email || typeof email !== 'string' || !email.includes('@')) {
    return res.status(400).json({ success: false, error: 'Email válido é obrigatório' });
  }

  try {
    const pedidos = await getPedidosByEmail(email.trim().toLowerCase());

    return res.json({
      success: true,
      email: email.trim().toLowerCase(),
      total_pedidos: pedidos.length,
      pedidos: pedidos.map((p: any) => ({
        ...p,
        items: typeof p.items === 'string' ? JSON.parse(p.items) : p.items,
      })),
    });
  } catch (error: any) {
    logger.error('Erro ao buscar pedidos', { error: error.message, email });
    return res.status(500).json({ success: false, error: 'Erro interno ao buscar pedidos' });
  }
});

// ===========================================
// STATUS
// ===========================================
router.get('/status', async (req: Request, res: Response) => {
  const start = Date.now();
  try {
    const isHealthy = await paymentService.checkHealth();
    const latency = Date.now() - start;
    return res.json({ success: true, status: isHealthy ? 'connected' : 'disconnected', latency_ms: latency, timestamp: new Date().toISOString() });
  } catch (error: any) {
    return res.status(503).json({ success: false, status: 'disconnected', error: error.message });
  }
});

export default router;