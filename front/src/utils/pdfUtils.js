// src/utils/pdfUtils.js
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

/**
 * Utilitário para exportação da Lista de Participantes de uma Sessão em PDF.
 * Utiliza jsPDF e jspdf-autotable para download direto sem depender de pop-up do navegador.
 */
export const exportarListaInscritosPDF = (sessao, participantes = []) => {
  const tituloSessao = sessao?.titulo || 'Sessão SisEU';
  const dataSessao = sessao?.data 
    ? new Date(sessao.data).toLocaleDateString('pt-BR') 
    : new Date().toLocaleDateString('pt-BR');
  const localSessao = typeof sessao?.local === 'object'
    ? [sessao.local.sala, sessao.local.bloco, sessao.local.departamento].filter(Boolean).join(', ')
    : sessao?.local || 'Local não especificado';

  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
  });

  // Cabeçalho
  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.text('SisEU - Relatorio de Presenca', 14, 15);

  doc.setFontSize(8);
  doc.setFont('helvetica', 'normal');
  const dataGeracao = `Gerado em: ${new Date().toLocaleDateString('pt-BR')} ${new Date().toLocaleTimeString('pt-BR')}`;
  doc.text(dataGeracao, 200 - doc.getTextWidth(dataGeracao), 15);

  // Linha divisória
  doc.setLineWidth(0.5);
  doc.line(14, 18, 196, 18);

  // Metadados da Sessão (Card simples)
  doc.setFillColor(245, 245, 245);
  doc.rect(14, 22, 182, 20, 'F');
  doc.setDrawColor(200, 200, 200);
  doc.rect(14, 22, 182, 20, 'S');

  doc.setFontSize(9);
  doc.setFont('helvetica', 'bold');
  doc.text(`Sessao:`, 17, 28);
  doc.setFont('helvetica', 'normal');
  const tituloTruncado = tituloSessao.length > 50 ? `${tituloSessao.substring(0, 50)}...` : tituloSessao;
  doc.text(tituloTruncado, 32, 28);

  doc.setFont('helvetica', 'bold');
  doc.text(`Data:`, 17, 36);
  doc.setFont('helvetica', 'normal');
  doc.text(dataSessao, 28, 36);

  doc.setFont('helvetica', 'bold');
  doc.text(`Local:`, 75, 36);
  doc.setFont('helvetica', 'normal');
  doc.text(localSessao, 87, 36);

  doc.setFont('helvetica', 'bold');
  doc.text(`Total Inscritos:`, 150, 36);
  doc.setFont('helvetica', 'normal');
  doc.text(String(participantes.length), 176, 36);

  // Tabela de participantes
  const colunas = [
    { header: '#', dataKey: 'index' },
    { header: 'Nome do Participante', dataKey: 'nome' },
    { header: 'CPF', dataKey: 'cpf' },
    { header: 'Horario Check-in', dataKey: 'horaCheckin' },
    { header: 'Horario Check-out', dataKey: 'horaCheckout' },
  ];

  const linhas = participantes.length > 0
    ? participantes.map((p, idx) => ({
        index: idx + 1,
        nome: p.nome || 'Participante',
        cpf: p.cpf || '-',
        horaCheckin: p.horaCheckin || '-',
        horaCheckout: p.horaCheckout || '-',
      }))
    : [{ index: '-', nome: 'Nenhum participante com presenca registrada nesta sessao.', cpf: '-', horaCheckin: '-', horaCheckout: '-' }];

  autoTable(doc, {
    startY: 47,
    head: [colunas.map(c => c.header)],
    body: linhas.map(l => [l.index, l.nome, l.cpf, l.horaCheckin, l.horaCheckout]),
    theme: 'grid',
    headStyles: {
      fillColor: [240, 240, 240],
      textColor: [0, 0, 0],
      fontStyle: 'bold',
      fontSize: 8,
      halign: 'left',
    },
    styles: {
      fontSize: 8,
      textColor: [30, 30, 30],
      cellPadding: 2.5,
    },
    columnStyles: {
      0: { halign: 'center', cellWidth: 10 },
      1: { cellWidth: 'auto' },
      2: { cellWidth: 35 },
      3: { halign: 'center', cellWidth: 32 },
      4: { halign: 'center', cellWidth: 32 },
    },
    didDrawPage: (data) => {
      // Rodapé com paginação
      const str = `Pagina ${doc.internal.getNumberOfPages()}`;
      doc.setFontSize(8);
      doc.setTextColor(100);
      doc.text(str, 196 - doc.getTextWidth(str), 290);
    },
  });

  const nomeArquivo = `Relatorio_Presenca_Sessao_${sessao?.id || 'SisEU'}.pdf`;
  doc.save(nomeArquivo);
};
