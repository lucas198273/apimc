import { Router, Request, Response } from 'express';
import { criarLinkPagamentoInfinitePay, Customer } from '../services/infinitepay';
import pino from 'pino';  // Novo: logger estruturado

const logger = pino({ level: process.env.NODE_ENV === 'production' ? 'info' : 'debug' });

const router = Router();

router.post('/create', async (req: Request, res: Response) => {
  const startTime = Date.now();  // Novo: medir tempo total
  const body = req.body;

  if (!body) {
    return res.status(400).json({ error: 'Body ausente' });
  }

  // Validação otimizada: use Number.parseFloat para precisão
  const amountNumber = Number.parseFloat(body.amount);
  if (isNaN(amountNumber) || amountNumber <= 0) {
    return res.status(400).json({ error: 'amount inválido' });
  }
  const amountCentavos = Math.round(amountNumber * 100);  // Ok, mas considere BigInt para valores grandes: BigInt(Math.round(...))

  // Customer com validação extra
  let customer: Customer | undefined;
  if (body.customer) {
    const name = body.customer.name?.trim();
    const email = body.customer.email?.trim().toLowerCase();

    if (!name || !email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {  // Novo: regex simples para email válido
      return res.status(400).json({ error: 'customer.name e customer.email válidos obrigatórios' });
    }

    customer = { name, email };
  }

  try {
    const result = await criarLinkPagamentoInfinitePay({
      amountCentavos,
      description: body.description?.trim().slice(0, 200),  // Novo: limita description para evitar rejeições na API
      customer,
      orderNsu: body.order_nsu,
    });

    const duration = Date.now() - startTime;
    logger.info({ duration, order_nsu: body.order_nsu }, 'Pagamento criado com sucesso');

    return res.status(201).json({
      type: 'infinitepay_checkout',
      link: result.link,
      slug: result.slug,
      order_nsu: body.order_nsu,
    });
  } catch (error: any) {
    const duration = Date.now() - startTime;
    logger.error({ error: error.message, stack: error.stack, duration, order_nsu: body.order_nsu }, 'Falha ao criar pagamento');

    if (error.response) {
      return res.status(502).json({ error: `Falha InfinitePay: HTTP ${error.response.status} - ${error.response.data?.message || 'Detalhes indisponíveis'}` });
    }
    return res.status(502).json({ error: `Falha ao criar pagamento: ${error.message}` });
  }
});

export default router;