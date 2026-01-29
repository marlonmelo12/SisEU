/**
 * @fileoverview Constantes globais da aplicação
 * 
 * Centralize todas as constantes mágicas aqui para facilitar manutenção
 * e evitar valores hardcoded espalhados pelo código.
 */

// ============================================
// STATUS DE SESSÕES
// ============================================
export const SESSION_STATUS = {
  ATIVA: 'ATIVA',
  ENCERRADA: 'ENCERRADA',
  AGUARDANDO: 'AGUARDANDO',
};

export const SESSION_STATUS_LABELS = {
  [SESSION_STATUS.ATIVA]: 'Ativa',
  [SESSION_STATUS.ENCERRADA]: 'Encerrada',
  [SESSION_STATUS.AGUARDANDO]: 'Aguardando',
};

// ============================================
// TIPOS DE PARTICIPAÇÃO
// ============================================
export const PARTICIPATION_TYPE = {
  OUVINTE: 'OUVINTE',
  APRESENTADOR: 'APRESENTADOR',
  ORGANIZADOR: 'ORGANIZADOR',
  AVALIADOR: 'AVALIADOR',
};

export const PARTICIPATION_TYPE_LABELS = {
  [PARTICIPATION_TYPE.OUVINTE]: 'Ouvinte',
  [PARTICIPATION_TYPE.APRESENTADOR]: 'Apresentador',
  [PARTICIPATION_TYPE.ORGANIZADOR]: 'Organizador',
  [PARTICIPATION_TYPE.AVALIADOR]: 'Avaliador',
};

// ============================================
// CAMPUS (Enum do Backend)
// ============================================
export const CAMPUS = {
  PICI: 0,
  BENFICA: 1,
  PORANGABUSSU: 2,
};

export const CAMPUS_LABELS = {
  [CAMPUS.PICI]: 'Pici',
  [CAMPUS.BENFICA]: 'Benfica',
  [CAMPUS.PORANGABUSSU]: 'Porangabuçu',
};

// ============================================
// TIPOS DE EVENTO (Enum do Backend)
// ============================================
export const TIPO_EVENTO = {
  SEMINARIO: 0,
  WORKSHOP: 1,
  CONFERENCIA: 2,
  PALESTRA: 3,
};

export const TIPO_EVENTO_LABELS = {
  [TIPO_EVENTO.SEMINARIO]: 'Seminário',
  [TIPO_EVENTO.WORKSHOP]: 'Workshop',
  [TIPO_EVENTO.CONFERENCIA]: 'Conferência',
  [TIPO_EVENTO.PALESTRA]: 'Palestra',
};

// ============================================
// MODALIDADES DE APRESENTAÇÃO (Enum do Backend)
// ============================================
export const MODALIDADE = {
  ORAL: 0,
  POSTER: 1,
  BANNER: 2,
};

export const MODALIDADE_LABELS = {
  [MODALIDADE.ORAL]: 'Apresentação Oral',
  [MODALIDADE.POSTER]: 'Pôster',
  [MODALIDADE.BANNER]: 'Banner',
};

// ============================================
// PERFIS DE USUÁRIO
// ============================================
export const USER_ROLES = {
  ESTUDANTE: 'ESTUDANTE',
  AVALIADOR: 'AVALIADOR',
  ADMINISTRADOR: 'ADMINISTRADOR',
};

export const USER_ROLES_LABELS = {
  [USER_ROLES.ESTUDANTE]: 'Estudante',
  [USER_ROLES.AVALIADOR]: 'Avaliador',
  [USER_ROLES.ADMINISTRADOR]: 'Administrador',
};

// ============================================
// STATUS DE CHECK-IN
// ============================================
export const CHECKIN_STATUS = {
  PENDENTE: 'PENDENTE',
  CONFIRMADO: 'CONFIRMADO',
  CANCELADO: 'CANCELADO',
};

// ============================================
// TIPOS DE ALERTA
// ============================================
export const ALERT_TYPES = {
  SUCCESS: 'success',
  ERROR: 'error',
  WARNING: 'warning',
  INFO: 'info',
};

