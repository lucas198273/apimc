import { OrderPdf } from "../types/Orders";

interface TemplateOptions {
  data_inicio?: string;
  data_fim?: string;
}

function formatarData(data?: string) {
  if (!data) return "-";
  const [ano, mes, dia] = data.split("-");
  return `${dia}/${mes}/${ano}`;
}

export function ordersPdfTemplate(
  orders: OrderPdf[],
  options: TemplateOptions = {}
): string {

  const periodo =
    options.data_inicio && options.data_fim
      ? `${formatarData(options.data_inicio)} até ${formatarData(options.data_fim)}`
      : options.data_inicio
      ? `A partir de ${formatarData(options.data_inicio)}`
      : options.data_fim
      ? `Até ${formatarData(options.data_fim)}`
      : "Todos os períodos";

  const dataGeracao = new Date().toLocaleString("pt-BR");

  const totalGeral = orders.reduce((acc, o) => acc + o.total, 0);

  return `
<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8" />
  <title>Relatório de Pedidos</title>

  <style>
    body {
      font-family: Arial, sans-serif;
      font-size: 11px;
      color: #111;
      padding: 32px;
    }

    h1 {
      text-align: center;
      margin-bottom: 8px;
    }

    .meta {
      text-align: center;
      margin-bottom: 24px;
      font-size: 12px;
    }

    table {
      width: 100%;
      border-collapse: collapse;
      margin-bottom: 16px;
    }

    th, td {
      border: 1px solid #ccc;
      padding: 6px;
      vertical-align: top;
    }

    th {
      background: #f3f4f6;
      font-weight: bold;
      text-align: left;
    }

    .right {
      text-align: right;
    }

    .center {
      text-align: center;
    }

    .pedido-header {
      background: #e5e7eb;
      font-weight: bold;
    }

    .itens-table th {
      background: #f9fafb;
      font-size: 10px;
    }

    .total-geral {
      font-size: 13px;
      font-weight: bold;
      text-align: right;
      margin-top: 24px;
    }

    .page-break {
      page-break-after: always;
    }

    footer {
      text-align: center;
      margin-top: 40px;
      font-size: 10px;
      color: #666;
    }
  </style>
</head>

<body>
  <h1>Relatório de Pedidos</h1>

  <div class="meta">
    <div><strong>Período:</strong> ${periodo}</div>
    <div><strong>Total de pedidos:</strong> ${orders.length}</div>
    <div><strong>Gerado em:</strong> ${dataGeracao}</div>
  </div>

  <table>
    <thead>
      <tr>
        <th>#</th>
        <th>Cliente</th>
        <th>Tipo</th>
        <th>Mesa</th>
        <th>Status</th>
        <th class="right">Total</th>
        <th>Data</th>
      </tr>
    </thead>

    <tbody>
      ${orders.map(order => `
        <tr class="pedido-header">
          <td class="center">${order.numero_seq}</td>
          <td>${order.nome_cliente}</td>
          <td class="center">${order.tipo ?? "-"}</td>
          <td class="center">${order.mesa ?? "-"}</td>
          <td>${order.status}</td>
          <td class="right">R$ ${order.total.toFixed(2)}</td>
          <td>${new Date(order.created_at).toLocaleString("pt-BR")}</td>
        </tr>

        <tr>
          <td colspan="7" style="padding:0">
            <table class="itens-table">
              <thead>
                <tr>
                  <th>Item</th>
                  <th class="center">Qtd</th>
                  <th class="right">Preço</th>
                  <th class="right">Subtotal</th>
                </tr>
              </thead>
              <tbody>
                ${order.pedido.map(item => `
                  <tr>
                    <td>${item.name}</td>
                    <td class="center">${item.quantity}</td>
                    <td class="right">R$ ${item.price.toFixed(2)}</td>
                    <td class="right">R$ ${(item.price * item.quantity).toFixed(2)}</td>
                  </tr>
                `).join("")}
              </tbody>
            </table>
          </td>
        </tr>
      `).join("")}
    </tbody>
  </table>

  <div class="total-geral">
    Total geral do período: R$ ${totalGeral.toFixed(2)}
  </div>

  <footer>
    Relatório gerado automaticamente pelo sistema
  </footer>
</body>
</html>
`;
}
