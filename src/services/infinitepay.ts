import axios from 'axios';
import dotenv from 'dotenv';

dotenv.config();

const INFINITE_API_URL = 'https://api.infinitepay.io/invoices/public/checkout/links';

export interface Customer {
  name: string;
  email: string;
}

export async function criarLinkPagamentoInfinitePay(params: {
  amountCentavos: number;
  description?: string;
  customer?: Customer | null;
  orderNsu?: string;
  // redirectUrl e webhookUrl agora são opcionais no params, mas priorizamos .env
  redirectUrl?: string;
  webhookUrl?: string;
}) {
  const handle = process.env.INFINITEPAY_HANDLE?.trim();
  if (!handle) {
    throw new Error('INFINITEPAY_HANDLE não configurado no ambiente. Verifique o .env');
  }

  if (!params.amountCentavos || params.amountCentavos <= 0) {
    throw new Error('amountCentavos deve ser um inteiro positivo');
  }

  // Prioriza o que vem do .env (configuração global), mas aceita override via params se quiser
  const redirectUrl = process.env.INFINITE_REDIRECT_URL?.trim() || params.redirectUrl?.trim();
  const webhookUrl = process.env.INFINITE_WEBHOOK_URL?.trim() || params.webhookUrl?.trim();

  const payload: any = {
    handle,
    items: [
      {
        quantity: 1,
        price: params.amountCentavos / 100,
        description: (params.description || 'Pagamento').trim(),
      },
    ],
  };

  // Customer (opcional)
  if (params.customer?.name && params.customer?.email) {
    payload.customer = {
      name: params.customer.name.trim(),
      email: params.customer.email.trim().toLowerCase(),
    };
  }

  // Campos opcionais
  if (params.orderNsu) payload.order_nsu = String(params.orderNsu);
  if (redirectUrl) payload.redirect_url = redirectUrl;
  if (webhookUrl) payload.webhook_url = webhookUrl;

  console.log('[InfinitePay] Enviando payload:', JSON.stringify(payload, null, 2));

  try {
    const response = await axios.post(INFINITE_API_URL, payload, {
      headers: { 'Content-Type': 'application/json' },
      timeout: 30000,
    });

    const data = response.data;

    const possibleKeys = ['link', 'url', 'checkout_url', 'payment_url', 'invoice_url'];
    let link = null;
    for (const key of possibleKeys) {
      if (data[key] && typeof data[key] === 'string' && data[key].startsWith('http')) {
        link = data[key];
        break;
      }
    }

    if (!link) {
      throw new Error(`Nenhuma URL de checkout retornada: ${JSON.stringify(data)}`);
    }

    const slug = data.slug || data.invoice_slug;

    console.log(`[InfinitePay] Checkout criado: ${link} (slug: ${slug})`);

    return { link, slug };
  } catch (error: any) {
    if (error.response) {
      console.error('[InfinitePay] Erro HTTP:', error.response.status, error.response.data);
      throw new Error(`InfinitePay HTTP ${error.response.status}: ${JSON.stringify(error.response.data)}`);
    }
    console.error('[InfinitePay] Erro de requisição:', error.message);
    throw new Error(`Erro ao comunicar com InfinitePay: ${error.message}`);
  }
}