import PDFDocument from "pdfkit";
import { getPedidosParaPdf } from "./pedidosService";
import { renderOrdersPdf } from "./orderPdfLayout";
import { OrderPdf } from "../types/Orders";

interface GeneratePdfOptions {
  data_inicio?: string;
  data_fim?: string;
}

function formatarPeriodo(options: GeneratePdfOptions) {
  if (options.data_inicio && options.data_fim) {
    return `${options.data_inicio} até ${options.data_fim}`;
  }
  if (options.data_inicio) return `A partir de ${options.data_inicio}`;
  if (options.data_fim) return `Até ${options.data_fim}`;
  return "Todos os períodos";
}

export class OrderPdfService {
  static async generate(options: GeneratePdfOptions = {}): Promise<Buffer> {
    const orders: OrderPdf[] = await getPedidosParaPdf(options);

    if (!orders.length) {
      throw new Error("Nenhum pedido encontrado no período selecionado.");
    }

    const periodo = formatarPeriodo(options);

    return new Promise((resolve) => {
      const doc = new PDFDocument({ size: "A4", margin: 40 });
      const buffers: Buffer[] = [];

      doc.on("data", buffers.push.bind(buffers));
      doc.on("end", () => resolve(Buffer.concat(buffers)));

      renderOrdersPdf(doc, orders, periodo);

      doc.end();
    });
  }
}
