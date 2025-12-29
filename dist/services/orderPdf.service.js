"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.OrderPdfService = void 0;
const pdfkit_1 = __importDefault(require("pdfkit"));
const pedidosService_1 = require("./pedidosService");
const orderPdfLayout_1 = require("./orderPdfLayout");
function formatarPeriodo(options) {
    if (options.data_inicio && options.data_fim) {
        return `${options.data_inicio} até ${options.data_fim}`;
    }
    if (options.data_inicio)
        return `A partir de ${options.data_inicio}`;
    if (options.data_fim)
        return `Até ${options.data_fim}`;
    return "Todos os períodos";
}
class OrderPdfService {
    static async generate(options = {}) {
        const orders = await (0, pedidosService_1.getPedidosParaPdf)(options);
        if (!orders.length) {
            throw new Error("Nenhum pedido encontrado no período selecionado.");
        }
        const periodo = formatarPeriodo(options);
        return new Promise((resolve) => {
            const doc = new pdfkit_1.default({ size: "A4", margin: 40 });
            const buffers = [];
            doc.on("data", buffers.push.bind(buffers));
            doc.on("end", () => resolve(Buffer.concat(buffers)));
            (0, orderPdfLayout_1.renderOrdersPdf)(doc, orders, periodo);
            doc.end();
        });
    }
}
exports.OrderPdfService = OrderPdfService;
//# sourceMappingURL=orderPdf.service.js.map