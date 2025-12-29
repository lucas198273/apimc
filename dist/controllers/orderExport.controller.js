"use strict";
// src/controllers/orderPdf.controller.ts (ou onde estiver)
Object.defineProperty(exports, "__esModule", { value: true });
exports.exportOrdersPdf = exportOrdersPdf;
const orderPdf_service_1 = require("../services/orderPdf.service");
async function exportOrdersPdf(req, res) {
    try {
        const data_inicio = typeof req.query.data_inicio === 'string'
            ? req.query.data_inicio
            : undefined;
        const data_fim = typeof req.query.data_fim === 'string'
            ? req.query.data_fim
            : undefined;
        const pdfBuffer = await orderPdf_service_1.OrderPdfService.generate({
            data_inicio,
            data_fim,
        });
        const dataAtual = new Date().toISOString().slice(0, 10);
        const filename = `pedidos_${dataAtual}.pdf`;
        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
        res.send(pdfBuffer);
    }
    catch (error) {
        console.error('Erro ao gerar PDF:', error);
        res.status(500).json({
            success: false,
            message: 'Erro ao gerar PDF',
            error: error.message,
        });
    }
}
//# sourceMappingURL=orderExport.controller.js.map