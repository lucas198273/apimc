import dotenv from 'dotenv';
import { infiniteAxios } from '../lib/infiniteAxios';  // Usa a instância otimizada
import pino from 'pino';

dotenv.config();

const logger = pino({ level: process.env.NODE_ENV === 'production' ? 'info' : 'debug' });

const CHECKOUT_PATH = '/invoices/public/checkout/links';

// Cache env (já bom)
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
    logger.debug({ payload }, '[InfinitePay payload]');
  }

  const start = Date.now();  // Novo: medir tempo da API call
  try {
    const response = await infiniteAxios.post(CHECKOUT_PATH, payload);
    const duration = Date.now() - start;
    logger.info({ duration, status: response.status }, 'InfinitePay response ok');

    const data = response.data;
    const link = data.link || data.url || data.checkout_url || data.payment_url || data.invoice_url;

    if (!link) {
      throw new Error('InfinitePay não retornou link');
    }

    return {
      link,
      slug: data.slug || data.invoice_slug || null,
    };
  } catch (error: any) {
    const duration = Date.now() - start;
    logger.error({ error: error.message, duration }, 'InfinitePay falha');

    if (error.response) {
      throw new Error(`InfinitePay HTTP ${error.response.status}: ${error.response.data?.message || 'Sem detalhes'}`);
    }
    throw new Error(`InfinitePay request fail: ${error.message || 'Desconhecido'}`);
  }
}