"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.exportOrdersPdf = exportOrdersPdf;
const orderPdf_service_1 = require("../services/orderPdf.service");
async function exportOrdersPdf(req, res) {
    try {
        // 🔹 Sanitização simples dos parâmetros
        const data_inicio = typeof req.query.data_inicio === "string"
            ? req.query.data_inicio
            : undefined;
        const data_fim = typeof req.query.data_fim === "string"
            ? req.query.data_fim
            : undefined;
        // 🔹 Geração do PDF (PDFKit)
        const pdfBuffer = await orderPdf_service_1.OrderPdfService.generate({
            data_inicio,
            data_fim,
        });
        // 🔹 Nome do arquivo
        const dataAtual = new Date().toISOString().slice(0, 10);
        const filename = `relatorio_pedidos_${dataAtual}.pdf`;
        // 🔹 Headers corretos para download
        res.setHeader("Content-Type", "application/pdf");
        res.setHeader("Content-Disposition", `attachment; filename="${filename}"`);
        res.setHeader("Content-Length", pdfBuffer.length);
        // 🔹 Envio do PDF
        res.status(200).send(pdfBuffer);
    }
    catch (error) {
        console.error("Erro ao gerar PDF:", error);
        res.status(500).json({
            success: false,
            message: "Erro ao gerar PDF",
            error: error.message ?? "Erro interno",
        });
    }
}
//# sourceMappingURL=orderExport.controller.js.map