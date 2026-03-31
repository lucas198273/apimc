// src/services/infinitepay.ts
import { infiniteAxios } from '../lib/axios-client';
import { paymentCache } from '../lib/cache';
import { logger } from '../utils/logger';
import { env } from '../config/env';
import { INFINITEPAY_API } from '../config/constantes';

export interface Customer {
  name: string;
  email: string;
}

export interface PaymentParams {
  amountCentavos: number;
  description?: string;
  customer?: Customer | null;
  orderNsu?: string;
  redirectUrl?: string;
  webhookUrl?: string;
}

export interface PaymentResult {
  link: string;
  slug: string | null;
}

export class InfinitePayService {
  private static instance: InfinitePayService;
  private handle: string;
  private redirectUrl?: string;
  private webhookUrl?: string;

  private constructor() {
    this.handle = env.INFINITEPAY_HANDLE;
    this.redirectUrl = env.INFINITE_REDIRECT_URL;
    this.webhookUrl = env.INFINITE_WEBHOOK_URL;
  }

  static getInstance(): InfinitePayService {
    if (!InfinitePayService.instance) {
      InfinitePayService.instance = new InfinitePayService();
    }
    return InfinitePayService.instance;
  }

  async createPaymentLink(params: PaymentParams): Promise<PaymentResult> {
    this.validateParams(params);

    // Usa cache se tiver orderNsu
    if (params.orderNsu) {
      return paymentCache.getOrSet(
        `order_${params.orderNsu}`,
        () => this.executePaymentRequest(params),
        { skipCache: params.orderNsu.includes('no-cache') }
      );
    }

    return this.executePaymentRequest(params);
  }

  private validateParams(params: PaymentParams): void {
    if (params.amountCentavos <= 0) {
      throw new Error('amountCentavos deve ser maior que zero');
    }

    if (params.customer && !this.isValidEmail(params.customer.email)) {
      throw new Error('Email do cliente inválido');
    }
  }

  private isValidEmail(email: string): boolean {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  }
private async executePaymentRequest(params: PaymentParams): Promise<PaymentResult> {
    const payload = this.buildPayload(params);
    
    logger.debug('Enviando requisição para InfinitePay', { orderNsu: params.orderNsu });

    try {
      const response = await infiniteAxios.post(INFINITEPAY_API.CHECKOUT_PATH, payload);
      const result = this.extractPaymentResult(response.data);

      logger.info('Pagamento criado com sucesso', {
        orderNsu: params.orderNsu,
        status: response.status,
      });

      return result;
    } catch (error) {
      logger.error('Falha ao criar pagamento', { 
        error: error instanceof Error ? error.message : 'Erro desconhecido',
        orderNsu: params.orderNsu 
      });
      
      throw this.normalizeError(error);
    }
  }

  private buildPayload(params: PaymentParams): any {
    const payload: any = {
      handle: this.handle,
      items: [{
        quantity: 1,
        price: params.amountCentavos / 100,
        description: params.description?.trim().slice(0, 200) || 'Pagamento',
      }],
      redirect_url: params.redirectUrl || this.redirectUrl,
      webhook_url: params.webhookUrl || this.webhookUrl,
    };

    if (params.customer) {
      payload.customer = params.customer;
    }

    if (params.orderNsu) {
      payload.order_nsu = params.orderNsu;
    }

    return payload;
  }

  private extractPaymentResult(data: any): PaymentResult {
    const link = data.link || data.url || data.checkout_url || data.payment_url || data.invoice_url;
    
    if (!link) {
      throw new Error('InfinitePay não retornou link de pagamento');
    }

    return {
      link,
      slug: data.slug || data.invoice_slug || null,
    };
  }

  private normalizeError(error: unknown): Error {
    if (error instanceof Error) return error;
    
    if (error && typeof error === 'object' && 'response' in error) {
      const axiosError = error as any;
      if (axiosError.response?.data?.message) {
        return new Error(`InfinitePay: ${axiosError.response.data.message}`);
      }
      if (axiosError.response?.status) {
        return new Error(`InfinitePay HTTP ${axiosError.response.status}`);
      }
    }
    
    return new Error('Erro desconhecido na comunicação com InfinitePay');
  }

  async checkHealth(): Promise<boolean> {
    try {
      await infiniteAxios.get('/status', { timeout: 3000 });
      return true;
    } catch {
      return false;
    }
  }
}