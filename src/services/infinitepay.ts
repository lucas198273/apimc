// src/services/infinitepay.ts - VERSÃO PARA LINK INTEGRADO (SEM API)
import { env } from '../config/env';
import { logger } from '../utils/logger';

export interface PaymentParams {
  items: Array<{
    description: string;
    quantity: number;
    unit_price: number;
  }>;
  customer?: { name: string; email: string };
  orderNsu?: string;
  redirectUrl?: string;
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

    // 🔥 CONSTRUIR LINK INTEGRADO (URL, não chamada API)
    const itemsParam = params.items.map(item => ({
      name: item.description.substring(0, 100),
      price: Math.round(item.unit_price * 100), // Centavos
      quantity: item.quantity
    }));

    // Gerar order_nsu se não fornecido
    const order_nsu = params.orderNsu || `order-${Date.now()}`;
    
    // URL base do checkout InfinitePay
    let link = `https://checkout.infinitepay.io/${this.handle}?items=${JSON.stringify(itemsParam)}&order_nsu=${order_nsu}`;
    
    // Adicionar redirect_url se fornecido
    if (params.redirectUrl) {
      link += `&redirect_url=${encodeURIComponent(params.redirectUrl)}`;
    }
    
    // Adicionar dados do cliente se fornecidos (opcional, agiliza checkout)
    if (params.customer?.email) {
      link += `&customer_email=${encodeURIComponent(params.customer.email)}`;
    }
    if (params.customer?.name) {
      link += `&customer_name=${encodeURIComponent(params.customer.name)}`;
    }

    console.log('✅ Link de pagamento gerado:', link);
    
    return { link };
  }
}