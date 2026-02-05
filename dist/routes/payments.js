"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const infinitepay_1 = require("../services/infinitepay");
const router = (0, express_1.Router)();
router.post('/create', async (req, res) => {
    const data = req.body;
    if (!data || typeof data !== 'object') {
        return res.status(400).json({ error: 'JSON inválido ou ausente' });
    }
    if (!data.amount) {
        return res.status(400).json({ error: 'amount é obrigatório' });
    }
    let amountCentavos;
    try {
        amountCentavos = Math.round(parseFloat(data.amount) * 100);
        if (amountCentavos <= 0)
            throw new Error();
    }
    catch {
        return res.status(400).json({ error: 'amount inválido' });
    }
    let customer = null;
    const payer = data.payer;
    if (payer && payer.email) {
        customer = {
            name: `${payer.first_name || ''} ${payer.last_name || ''}`.trim() || 'Cliente',
            email: payer.email,
        };
    }
    try {
        const result = await (0, infinitepay_1.criarLinkPagamentoInfinitePay)({
            amountCentavos,
            description: data.description || 'Pagamento',
            customer,
            orderNsu: data.order_nsu,
            // Não passa redirectUrl / webhookUrl aqui → o service pega do .env
            // Se quiser override por request, pode passar: redirectUrl: data.redirect_url
        });
        return res.status(201).json({
            type: 'infinitepay_checkout',
            link: result.link,
            slug: result.slug,
            order_nsu: data.order_nsu,
        });
    }
    catch (error) {
        console.error('Erro InfinitePay:', error.message);
        return res.status(502).json({
            error: 'Falha na InfinitePay',
            details: error.message,
        });
    }
});
exports.default = router;
//# sourceMappingURL=payments.js.map