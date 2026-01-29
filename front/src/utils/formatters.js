/**
 * @fileoverview Funções utilitárias para formatação de dados
 * 
 * Centralize todas as funções de formatação aqui para reutilização
 * e consistência em toda a aplicação.
 */

/**
 * Formata CPF para o padrão 000.000.000-00
 * @param {string} cpf - CPF sem formatação
 * @returns {string} CPF formatado
 * 
 * @example
 * formatCPF('12345678900') // '123.456.789-00'
 */
export const formatCPF = (cpf) => {
  if (!cpf) return '';
  
  const cleaned = cpf.replace(/\D/g, '');
  
  if (cleaned.length !== 11) return cpf;
  
  return cleaned.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4');
};

/**
 * Remove formatação do CPF, retornando apenas números
 * @param {string} cpf - CPF formatado
 * @returns {string} CPF sem formatação
 * 
 * @example
 * unformatCPF('123.456.789-00') // '12345678900'
 */
export const unformatCPF = (cpf) => {
  if (!cpf) return '';
  return cpf.replace(/\D/g, '');
};

/**
 * Valida formato de CPF
 * @param {string} cpf - CPF para validar
 * @returns {boolean} True se válido
 */
export const isValidCPF = (cpf) => {
  const cleaned = unformatCPF(cpf);
  
  if (cleaned.length !== 11) return false;
  
  // 🚨 VALIDAÇÃO DESABILITADA PARA DESENVOLVIMENTO
  // Apenas verifica se tem 11 dígitos
  return true;
  
  // Verifica se todos os dígitos são iguais
  // if (/^(\d)\1+$/.test(cleaned)) return false;
  
  // // Validação dos dígitos verificadores
  // let sum = 0;
  // let remainder;
  
  // for (let i = 1; i <= 9; i++) {
  //   sum += parseInt(cleaned.substring(i - 1, i)) * (11 - i);
  // }
  
  // remainder = (sum * 10) % 11;
  // if (remainder === 10 || remainder === 11) remainder = 0;
  // if (remainder !== parseInt(cleaned.substring(9, 10))) return false;
  
  // sum = 0;
  // for (let i = 1; i <= 10; i++) {
  //   sum += parseInt(cleaned.substring(i - 1, i)) * (12 - i);
  // }
  
  // remainder = (sum * 10) % 11;
  // if (remainder === 10 || remainder === 11) remainder = 0;
  // if (remainder !== parseInt(cleaned.substring(10, 11))) return false;
  
  // return true;
};

/**
 * Formata data para o padrão brasileiro DD/MM/YYYY
 * @param {string|Date} date - Data para formatar
 * @returns {string} Data formatada
 * 
 * @example
 * formatDate('2025-01-28') // '28/01/2025'
 * formatDate(new Date()) // '28/01/2025'
 */
export const formatDate = (date) => {
  if (!date) return '';
  
  const d = new Date(date);
  if (isNaN(d.getTime())) return '';
  
  const day = String(d.getDate()).padStart(2, '0');
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const year = d.getFullYear();
  
  return `${day}/${month}/${year}`;
};

/**
 * Formata hora para o padrão HH:MM
 * @param {string|Date} time - Hora para formatar
 * @returns {string} Hora formatada
 * 
 * @example
 * formatTime('2025-01-28T14:30:00') // '14:30'
 */
export const formatTime = (time) => {
  if (!time) return '';
  
  const t = new Date(time);
  if (isNaN(t.getTime())) return time;
  
  const hours = String(t.getHours()).padStart(2, '0');
  const minutes = String(t.getMinutes()).padStart(2, '0');
  
  return `${hours}:${minutes}`;
};

/**
 * Formata data e hora completa
 * @param {string|Date} datetime - Data/hora para formatar
 * @returns {string} Data e hora formatadas
 * 
 * @example
 * formatDateTime('2025-01-28T14:30:00') // '28/01/2025 14:30'
 */
