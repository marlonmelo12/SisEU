// src/utils/exportUtils.js
/**
 * Utilitários de exportação — RF007
 * Suporta: PDF (via pdfUtils), CSV (via csvUtils), XLSX, XML, JSON
 */

// ─── XLSX (SheetJS) ──────────────────────────────────────────────────────────
export const exportarXLSX = async (sessao, participantes) => {
  const XLSX = await import('xlsx');

  const dados = participantes.map((p, i) => ({
    '#': i + 1,
    'Nome do Participante': p.nome,
    'CPF': p.cpf,
    'Horário Check-in': p.horaCheckin || '-',
    'Horário Check-out': p.horaCheckout || '-',
  }));

  const ws = XLSX.utils.json_to_sheet(dados);

  // Largura das colunas
  ws['!cols'] = [
    { wch: 5 },
    { wch: 35 },
    { wch: 18 },
    { wch: 18 },
    { wch: 18 },
  ];

  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, 'Participantes');

  const nomeArquivo = `Participantes_${sessao?.titulo?.replace(/\s+/g, '_') || 'Sessao'}_${sessao?.id || ''}.xlsx`;
  XLSX.writeFile(wb, nomeArquivo);
};

// ─── XML ─────────────────────────────────────────────────────────────────────
export const exportarXML = (sessao, participantes) => {
  const escapar = (str) =>
    String(str || '')
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&apos;');

  const linhas = participantes.map(
    (p, i) => `  <participante numero="${i + 1}">
    <nome>${escapar(p.nome)}</nome>
    <cpf>${escapar(p.cpf)}</cpf>
    <horaCheckin>${escapar(p.horaCheckin)}</horaCheckin>
    <horaCheckout>${escapar(p.horaCheckout)}</horaCheckout>
  </participante>`
  );

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<relatorio>
  <sessao>
    <id>${escapar(sessao?.id)}</id>
    <titulo>${escapar(sessao?.titulo)}</titulo>
    <data>${escapar(sessao?.data)}</data>
  </sessao>
  <participantes total="${participantes.length}">
${linhas.join('\n')}
  </participantes>
</relatorio>`;

  const blob = new Blob([xml], { type: 'application/xml;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `Participantes_${sessao?.id || 'Sessao'}.xml`;
  a.click();
  URL.revokeObjectURL(url);
};

// ─── JSON ─────────────────────────────────────────────────────────────────────
export const exportarJSON = (sessao, participantes) => {
  const payload = {
    sessao: {
      id: sessao?.id,
      titulo: sessao?.titulo,
      data: sessao?.data,
      local: sessao?.local,
    },
    totalParticipantes: participantes.length,
    participantes: participantes.map((p, i) => ({
      numero: i + 1,
      nome: p.nome,
      cpf: p.cpf,
      horaCheckin: p.horaCheckin || null,
      horaCheckout: p.horaCheckout || null,
    })),
    geradoEm: new Date().toISOString(),
  };

  const json = JSON.stringify(payload, null, 2);
  const blob = new Blob([json], { type: 'application/json;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `Participantes_${sessao?.id || 'Sessao'}.json`;
  a.click();
  URL.revokeObjectURL(url);
};
