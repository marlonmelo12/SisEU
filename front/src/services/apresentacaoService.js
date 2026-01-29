// src/services/apresentacaoService.js
import api from './api';

/**
 * Serviço de Apresentações
 */
const apresentacaoService = {
  /**
   * Busca apresentações do usuário logado
   * @returns {Promise<import('../models').Apresentacao[]>}
   */
  async minhasApresentacoes() {
    try {
      const response = await api.get('/Apresentacoes/minhas-apresentacoes');
      return response.data;
    } catch (error) {
      // Se o erro for "Sequence contains no matching element", retornar array vazio
      if (error.response?.status === 500 && 
          error.response?.data?.includes?.('Sequence contains no matching element')) {
        console.warn('[APRESENTACAO] Usuário sem apresentações, retornando array vazio');
        return [];
      }
      const errorMessage = error.response?.data?.message || 'Erro ao buscar apresentações';
      throw new Error(errorMessage);
    }
  },

  /**
   * Cria nova apresentação
   * @param {string} eventoId 
   * @param {Object} dados 
   * @returns {Promise<import('../models').Apresentacao>}
   */
  async criar(eventoId, dados) {
    try {
      const response = await api.post(`/Apresentacoes/${eventoId}`, dados);
      return response.data;
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'Erro ao criar apresentação';
      throw new Error(errorMessage);
    }
  },

  /**
   * Atualiza apresentação existente
   * @param {string} id 
   * @param {Object} dados 
   * @returns {Promise<import('../models').Apresentacao>}
   */
  async atualizar(id, dados) {
    try {
      const response = await api.put(`/Apresentacoes/${id}`, dados);
      return response.data;
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'Erro ao atualizar apresentação';
      throw new Error(errorMessage);
    }
  },

  /**
   * Deleta apresentação
   * @param {string} id 
   * @returns {Promise<void>}
   */
  async deletar(id) {
    try {
      await api.delete(`/Apresentacoes/${id}`);
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'Erro ao deletar apresentação';
      throw new Error(errorMessage);
    }
  },

  /**
   * Busca apresentação por ID
   * @param {string} id 
   * @returns {Promise<import('../models').Apresentacao>}
   */
  async buscarPorId(id) {
    try {
      const response = await api.get(`/Apresentacoes/${id}`);
      return response.data;
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'Apresentação não encontrada';
      throw new Error(errorMessage);
    }
  },

  /**
   * Lista todas apresentações de um evento
   * @param {string} eventoId 
   * @returns {Promise<import('../models').Apresentacao[]>}
   */
  async listarPorEvento(eventoId) {
    try {
      const response = await api.get(`/Apresentacoes/evento/${eventoId}`);
      return response.data;
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'Erro ao listar apresentações';
      throw new Error(errorMessage);
    }
  },
};

export default apresentacaoService;
