/**
 * @fileoverview Exportações centralizadas de todos os serviços
 * 
 * Este arquivo facilita a importação de múltiplos serviços em hooks e componentes.
 * 
 * @example
 * import { authService, sessaoService, apresentacaoService } from '@/services';
 */

export { default as api } from './api';
export { default as authService } from './authService';
export { default as checkinService } from './checkinService';
export { default as apresentacaoService } from './apresentacaoService';
export { default as sessaoService } from './sessaoService';
export { default as avaliacaoService } from './avaliacaoService';
export { default as relatorioService } from './relatorioService';
export { default as geolocationService } from './geolocationService';
