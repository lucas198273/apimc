"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.renderOrdersPdf = renderOrdersPdf;
function renderOrdersPdf(doc, orders, periodo) {
    doc.fontSize(18).text("Relatório de Pedidos", { align: "center" });
    doc.moveDown(0.5);
    doc.fontSize(10).text(`Período: ${periodo}`, { align: "center" });
    doc.moveDown(2);
    orders.forEach((order, index) => {
        doc
            .fontSize(11)
            .fillColor("#000")
            .text(`${index + 1}. Pedido #${order.numero_seq} — ${order.nome_cliente}`, { underline: true });
        doc.fontSize(9);
        doc.text(`Data: ${new Date(order.created_at).toLocaleString("pt-BR")}`);
        doc.text(`Status: ${order.status}`);
        doc.text(`Tipo: ${order.tipo ?? "-"}`);
        doc.text(`Mesa: ${order.mesa ?? "-"}`);
        doc.text(`Total: R$ ${order.total.toFixed(2)}`);
        doc.moveDown(0.5);
        // Cabeçalho itens
        doc.font("Helvetica-Bold").text("Itens:");
        doc.font("Helvetica");
        order.pedido.forEach((item) => {
            doc.text(`• ${item.name} | ${item.quantity}x | R$ ${item.price.toFixed(2)}`);
        });
        doc.moveDown();
        doc.moveDown();
    });
    const totalGeral = orders.reduce((acc, o) => acc + o.total, 0);
    doc
        .moveDown()
        .fontSize(12)
        .text(`Total geral do período: R$ ${totalGeral.toFixed(2)}`, {
        align: "right",
    });
}
//# sourceMappingURL=orderPdf.layout.js.map