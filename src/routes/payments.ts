// src/routes/payments.ts - VERSÃO MÍNIMA E SEGURA
import { Router } from 'express';
import { InfinitePayService } from '../services/infinitepay';
import { logger } from '../utils/logger';
import { salvarPedido } from '../services/orderService';

const router = Router();
const paymentService = InfinitePayService.getInstance();

// ====================== CRIAÇÃO SIMPLES ======================
router.post('/create', async (req, res) => {
  const startTime = Date.now();
  
  try {
    const { items, customer, external_reference, return_url } = req.body;

    // VALIDAÇÕES MÍNIMAS
    if (!items?.length) {
      return res.status(400).json({ error: 'Carrinho vazio' });
    }

    if (!customer?.email || !customer?.name) {
      return res.status(400).json({ error: 'Nome e email do cliente são obrigatórios' });
    }

    // Validação simples de email
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(customer.email)) {
      return res.status(400).json({ error: 'Email inválido' });
    }

    // Gerar ID do pedido
    const order_nsu = external_reference || `order-${Date.now()}`;

    // Criar pagamento
    const result = await paymentService.createPaymentLink({
      items,
      customer: {
        name: customer.name.trim(),
        email: customer.email.trim().toLowerCase(),
      },
      orderNsu: order_nsu,
      redirectUrl: return_url,
    });

    const total = items.reduce((sum: number, item: any) => 
      sum + (item.unit_price * item.quantity), 0
    );

    logger.info('✅ Pagamento criado', { 
      order_nsu, 
      total, 
      duration: Date.now() - startTime 
    });

    res.json({
      success: true,
      payment_link: result.link,
      order_nsu,
      total: total.toFixed(2),
    });

  } catch (error: any) {
    logger.error('❌ Erro:', error.message);
    res.status(500).json({ 
      error: 'Erro ao criar pagamento. Tente novamente.' 
    });
  }
});

// ====================== WEBHOOK ======================
router.post('/webhook', async (req, res) => {
  try {
    const payload = req.body;
    
    console.log('📥 Webhook recebido:', payload.status, payload.external_reference);

    if (payload.status === 'approved' || payload.status === 'paid') {
      await salvarPedido({
        order_nsu: payload.external_reference,
        amount: payload.amount,
        status: 'paid',
        customer: payload.customer,
        items: payload.items,
        paid_at: new Date().toISOString(),
      });
      
      console.log('✅ Pedido salvo:', payload.external_reference);
    }

    res.json({ received: true });
  } catch (error) {
    console.error('❌ Webhook error:', error);
    res.json({ received: true });
  }
});
// src/routes/payments.ts - Adicione esta rota ANTES do /create

// ====================== DIAGNÓSTICO ======================
router.get('/diagnostico', (req, res) => {
  res.json({
    status: 'online',
    env: process.env.NODE_ENV,
    config: {
      handle_exists: !!process.env.INFINITEPAY_HANDLE,
      api_key_exists: !!process.env.INFINITEPAY_API_KEY,
      handle: process.env.INFINITEPAY_HANDLE,
      redirect_url: process.env.INFINITE_REDIRECT_URL,
      webhook_url: process.env.INFINITE_WEBHOOK_URL,
    },
    endpoints: {
      health: 'GET /health',
      create: 'POST /api/payments/create',
      webhook: 'POST /api/payments/webhook',
      orders: 'GET /api/payments/orders/:email',
      diagnostico: 'GET /api/payments/diagnostico',
    }
  });
});
// ====================== CONSULTAR PEDIDOS ======================
router.get('/orders/:email', async (req, res) => {
  try {
    const { email } = req.params;
    
    if (!email || !email.includes('@')) {
      return res.status(400).json({ error: 'Email inválido' });
    }

    const { getPedidosByEmail } = await import('../services/orderService');
    const pedidos = await getPedidosByEmail(email);
    
    res.json({ 
      success: true, 
      email, 
      total: pedidos.length, 
      pedidos 
    });
  } catch (error) {
    res.status(500).json({ error: 'Erro ao buscar pedidos' });
  }
});

export default router;