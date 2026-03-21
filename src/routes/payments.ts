// src/routes/payments.ts
import { Router, Request, Response } from 'express';
import { body, validationResult } from 'express-validator';
import { InfinitePayService } from '../services/infinitepay';
import { logger } from '../utils/logger';
import { limiter } from '../middleware/rate-limit';

const router = Router();
const paymentService = InfinitePayService.getInstance();

// ===========================================
// VALIDATION
// ===========================================
const validateCreatePayment = [
  body('items')
    .isArray({ min: 1 })
    .withMessage('O carrinho deve conter pelo menos um item'),

  body('items.*.description')
    .trim()
    .isString()
    .isLength({ min: 1, max: 200 }),

  body('items.*.quantity')
    .isInt({ min: 1, max: 999 }),

  body('items.*.unit_price')
    .isFloat({ gt: 0 }),

  body('customer').optional().isObject(),

  body('customer.name').optional().isString().notEmpty(),

  body('customer.email').optional().isEmail(),

  body('customer.phone')
    .optional()
    .matches(/^\+55\d{10,11}$/),

  body('external_reference')
    .optional()
    .isString()
    .isLength({ max: 100 }),

  body('return_url')
    .optional()
    .isURL(),
];

// ===========================================
// CREATE PAYMENT
// ===========================================
router.post(
  '/create',
  limiter,
  validateCreatePayment,
  async (req: Request, res: Response) => {
    const startTime = Date.now();
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        error: 'Dados inválidos',
        details: errors.array(),
      });
    }

    try {
      const {
        items,
        customer,
        external_reference,
        return_url,
      } = req.body;

      const order_nsu =
        external_reference || `order-${Date.now()}`;

      // ===========================================
      // CALCULA TOTAL (CENTAVOS)
      // ===========================================
      const totalCentavos = items.reduce(
        (sum: number, item: any) => {
          const price = Number(item.unit_price);
          const qty = Number(item.quantity);
          return sum + Math.round(price * 100 * qty);
        },
        0
      );

      if (totalCentavos <= 0) {
        throw new Error('Valor total inválido');
      }

      // ===========================================
      // CALL SERVICE (FORMATO CORRETO)
      // ===========================================
      const result = await paymentService.createPaymentLink({
        amountCentavos: totalCentavos,

        description: items
          .map((item: any) => item.description)
          .join(', ')
          .slice(0, 200),

        orderNsu: order_nsu,

        redirectUrl:
          return_url || process.env.INFINITEPAY_RETURN_URL,

        webhookUrl:
          process.env.INFINITEPAY_CALLBACK_URL,

        customer: customer
          ? {
              name: customer.name?.trim(),
              email: customer.email?.trim().toLowerCase(),
            }
          : undefined,
      });

      const duration = Date.now() - startTime;

      logger.info(
        {
          duration,
          order_nsu,
          total_centavos: totalCentavos,
          link: result.link,
        },
        'Pagamento criado com sucesso'
      );

      return res.status(201).json({
        success: true,
        link: result.link,
        slug: result.slug,
        order_nsu,
        total: (totalCentavos / 100).toFixed(2),
        duration_ms: duration,
      });

    } catch (error: any) {
      const duration = Date.now() - startTime;

      logger.error(
        {
          error: error.message,
          duration,
          stack: error.stack,
        },
        'Falha ao criar pagamento'
      );

      return res.status(500).json({
        success: false,
        error: error.message || 'Erro ao criar pagamento',
      });
    }
  }
);

// ===========================================
// STATUS
// ===========================================
router.get('/status', async (req: Request, res: Response) => {
  try {
    const start = Date.now();
    const isHealthy = await paymentService.checkHealth();
    const latency = Date.now() - start;

    return res.json({
      success: true,
      status: isHealthy ? 'connected' : 'disconnected',
      latency_ms: latency,
      timestamp: new Date().toISOString(),
    });
  } catch (error: any) {
    return res.status(503).json({
      success: false,
      status: 'disconnected',
      error: error.message,
    });
  }
});

export default router;