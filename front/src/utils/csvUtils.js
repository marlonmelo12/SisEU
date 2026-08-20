// src/utils/csvUtils.js

/**
 * Converte uma lista de objetos de presenças em formato CSV.
 * @param {Array} data Lista de presenças vinda do backend
 * @returns {string} String formatada em CSV
 */
export const convertPresencasToCSV = (data) => {
  if (!data || data.length === 0) return '';

  const headers = [
    'ID Presença',
    'Usuário ID',
    'Nome Usuário',
    'CPF',
    'Email',
    'Evento ID',
    'Título Evento',
    'Campus',
    'Local',
    'Data Início',
    'Data Fim',
    'Check-in',
    'Check-out',
    'Latitude Check-in',
    'Longitude Check-in'
  ];

  const rows = data.map(item => [
    item.id,
    item.usuario?.id || '',
    item.usuario?.nomeCompleto || '',
    item.usuario?.cpf || '',
    item.usuario?.email || '',
    item.evento?.id || '',
    item.evento?.titulo || '',
    item.evento?.nomeCampus || '',
    `${item.evento?.local?.campus || ''} - ${item.evento?.local?.bloco || ''} - ${item.evento?.local?.sala || ''}`,
    item.evento?.dataInicio?.dataPorExtenso || '',
    item.evento?.dataFim?.dataPorExtenso || '',
    item.dataCheckIn || '',
    item.dataCheckOut || '',
    item.localizacao?.latitude || '',
    item.localizacao?.longitude || ''
  ]);

  const csvContent = [
    headers.join(','),
    ...rows.map(row => row.map(cell => `"${cell}"`).join(','))
  ].join('\n');

  return csvContent;
};

/**
 * Faz download de uma string CSV criando um Blob temporário.
 * @param {string} content Conteúdo CSV
 * @param {string} filename Nome do arquivo para download
 */
export const downloadCSVFile = (content, filename) => {
  const blob = new Blob(['\ufeff' + content], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);
  
  link.setAttribute('href', url);
  link.setAttribute('download', filename);
  link.style.visibility = 'hidden';
  
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};