// ============================================
// VARIANTES DE COMPONENTES
// ============================================
export const BUTTON_VARIANTS = {
  PRIMARY: 'primary',
  SECONDARY: 'secondary',
  SUCCESS: 'success',
  DANGER: 'danger',
  WARNING: 'warning',
  OUTLINE: 'outline',
};

export const BADGE_VARIANTS = {
  DEFAULT: 'default',
  PRIMARY: 'primary',
  SUCCESS: 'success',
  WARNING: 'warning',
  DANGER: 'danger',
  INFO: 'info',
};

// ============================================
// TAMANHOS DE COMPONENTES
// ============================================
export const SIZES = {
  SM: 'sm',
  MD: 'md',
  LG: 'lg',
  XL: 'xl',
  FULL: 'full',
};

// ============================================
// ROTAS DA APLICAÇÃO
// ============================================
export const ROUTES = {
  HOME: '/',
  LOGIN: '/',
  DASHBOARD: '/dashboard',
  ADMIN: '/admin',
  CONFIGURACOES: '/configuracoes',
  SOBRE: '/sobre',
  PERFIL: '/perfil',
};

// ============================================
// CONFIGURAÇÕES DE API
// ============================================
export const API_CONFIG = {
  TIMEOUT: parseInt(process.env.REACT_APP_API_TIMEOUT || '10000', 10),
  BASE_URL: process.env.REACT_APP_API_URL || 'http://localhost:8080/api',
  GPS_RADIUS: parseInt(process.env.REACT_APP_GPS_RADIUS || '50', 10), // metros
};

// ============================================
// CHAVES DE LOCALSTORAGE
// ============================================
export const STORAGE_KEYS = {
  TOKEN: 'token',
  USER: 'usuario',
  THEME: 'theme',
};

// ============================================
// VALIDAÇÕES
// ============================================
export const VALIDATION = {
  CPF_LENGTH: 11,
  PIN_LENGTH: 6,
  MIN_PASSWORD_LENGTH: 6,
  MAX_FILE_SIZE: 5 * 1024 * 1024, // 5MB
};

// ============================================
// MENSAGENS PADRÃO
// ============================================
export const MESSAGES = {
  ERROR: {
    NETWORK: 'Erro de conexão. Verifique sua internet.',
    UNAUTHORIZED: 'Você não tem permissão para acessar este recurso.',
    NOT_FOUND: 'Recurso não encontrado.',
    SERVER_ERROR: 'Erro no servidor. Tente novamente mais tarde.',
    VALIDATION: 'Dados inválidos. Verifique os campos.',
  },
  SUCCESS: {
    CHECKIN: 'Check-in realizado com sucesso!',
    CHECKOUT: 'Check-out realizado com sucesso!',
    SAVE: 'Salvo com sucesso!',
    DELETE: 'Excluído com sucesso!',
    UPDATE: 'Atualizado com sucesso!',
  },
  INFO: {
    LOADING: 'Carregando...',
    EMPTY: 'Nenhum resultado encontrado.',
  },
};

// ============================================
// FORMATOS
// ============================================
export const FORMATS = {
  DATE: 'DD/MM/YYYY',
  TIME: 'HH:mm',
  DATETIME: 'DD/MM/YYYY HH:mm',
};

export default {
  SESSION_STATUS,
  SESSION_STATUS_LABELS,
  PARTICIPATION_TYPE,
  PARTICIPATION_TYPE_LABELS,
  CAMPUS,
  CAMPUS_LABELS,
  TIPO_EVENTO,
  TIPO_EVENTO_LABELS,
  MODALIDADE,
  MODALIDADE_LABELS,
  USER_ROLES,
  USER_ROLES_LABELS,
  CHECKIN_STATUS,
  ALERT_TYPES,
  BUTTON_VARIANTS,
  BADGE_VARIANTS,
  SIZES,
  ROUTES,
  API_CONFIG,
  STORAGE_KEYS,
  VALIDATION,
  MESSAGES,
  FORMATS,
};
