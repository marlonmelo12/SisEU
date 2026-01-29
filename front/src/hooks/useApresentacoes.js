// src/hooks/useApresentacoes.js
import { useState, useCallback } from 'react';
import apresentacaoService from '../services/apresentacaoService';

/**
 * Hook de Apresentações (Controller)
 */
export const useApresentacoes = () => {
  const [apresentacoes, setApresentacoes] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  /**
   * Busca minhas apresentações
   */
  const buscarMinhas = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const dados = await apresentacaoService.minhasApresentacoes();
      setApresentacoes(dados);
      return { success: true, data: dados };
    } catch (err) {
      setError(err.message);
      return { success: false, error: err.message };
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Cria apresentação
   */
  const criar = useCallback(async (eventoId, dados) => {
    setLoading(true);
    setError(null);

    try {
      const novaApresentacao = await apresentacaoService.criar(eventoId, dados);
      setApresentacoes((prev) => [...prev, novaApresentacao]);
      return { success: true, data: novaApresentacao };
    } catch (err) {
      setError(err.message);
      return { success: false, error: err.message };
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Atualiza apresentação
   */
  const atualizar = useCallback(async (id, dados) => {
    setLoading(true);
    setError(null);

    try {
      const apresentacaoAtualizada = await apresentacaoService.atualizar(id, dados);
      setApresentacoes((prev) =>
        prev.map((a) => (a.id === id ? apresentacaoAtualizada : a))
      );
      return { success: true, data: apresentacaoAtualizada };
    } catch (err) {
      setError(err.message);
      return { success: false, error: err.message };
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Deleta apresentação
   */
  const deletar = useCallback(async (id) => {
    setLoading(true);
    setError(null);

    try {
      await apresentacaoService.deletar(id);
      setApresentacoes((prev) => prev.filter((a) => a.id !== id));
      return { success: true };
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
      const dados = await apresentacaoService.buscarPorId(id);
      return { success: true, data: dados };
    } catch (err) {
      setError(err.message);
      return { success: false, error: err.message };
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Lista por evento
   */
  const listarPorEvento = useCallback(async (eventoId) => {
    setLoading(true);
    setError(null);

    try {
      const dados = await apresentacaoService.listarPorEvento(eventoId);
      setApresentacoes(dados);
      return { success: true, data: dados };
    } catch (err) {
      setError(err.message);
      return { success: false, error: err.message };
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    apresentacoes,
    loading,
    error,
    buscarMinhas,
    criar,
    atualizar,
    deletar,
    buscarPorId,
    listarPorEvento,
  };
};

export default useApresentacoes;
