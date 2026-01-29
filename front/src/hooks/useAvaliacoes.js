// src/hooks/useAvaliacoes.js
import { useState, useCallback } from 'react';
import avaliacaoService from '../services/avaliacaoService';

/**
 * Hook de Avaliações (Controller)
 */
export const useAvaliacoes = () => {
  const [avaliacoes, setAvaliacoes] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  /**
   * Busca minhas avaliações
   */
  const buscarMinhas = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const dados = await avaliacaoService.minhasAvaliacoes();
      setAvaliacoes(dados);
      return { success: true, data: dados };
    } catch (err) {
      setError(err.message);
      return { success: false, error: err.message };
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Inicia avaliação
   */
  const iniciar = useCallback(async (apresentacaoId) => {
    setLoading(true);
    setError(null);

    try {
      const avaliacao = await avaliacaoService.iniciar(apresentacaoId);
      setAvaliacoes((prev) => [...prev, avaliacao]);
      return { success: true, data: avaliacao };
    } catch (err) {
      setError(err.message);
      return { success: false, error: err.message };
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Envia avaliação
   */
  const enviar = useCallback(async (avaliacaoId, nota, parecer) => {
    setLoading(true);
    setError(null);

    try {
      const avaliacaoEnviada = await avaliacaoService.enviar({
        avaliacaoId,
        nota,
        parecer,
      });
      
      setAvaliacoes((prev) =>
        prev.map((a) => (a.id === avaliacaoId ? avaliacaoEnviada : a))
      );
      
      return { success: true, data: avaliacaoEnviada };
    } catch (err) {
      setError(err.message);
      return { success: false, error: err.message };
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Busca por ID
   */
  const buscarPorId = useCallback(async (id) => {
    setLoading(true);
    setError(null);

    try {
      const dados = await avaliacaoService.buscarPorId(id);
      return { success: true, data: dados };
    } catch (err) {
      setError(err.message);
      return { success: false, error: err.message };
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Lista por apresentação
   */
  const listarPorApresentacao = useCallback(async (apresentacaoId) => {
    setLoading(true);
    setError(null);

    try {
      const dados = await avaliacaoService.listarPorApresentacao(apresentacaoId);
      return { success: true, data: dados };
    } catch (err) {
      setError(err.message);
      return { success: false, error: err.message };
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    avaliacoes,
    loading,
    error,
    buscarMinhas,
    iniciar,
    enviar,
    buscarPorId,
    listarPorApresentacao,
  };
};

export default useAvaliacoes;
