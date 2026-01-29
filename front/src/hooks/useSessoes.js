// src/hooks/useSessoes.js
import { useState, useCallback, useEffect } from 'react';
import sessaoService from '../services/sessaoService';

/**
 * Hook de Sessões (Controller)
 */
export const useSessoes = () => {
  const [sessoes, setSessoes] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  /**
   * Lista todas as sessões
   */
  const listarTodas = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const dados = await sessaoService.listarTodas();
      setSessoes(dados);
      return { success: true, data: dados };
    } catch (err) {
      setError(err.message);
      return { success: false, error: err.message };
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Lista minhas sessões
   */
  const listarMinhas = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const dados = await sessaoService.minhasSessoes();
      setSessoes(dados);
      return { success: true, data: dados };
    } catch (err) {
      setError(err.message);
      return { success: false, error: err.message };
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Busca sessão por ID
   */
  const buscarPorId = useCallback(async (id) => {
    setLoading(true);
    setError(null);

    try {
      const dados = await sessaoService.buscarPorId(id);
      return { success: true, data: dados };
    } catch (err) {
      setError(err.message);
      return { success: false, error: err.message };
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Cria nova sessão
   */
  const criar = useCallback(async (dados) => {
    setLoading(true);
    setError(null);

    try {
      const novaSessao = await sessaoService.criar(dados);
      setSessoes((prev) => [...prev, novaSessao]);
      return { success: true, data: novaSessao };
    } catch (err) {
      setError(err.message);
      return { success: false, error: err.message };
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Atualiza sessão
   */
  const atualizar = useCallback(async (id, dados) => {
    setLoading(true);
    setError(null);

    try {
      const sessaoAtualizada = await sessaoService.atualizar(id, dados);
      setSessoes((prev) =>
        prev.map((s) => (s.id === id ? sessaoAtualizada : s))
      );
      return { success: true, data: sessaoAtualizada };
    } catch (err) {
      setError(err.message);
      return { success: false, error: err.message };
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Deleta sessão
   */
  const deletar = useCallback(async (id) => {
    setLoading(true);
    setError(null);

    try {
      await sessaoService.deletar(id);
      setSessoes((prev) => prev.filter((s) => s.id !== id));
      return { success: true };
    } catch (err) {
      setError(err.message);
      return { success: false, error: err.message };
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Verifica se pode editar sessão
   */
  const podeEditar = useCallback((dataInicio) => {
    return sessaoService.podeEditar(dataInicio);
  }, []);

  return {
    sessoes,
    loading,
    error,
    listarTodas,
    listarMinhas,
    buscarPorId,
    criar,
    atualizar,
    deletar,
    podeEditar,
  };
};

export default useSessoes;
