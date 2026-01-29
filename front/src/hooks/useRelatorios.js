// src/hooks/useRelatorios.js
import { useState, useCallback } from 'react';
import relatorioService from '../services/relatorioService';

/**
 * Hook de Relatórios (Controller)
 */
export const useRelatorios = () => {
  const [relatorios, setRelatorios] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  /**
   * Gera relatório de presença
   */
  const gerarRelatorioPresenca = useCallback(async (filtros = {}) => {
    setLoading(true);
    setError(null);

    try {
      const dados = await relatorioService.gerarRelatorioPresenca(filtros);
      setRelatorios(dados);
      return { success: true, data: dados };
    } catch (err) {
      setError(err.message);
      return { success: false, error: err.message };
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Exporta relatório em CSV
   */
  const exportarCSV = useCallback(async (filtros = {}, nomeArquivo) => {
    setLoading(true);
    setError(null);

    try {
      const blob = await relatorioService.exportarCSV(filtros);
      relatorioService.downloadCSV(blob, nomeArquivo);
      return { success: true };
    } catch (err) {
      setError(err.message);
      return { success: false, error: err.message };
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Busca estatísticas do evento
   */
  const buscarEstatisticas = useCallback(async (eventoId) => {
    setLoading(true);
    setError(null);

    try {
      const dados = await relatorioService.estatisticasEvento(eventoId);
      return { success: true, data: dados };
    } catch (err) {
      setError(err.message);
      return { success: false, error: err.message };
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    relatorios,
    loading,
    error,
    gerarRelatorioPresenca,
    exportarCSV,
    buscarEstatisticas,
  };
};

export default useRelatorios;
