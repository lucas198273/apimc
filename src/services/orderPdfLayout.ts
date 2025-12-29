import { OrderPdf } from "../types/Orders";

/**
 * 🔧 Reseta o cursor X para a margem esquerda
 * (ESSENCIAL para evitar o bug de conteúdo indo pra direita)
 */
function resetX(doc: any) {
  doc.x = doc.page.margins.left;
}

/**
 * 🔧 Quebra de página segura
 */
function checkPageBreak(doc: any, space = 120) {
  if (doc.y + space > doc.page.height - doc.page.margins.bottom) {
    doc.addPage();
    resetX(doc);
  }
}

/**
 * 🔧 Linha separadora
 */
function drawLine(doc: any) {
  const y = doc.y;
  doc
    .moveTo(doc.page.margins.left, y)
    .lineTo(doc.page.width - doc.page.margins.right, y)
    .strokeColor("#E5E7EB")
    .stroke();
  doc.moveDown(0.5);
}

/**
 * 🎨 Layout profissional do PDF
 */
export function renderOrdersPdf(
  doc: any,
  orders: OrderPdf[],
  periodo: string
) {
  // ===== TÍTULO =====
  resetX(doc);
  doc.font("Helvetica-Bold").fontSize(18).text("Relatório de Pedidos", {
    align: "center",
  });

  doc.moveDown(0.5);

  doc.font("Helvetica").fontSize(10).fillColor("#555").text(
    `Período: ${periodo}`,
    { align: "center" }
  );

  doc.text(`Total de pedidos: ${orders.length}`, { align: "center" });
  doc.text(`Gerado em: ${new Date().toLocaleString("pt-BR")}`, {
    align: "center",
  });

  doc.moveDown(2);

  // ===== PEDIDOS =====
  orders.forEach((order, index) => {
    checkPageBreak(doc, 200);
    resetX(doc);

    // 🔹 Cabeçalho do pedido
    doc
      .font("Helvetica-Bold")
      .fontSize(13)
      .fillColor("#000")
      .text(`${index + 1}. Pedido #${order.numero_seq} — ${order.nome_cliente}`);

    doc.moveDown(0.3);
    resetX(doc);

    doc
      .font("Helvetica")
      .fontSize(9)
      .fillColor("#444")
      .text(
        `Mesa: ${order.mesa ?? "-"}   |   Tipo: ${order.tipo ?? "-"}   |   Status: ${order.status}`
      );

    resetX(doc);
    doc.text(
      `Data: ${new Date(order.created_at).toLocaleString("pt-BR")}`
    );

    doc.moveDown(0.5);
    resetX(doc);
    drawLine(doc);

    // 🔹 Cabeçalho da tabela
    resetX(doc);
    doc.font("Helvetica-Bold").fontSize(9);
    doc.text("Item", 40);
    doc.text("Qtd", 300, doc.y - 12, { width: 50, align: "right" });
    doc.text("Preço", 370, doc.y - 12, { width: 70, align: "right" });
    doc.text("Subtotal", 460, doc.y - 12, { width: 80, align: "right" });

    doc.moveDown(0.3);
    resetX(doc);
    drawLine(doc);

    // 🔹 Itens
    doc.font("Helvetica").fontSize(9);

    order.pedido.forEach((item) => {
      checkPageBreak(doc, 40);
      resetX(doc);

      doc.text(item.name, 40);
      doc.text(String(item.quantity), 300, doc.y - 12, {
        width: 50,
        align: "right",
      });
      doc.text(`R$ ${item.price.toFixed(2)}`, 370, doc.y - 12, {
        width: 70,
        align: "right",
      });
      doc.text(
        `R$ ${(item.price * item.quantity).toFixed(2)}`,
        460,
        doc.y - 12,
        { width: 80, align: "right" }
      );

      doc.moveDown(0.3);
    });

    doc.moveDown(0.5);
    resetX(doc);

    // 🔹 Total do pedido
    doc
      .font("Helvetica-Bold")
      .fontSize(10)
      .text(`Total do pedido: R$ ${order.total.toFixed(2)}`, {
        align: "right",
      });

    doc.moveDown(1.5);
    resetX(doc);
    drawLine(doc);
  });

  // ===== TOTAL GERAL =====
  const totalGeral = orders.reduce((acc, o) => acc + o.total, 0);

  doc.moveDown(2);
  resetX(doc);
  doc
    .font("Helvetica-Bold")
    .fontSize(12)
    .text(`Total geral do período: R$ ${totalGeral.toFixed(2)}`, {
      align: "right",
    });
}