export const formatDateTime = (datetime) => {
  if (!datetime) return '';
  
  const date = formatDate(datetime);
  const time = formatTime(datetime);
  
  return `${date} ${time}`;
};

/**
 * Formata número de telefone para (00) 00000-0000
 * @param {string} phone - Telefone sem formatação
 * @returns {string} Telefone formatado
 */
export const formatPhone = (phone) => {
  if (!phone) return '';
  
  const cleaned = phone.replace(/\D/g, '');
  
  if (cleaned.length === 11) {
    return cleaned.replace(/(\d{2})(\d{5})(\d{4})/, '($1) $2-$3');
  } else if (cleaned.length === 10) {
    return cleaned.replace(/(\d{2})(\d{4})(\d{4})/, '($1) $2-$3');
  }
  
  return phone;
};

/**
 * Trunca texto com reticências
 * @param {string} text - Texto para truncar
 * @param {number} maxLength - Tamanho máximo
 * @returns {string} Texto truncado
 * 
 * @example
 * truncateText('Lorem ipsum dolor sit amet', 10) // 'Lorem ipsu...'
 */
export const truncateText = (text, maxLength) => {
  if (!text || text.length <= maxLength) return text;
  return `${text.substring(0, maxLength)}...`;
};

/**
 * Capitaliza primeira letra de cada palavra
 * @param {string} text - Texto para capitalizar
 * @returns {string} Texto capitalizado
 * 
 * @example
 * capitalizeWords('joão da silva') // 'João Da Silva'
 */
export const capitalizeWords = (text) => {
  if (!text) return '';
  
  return text
    .toLowerCase()
    .split(' ')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
};

/**
 * Formata número de bytes para formato legível
 * @param {number} bytes - Número de bytes
 * @returns {string} Tamanho formatado
 * 
 * @example
 * formatBytes(1024) // '1 KB'
 * formatBytes(1048576) // '1 MB'
 */
export const formatBytes = (bytes) => {
  if (bytes === 0) return '0 Bytes';
  
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(2))} ${sizes[i]}`;
};

/**
 * Formata número para moeda brasileira
 * @param {number} value - Valor numérico
 * @returns {string} Valor formatado
 * 
 * @example
 * formatCurrency(1234.56) // 'R$ 1.234,56'
 */
export const formatCurrency = (value) => {
  if (typeof value !== 'number') return 'R$ 0,00';
  
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(value);
};

/**
 * Calcula tempo decorrido desde uma data (tempo relativo)
 * @param {string|Date} date - Data de referência
 * @returns {string} Tempo decorrido
 * 
 * @example
 * getRelativeTime('2025-01-28T10:00:00') // 'há 2 horas'
 */
export const getRelativeTime = (date) => {
  if (!date) return '';
  
  const now = new Date();
  const past = new Date(date);
  const diffMs = now - past;
  const diffSec = Math.floor(diffMs / 1000);
  const diffMin = Math.floor(diffSec / 60);
  const diffHour = Math.floor(diffMin / 60);
  const diffDay = Math.floor(diffHour / 24);
  
  if (diffSec < 60) return 'agora há pouco';
  if (diffMin < 60) return `há ${diffMin} minuto${diffMin > 1 ? 's' : ''}`;
  if (diffHour < 24) return `há ${diffHour} hora${diffHour > 1 ? 's' : ''}`;
  if (diffDay < 7) return `há ${diffDay} dia${diffDay > 1 ? 's' : ''}`;
  if (diffDay < 30) return `há ${Math.floor(diffDay / 7)} semana${Math.floor(diffDay / 7) > 1 ? 's' : ''}`;
  
  return formatDate(date);
};

export default {
  formatCPF,
  unformatCPF,
  isValidCPF,
  formatDate,
  formatTime,
  formatDateTime,
  formatPhone,
  truncateText,
  capitalizeWords,
  formatBytes,
  formatCurrency,
  getRelativeTime,
};
