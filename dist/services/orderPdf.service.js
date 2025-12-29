"use strict";
// src/services/orderPdf.service.ts
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.OrderPdfService = void 0;
const puppeteer_1 = __importDefault(require("puppeteer"));
const pedidosService_1 = require("./pedidosService");
const ordersPdf_template_1 = require("../templates/ordersPdf.template");
class OrderPdfService {
    static async generate(options = {}) {
        try {
            // Passamos as opções de data para buscar os pedidos filtrados
            const orders = await (0, pedidosService_1.getPedidosParaPdf)(options);
            if (orders.length === 0) {
                throw new Error("Nenhum pedido encontrado no período selecionado.");
            }
            // Agora o template só recebe os pedidos (vamos colocar o título de data dentro do template mesmo)
            const html = (0, ordersPdf_template_1.ordersPdfTemplate)(orders, options);
            const pdfUint8 = await generatePdfFromHtml(html);
            return Buffer.from(pdfUint8);
        }
        catch (error) {
            console.error("Erro ao gerar PDF:", error);
            throw new Error(error.message || "Falha ao gerar o PDF");
        }
    }
}
exports.OrderPdfService = OrderPdfService;
async function generatePdfFromHtml(html) {
    let browser;
    try {
        browser = await puppeteer_1.default.launch({
            headless: true,
            args: [
                "--no-sandbox",
                "--disable-setuid-sandbox",
                "--disable-dev-shm-usage",
                "--disable-gpu",
            ],
        });
        const page = await browser.newPage();
        await page.setContent(html, { waitUntil: "networkidle0" });
        const pdfBuffer = await page.pdf({
            format: "A4",
            printBackground: true,
            margin: { top: "20mm", bottom: "20mm", left: "15mm", right: "15mm" },
        });
        return pdfBuffer;
    }
    catch (error) {
        console.error("Erro no Puppeteer:", error);
        throw error;
    }
    finally {
        if (browser)
            await browser.close();
    }
}
//# sourceMappingURL=orderPdf.service.js.map