// src/utils/pdfUtils.js

/**
 * Utilitário para exportação da Lista de Participantes de uma Sessão em PDF.
 * Layout direto e limpo em PRETO E BRANCO (sem campo de assinatura e sem label de documento oficial).
 */
export const exportarListaInscritosPDF = (sessao, participantes = []) => {
  const tituloSessao = sessao?.titulo || 'Sessão SisEU';
  const dataSessao = sessao?.data ? new Date(sessao.data).toLocaleDateString('pt-BR') : new Date().toLocaleDateString('pt-BR');
  const localSessao = typeof sessao?.local === 'object'
    ? `${sessao.local.sala || ''}, ${sessao.local.bloco || ''} - ${sessao.local.departamento || ''}`
    : sessao?.local || 'Local não especificado';

  const printWindow = window.open('', '_blank');
  if (!printWindow) {
    alert('Por favor, permita pop-ups para gerar o relatório PDF.');
    return;
  }

  const linhasTabela = participantes.length > 0 ? participantes.map((p, index) => `
    <tr>
      <td style="text-align: center; font-weight: bold;">${index + 1}</td>
      <td>${p.nome || 'Participante'}</td>
      <td style="font-family: monospace;">${p.cpf || '-'}</td>
      <td style="text-align: center;">${p.horaCheckin || '-'}</td>
      <td style="text-align: center;">${p.horaCheckout || '-'}</td>
    </tr>
  `).join('') : `
    <tr>
      <td colspan="5" style="text-align: center; padding: 20px;">
        Nenhum participante com presença registrada nesta sessão até o momento.
      </td>
    </tr>
  `;

  const htmlContent = `
    <!DOCTYPE html>
    <html lang="pt-BR">
    <head>
      <meta charset="UTF-8">
      <title>Lista de Participantes - ${tituloSessao}</title>
      <style>
        @page {
          size: A4;
          margin: 15mm;
        }
        body {
          font-family: Arial, Helvetica, sans-serif;
          color: #000000;
          background: #FFFFFF;
          margin: 0;
          padding: 10px;
        }
        .header {
          border-bottom: 2px solid #000000;
          padding-bottom: 10px;
          margin-bottom: 15px;
          display: flex;
          justify-content: space-between;
          align-items: flex-end;
        }
        .header h1 {
          margin: 0;
          font-size: 18px;
          color: #000000;
          text-transform: uppercase;
        }
        .meta-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 8px;
          border: 1px solid #000000;
          padding: 10px;
          margin-bottom: 15px;
          font-size: 11px;
        }
        .meta-item strong {
          color: #000000;
        }
        table {
          width: 100%;
          border-collapse: collapse;
          font-size: 11px;
          margin-top: 5px;
        }
        th, td {
          border: 1px solid #000000;
          padding: 7px 8px;
          text-align: left;
          color: #000000;
        }
        th {
          background-color: #F0F0F0;
          color: #000000;
          font-weight: bold;
          text-transform: uppercase;
          font-size: 10px;
        }
      </style>
    </head>
    <body>
      <div class="header">
        <div>
          <h1>SisEU — Relatório de Presença</h1>
        </div>
        <div style="text-align: right; font-size: 10px; color: #000000;">
          Gerado em: ${new Date().toLocaleDateString('pt-BR')} ${new Date().toLocaleTimeString('pt-BR')}
        </div>
      </div>

      <div class="meta-grid">
        <div class="meta-item"><strong>Sessão:</strong> ${tituloSessao}</div>
        <div class="meta-item"><strong>Data do Evento:</strong> ${dataSessao}</div>
        <div class="meta-item"><strong>Local:</strong> ${localSessao}</div>
        <div class="meta-item"><strong>Total de Participantes:</strong> ${participantes.length}</div>
      </div>

      <table>
        <thead>
          <tr>
            <th style="width: 30px; text-align: center;">#</th>
            <th>Nome do Participante</th>
            <th style="width: 120px;">CPF</th>
            <th style="width: 110px; text-align: center;">Horário Check-in</th>
            <th style="width: 110px; text-align: center;">Horário Check-out</th>
          </tr>
        </thead>
        <tbody>
          ${linhasTabela}
        </tbody>
      </table>

      <script>
        window.onload = function() {
          window.print();
        };
      </script>
    </body>
    </html>
  `;

  printWindow.document.write(htmlContent);
  printWindow.document.close();
};
