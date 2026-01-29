// src/services/avaliacaoService.js
import api from './api';

/**
 * Serviço de Avaliações
 */
const avaliacaoService = {
  /**
   * Inicia avaliação de uma apresentação
   * @param {string} apresentacaoId 
   * @returns {Promise<import('../models').Avaliacao>}
   */
  async iniciar(apresentacaoId) {
    try {
      const response = await api.post('/Avaliacoes/iniciar', { apresentacaoId });
      return response.data;
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'Erro ao iniciar avaliação';
      throw new Error(errorMessage);
    }
  },

  /**
   * Envia avaliação (nota e parecer)
   * @param {string} avaliacaoId
   * @param {Object} dados 
   * @param {number} dados.nota
   * @param {string} dados.parecer
   * @returns {Promise<import('../models').Avaliacao>}
   */
  async enviar(avaliacaoId, dados) {
    try {
      const response = await api.post(`/Avaliacoes/${avaliacaoId}/enviar`, dados);
      return response.data;
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'Erro ao enviar avaliação';
      throw new Error(errorMessage);
    }
  },

  /**
   * Lista avaliações do avaliador logado
   * @returns {Promise<import('../models').Avaliacao[]>}
   */
  async minhasAvaliacoes() {
    try {
      const response = await api.get('/Avaliacoes/minhas');
      return response.data;
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'Erro ao buscar avaliações';
      throw new Error(errorMessage);
    }
  },

  /**
   * Busca avaliação por ID
   * @param {string} id 
   * @returns {Promise<import('../models').Avaliacao>}
   */
  async buscarPorId(id) {
    try {
      const response = await api.get(`/Avaliacoes/${id}`);
      return response.data;
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'Avaliação não encontrada';
      throw new Error(errorMessage);
    }
  },

  /**
   * Lista avaliações de uma apresentação específica
   * @param {string} apresentacaoId 
   * @returns {Promise<import('../models').Avaliacao[]>}
   */
  async listarPorApresentacao(apresentacaoId) {
    try {
      const response = await api.get(`/Avaliacoes/apresentacao/${apresentacaoId}`);
      return response.data;
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'Erro ao listar avaliações';
      throw new Error(errorMessage);
    }
  },
};

export default avaliacaoService;
