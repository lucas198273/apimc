import { Router, Request, Response } from 'express';
import { criarLinkPagamentoInfinitePay, Customer } from '../services/infinitepay';

const router = Router();

router.post('/create', async (req: Request, res: Response) => {

  const body = req.body;
  if (!body) {
    return res.status(400).json({ error: 'Body ausente' });
  }

  // amount parse ultra rápido
  const amountNumber = Number(body.amount);
  if (!amountNumber || amountNumber <= 0) {
    return res.status(400).json({ error: 'amount inválido' });
  }

  const amountCentavos = Math.round(amountNumber * 100);

  // customer
  let customer: Customer | undefined;

  if (body.customer) {

    const name = body.customer.name?.trim();
    const email = body.customer.email?.trim().toLowerCase();

    if (!name || !email) {
      return res.status(400).json({
        error: 'customer.name e customer.email obrigatórios',
      });
    }

    customer = { name, email };
  }

  try {

    const result = await criarLinkPagamentoInfinitePay({
      amountCentavos,
      description: body.description,
      customer,
      orderNsu: body.order_nsu,
    });

    return res.status(201).json({
      type: 'infinitepay_checkout',
      link: result.link,
      slug: result.slug,
      order_nsu: body.order_nsu,
    });

  } catch (error: any) {

    console.error('InfinitePay error:', error.message);

    return res.status(502).json({
      error: 'Falha ao criar pagamento',
    });
  }
});

export default router;
