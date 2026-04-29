import { env } from '../config/env';

export interface PaymentParams {
  items: Array<{
    description: string;
    quantity: number;
    unit_price: number;
  }>;
  customer?: { name: string; email: string };
  orderNsu?: string;
  redirectUrl?: string;
  webhookUrl?: string;
}

export interface PaymentResult {
  link: string;
}

export class InfinitePayService {
  private static instance: InfinitePayService;
  private handle: string;

  private constructor() {
    this.handle = env.INFINITEPAY_HANDLE;
  }

  static getInstance(): InfinitePayService {
    if (!InfinitePayService.instance) {
      InfinitePayService.instance = new InfinitePayService();
    }
    return InfinitePayService.instance;
  }

  async createPaymentLink(params: PaymentParams): Promise<PaymentResult> {
    if (!params.items || params.items.length === 0) {
      throw new Error('Nenhum item informado');
    }

    // 🔥 Payload conforme documentação
    const payload: any = {
      handle: this.handle,
      items: params.items.map(item => ({
        quantity: item.quantity,
        price: Math.round(item.unit_price * 100),
        description: item.description.substring(0, 200),
      }))
    };

    if (params.orderNsu) {
      payload.order_nsu = params.orderNsu;
    }

    if (params.redirectUrl) {
      payload.redirect_url = params.redirectUrl;
    }

    if (params.webhookUrl) {
      payload.webhook_url = params.webhookUrl;
    }

    if (params.customer) {
      payload.customer = params.customer;
    }

    console.log('📤 Payload:', JSON.stringify(payload, null, 2));

    try {
      const response = await fetch('https://api.checkout.infinitepay.io/links', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      const data = await response.json();
      console.log('📥 Resposta COMPLETA:', JSON.stringify(data, null, 2));

      if (!response.ok) {
        throw new Error(data.message || `HTTP ${response.status}`);
      }

      // 🔥 Verificar todos os possíveis campos que podem conter o link
      const link = data.link || data.checkout_url || data.url || data.payment_url;
      
      if (!link) {
        console.error('Resposta sem link. Dados recebidos:', data);
        throw new Error('API não retornou link de pagamento');
      }

      console.log('✅ Link:', link);
      return { link };

    } catch (error: any) {
      console.error('❌ Erro:', error.message);
      throw new Error(`Erro ao criar pagamento: ${error.message}`);
    }
  }
}