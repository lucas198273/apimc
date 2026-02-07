import dotenv from 'dotenv';
import { infiniteAxios } from '../lib/infiniteAxios';

dotenv.config();

const CHECKOUT_PATH = '/invoices/public/checkout/links';

// 🔥 CACHE ENV (não lê toda request)
const HANDLE = process.env.INFINITEPAY_HANDLE?.trim();
const REDIRECT_URL = process.env.INFINITE_REDIRECT_URL?.trim();
const WEBHOOK_URL = process.env.INFINITE_WEBHOOK_URL?.trim();
const NODE_ENV = process.env.NODE_ENV;

if (!HANDLE) {
  throw new Error('INFINITEPAY_HANDLE não configurado');
}

export interface Customer {
  name: string;
  email: string;
}

export async function criarLinkPagamentoInfinitePay(params: {
  amountCentavos: number;
  description?: string;
  customer?: Customer | null;
  orderNsu?: string;
  redirectUrl?: string;
  webhookUrl?: string;
}) {

  if (params.amountCentavos <= 0) {
    throw new Error('amountCentavos inválido');
  }

  const payload: any = {
    handle: HANDLE,
    items: [
      {
        quantity: 1,
        price: params.amountCentavos / 100,
        description: params.description?.trim() || 'Pagamento',
      },
    ],
  };

  if (params.customer) {
    payload.customer = params.customer;
  }

  if (params.orderNsu) payload.order_nsu = params.orderNsu;

  payload.redirect_url = params.redirectUrl || REDIRECT_URL;
  payload.webhook_url = params.webhookUrl || WEBHOOK_URL;

  if (NODE_ENV !== 'production') {
    console.log('[InfinitePay payload]', payload);
  }

  try {
    const response = await infiniteAxios.post(CHECKOUT_PATH, payload);
    const data = response.data;

    const link =
      data.link ||
      data.url ||
      data.checkout_url ||
      data.payment_url ||
      data.invoice_url;

    if (!link) {
      throw new Error('InfinitePay não retornou link');
    }

    return {
      link,
      slug: data.slug || data.invoice_slug || null,
    };

  } catch (error: any) {

    if (error.response) {
      throw new Error(
        `InfinitePay HTTP ${error.response.status}`
      );
    }

    throw new Error(`InfinitePay request fail: ${error.message}`);
  }
}
