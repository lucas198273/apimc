import { Router, Request, Response } from 'express';
import { criarLinkPagamentoInfinitePay, Customer } from '../services/infinitepay';

const router = Router();

router.post('/create', async (req: Request, res: Response) => {
  const data = req.body;

  // ===============================
  // 1️⃣ Validação básica do payload
  // ===============================
  if (!data || typeof data !== 'object') {
    return res.status(400).json({ error: 'JSON inválido ou ausente' });
  }

  if (!data.amount) {
    return res.status(400).json({ error: 'amount é obrigatório' });
  }

  // ===============================
  // 2️⃣ Converter amount → centavos
  // ===============================
  let amountCentavos: number;
  try {
    amountCentavos = Math.round(Number(data.amount) * 100);
    if (!Number.isFinite(amountCentavos) || amountCentavos <= 0) {
      throw new Error();
    }
  } catch {
    return res.status(400).json({ error: 'amount inválido' });
  }

  // ===============================
  // 3️⃣ Customer (name + email)
  // ===============================
  let customer: Customer | null = null;

  if (data.customer) {
    const { name, email } = data.customer;

    if (!name || !email) {
      return res.status(400).json({
        error: 'customer.name e customer.email são obrigatórios',
      });
    }

    customer = {
      name: String(name).trim(),
      email: String(email).trim().toLowerCase(),
    };
  }

  // ===============================
  // 4️⃣ Criar link InfinitePay
  // ===============================
  try {
    const result = await criarLinkPagamentoInfinitePay({
      amountCentavos,
      description: data.description || 'Pagamento',
      customer,
      orderNsu: data.order_nsu,
      // redirectUrl e webhookUrl vêm do .env
    });

    return res.status(201).json({
      type: 'infinitepay_checkout',
      link: result.link,
      slug: result.slug,
      order_nsu: data.order_nsu,
    });
  } catch (error: any) {
    console.error('❌ Erro InfinitePay:', error.message);

    return res.status(502).json({
      error: 'Falha ao criar pagamento na InfinitePay',
      details: error.message,
    });
  }
});

export default router;
