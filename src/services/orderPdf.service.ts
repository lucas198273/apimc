// src/services/orderPdf.service.ts

import puppeteer from "puppeteer";
import { getPedidosParaPdf } from "./pedidosService";
import { ordersPdfTemplate } from "../templates/ordersPdf.template";
import { OrderPdf } from "../types/Orders";

interface GeneratePdfOptions {
  data_inicio?: string; // formato YYYY-MM-DD
  data_fim?: string;
}

export class OrderPdfService {
  static async generate(options: GeneratePdfOptions = {}): Promise<Buffer> {
    try {
      // Passamos as opções de data para buscar os pedidos filtrados
      const orders: OrderPdf[] = await getPedidosParaPdf(options);

      if (orders.length === 0) {
        throw new Error("Nenhum pedido encontrado no período selecionado.");
      }

      // Agora o template só recebe os pedidos (vamos colocar o título de data dentro do template mesmo)
      const html = ordersPdfTemplate(orders, options);

      const pdfUint8 = await generatePdfFromHtml(html);

      return Buffer.from(pdfUint8);
    } catch (error: any) {
      console.error("Erro ao gerar PDF:", error);
      throw new Error(error.message || "Falha ao gerar o PDF");
    }
  }
}

async function generatePdfFromHtml(html: string): Promise<Uint8Array> {
  let browser;
  try {
    browser = await puppeteer.launch({
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
  } catch (error: any) {
    console.error("Erro no Puppeteer:", error);
    throw error;
  } finally {
    if (browser) await browser.close();
  }
}