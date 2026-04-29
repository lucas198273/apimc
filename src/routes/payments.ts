import { Router } from 'express';
import { InfinitePayService } from '../services/infinitepay';
import { env } from '../config/env';

const router = Router();
const paymentService = InfinitePayService.getInstance();

router.post('/create', async (req, res) => {
  try {
    const { items, customer, external_reference, return_url } = req.body;

    // Validações mínimas
    if (!items || items.length === 0) {
      return res.status(400).json({ error: 'Carrinho vazio' });
    }

    if (!customer?.name || !customer?.email) {
      return res.status(400).json({ error: 'Nome e email obrigatórios' });
    }

    // Gerar ID do pedido
    const order_nsu = external_reference || `ORDER-${Date.now()}`;

    // Criar pagamento
    const result = await paymentService.createPaymentLink({
      items,
      customer: {
        name: customer.name,
        email: customer.email,
      },
      orderNsu: order_nsu,
      redirectUrl: return_url || env.INFINITE_REDIRECT_URL,
      webhookUrl: env.INFINITE_WEBHOOK_URL,
    });

    // Calcular total
    const total = items.reduce((sum: number, item: any) => 
      sum + (item.unit_price * item.quantity), 0
    );

    res.json({
      success: true,
      payment_link: result.link,
      order_nsu,
      total: total.toFixed(2),
    });

  } catch (error: any) {
    console.error('Erro:', error.message);
    res.status(500).json({ error: error.message });
  }
});

export default router;