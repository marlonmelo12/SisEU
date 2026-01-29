// src/services/relatorioService.js
import api from './api';

/**
 * Serviço de Relatórios
 */
const relatorioService = {
  /**
   * Gera relatório de presença
   * @param {Object} filtros 
   * @param {string} [filtros.usuarioId]
   * @param {string} [filtros.dataInicio]
   * @param {string} [filtros.dataFim]
   * @param {string} [filtros.sessaoId]
   * @returns {Promise<import('../models').RelatorioPresenca[]>}
   */
  async gerarRelatorioPresenca(filtros = {}) {
    try {
      const response = await api.get('/Relatorios/presenca', { params: filtros });
      return response.data;
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'Erro ao gerar relatório';
      throw new Error(errorMessage);
    }
  },

  /**
   * Exporta relatório em CSV
   * @param {Object} filtros 
   * @returns {Promise<Blob>}
   */
  async exportarCSV(filtros = {}) {
    try {
      const response = await api.get('/Relatorios/exportar-csv', {
        params: filtros,
        responseType: 'blob',
      });
      return response.data;
    } catch (error) {
      const errorMessage = 'Erro ao exportar relatório';
      throw new Error(errorMessage);
    }
  },

  /**
   * Busca relatório completo de presenças
   * @returns {Promise<Array>}
   */
  async buscarRelatorioPresencas() {
    try {
      const response = await api.get('/Presencas/relatorio');
      return response.data;
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'Erro ao buscar relatório de presenças';
      throw new Error(errorMessage);
    }
  },

  /**
   * Gera estatísticas do evento
   * @param {string} eventoId 
   * @returns {Promise<Object>}
   */
  async estatisticasEvento(eventoId) {
    try {
      const response = await api.get(`/Relatorios/estatisticas/${eventoId}`);
      return response.data;
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'Erro ao buscar estatísticas';
      throw new Error(errorMessage);
    }
  },

  /**
   * Faz download do blob CSV
   * @param {Blob} blob 
   * @param {string} nomeArquivo 
   */
  downloadCSV(blob, nomeArquivo = 'relatorio-presenca.csv') {
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = nomeArquivo;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
  },
};

export default relatorioService;
