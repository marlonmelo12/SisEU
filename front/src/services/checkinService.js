// src/services/checkinService.js
import api from './api';

/**
 * Serviço de Check-in
 */
const checkinService = {
  /**
   * Obtém PIN ativo do evento
   * GET /api/Checkin/pin-ativo
   * @returns {Promise<{pin: string, eventoId: string, dataExpiracao: string}>}
   */
  async obterPinAtivo() {
    try {
      const response = await api.get('/Checkin/pin-ativo');
      return response.data;
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'Nenhum PIN ativo encontrado';
      throw new Error(errorMessage);
    }
  },

  /**
   * Gera/cria um novo PIN para o evento
   * POST /api/Checkin/pin
   * @param {Object} dados 
   * @param {string} dados.eventoId
   * @param {number} dados.duracaoMinutos
   * @returns {Promise<{pin: string, dataExpiracao: string}>}
   */
  async gerarPin(dados) {
    try {
      const response = await api.post('/Checkin/pin', dados);
      return response.data;
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'Erro ao gerar PIN';
      throw new Error(errorMessage);
    }
  },

  /**
   * Valida PIN de check-in
   * POST /api/Checkin/validar-pin
   * @param {string} pin 
   * @returns {Promise<{valid: boolean, eventoId: string, sessaoId: string}>}
   */
  async validarPin(pin) {
    try {
      const response = await api.post('/Checkin/validar-pin', { pin });
      return response.data;
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'PIN inválido ou expirado';
      throw new Error(errorMessage);
    }
  },

  /**
   * Registra check-in com geolocalização
   * @param {Object} dados 
   * @param {string} dados.eventoId
   * @param {string} dados.sessaoId
   * @param {string} dados.pin
   * @param {number} dados.latitude
   * @param {number} dados.longitude
   * @param {'OUVINTE' | 'APRESENTADOR'} dados.tipoParticipacao
   * @returns {Promise<import('../models').Checkin>}
   */
  async registrarCheckin(dados) {
    try {
      const response = await api.post('/Checkin/registrar', {
        ...dados,
        dataHoraCheckin: new Date().toISOString(),
      });
      return response.data;
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'Erro ao registrar check-in';
      throw new Error(errorMessage);
    }
  },

  /**
   * Registra checkout
   * @param {Object} dados 
   * @param {string} dados.checkinId
   * @param {string} dados.pin
   * @param {number} dados.latitude
   * @param {number} dados.longitude
   * @returns {Promise<import('../models').Checkin>}
   */
  async registrarCheckout(dados) {
    try {
      const response = await api.post('/Checkin/checkout', {
        ...dados,
        dataHoraCheckout: new Date().toISOString(),
      });
      return response.data;
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'Erro ao registrar checkout';
      throw new Error(errorMessage);
    }
  },

  /**
   * Busca check-in ativo do usuário
   * @param {string} usuarioId 
   * @param {string} eventoId 
   * @returns {Promise<import('../models').Checkin | null>}
   */
  async buscarCheckinAtivo(usuarioId, eventoId) {
    try {
      const response = await api.get('/Checkin/ativo', {
        params: { usuarioId, eventoId },
      });
      return response.data;
    } catch (error) {
      if (error.response?.status === 404) {
        return null;
      }
      throw error;
    }
  },

  /**
   * Obtém relatório de check-ins
   * GET /api/Checkin/relatorio
   * @param {Object} filtros
   * @param {string} filtros.eventoId
   * @param {string} filtros.dataInicio
   * @param {string} filtros.dataFim
   * @returns {Promise<Object>}
   */
  async obterRelatorio(filtros) {
    try {
      const response = await api.get('/Checkin/relatorio', {
        params: filtros,
      });
      return response.data;
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'Erro ao obter relatório';
      throw new Error(errorMessage);
    }
  },

  /**
   * Lista histórico de check-ins do usuário
   * @param {string} usuarioId 
   * @returns {Promise<import('../models').Checkin[]>}
   */
  async listarHistorico(usuarioId) {
    try {
      const response = await api.get(`/Checkin/historico/${usuarioId}`);
      return response.data;
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'Erro ao buscar histórico';
      throw new Error(errorMessage);
    }
  },
};

export const CheckinService = checkinService;
export default checkinService;
