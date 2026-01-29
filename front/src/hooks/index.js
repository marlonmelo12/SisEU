/**
 * @fileoverview Exportações centralizadas de todos os hooks (Controllers)
 * 
 * Este arquivo facilita a importação de múltiplos hooks em componentes.
 * 
 * @example
 * import { useAuth, useSessoes, useApresentacoes } from '@/hooks';
 */

export { default as useAuth } from './useAuth';
export { default as useSessoes } from './useSessoes';
export { default as useApresentacoes } from './useApresentacoes';
export { default as useAvaliacoes } from './useAvaliacoes';
export { default as useRelatorios } from './useRelatorios';
