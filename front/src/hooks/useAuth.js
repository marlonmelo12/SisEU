// src/hooks/useAuth.js
import { useState, useEffect, useCallback } from 'react';
import authService from '../services/authService';
import { useNavigate } from 'react-router-dom';

/**
 * Hook de autenticação (Controller)
 */
export const useAuth = () => {
  const [usuario, setUsuario] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  // Carrega usuário do localStorage ao montar
  useEffect(() => {
    const usuarioLogado = authService.getUsuarioLogado();
    setUsuario(usuarioLogado);
    setLoading(false);
  }, []);

  /**
   * Realiza login
   */
  const login = useCallback(async (cpf, senha) => {
    setLoading(true);
    setError(null);
    
    console.log('[HOOK] Iniciando login com CPF:', cpf);
    
    try {
      const responseData = await authService.login(cpf, senha);
      console.log('[HOOK] Resposta completa do authService:', responseData);
      
      const { usuario: usuarioData } = responseData;
      console.log('[HOOK] Dados do usuário:', usuarioData);
      
      setUsuario(usuarioData);

      // Redireciona baseado no tipo de usuário
      switch (usuarioData?.tipoUsuario) {
        case 'ADMINISTRADOR':
          navigate('/admin');
          break;
        case 'PROFESSOR':
        case 'AVALIADOR':
          navigate('/avaliacoes');
          break;
        case 'ESTUDANTE':
          navigate('/dashboard');
          break;
        default:
          navigate('/dashboard');
      }

      return { success: true };
    } catch (err) {
      console.error('[HOOK] Erro no login:', err);
      setError(err.message);
      return { success: false, error: err.message };
    } finally {
      setLoading(false);
    }
  }, [navigate]);

  /**
   * Realiza logout
   */
  const logout = useCallback(() => {
    authService.logout();
    setUsuario(null);
    navigate('/');
  }, [navigate]);

  /**
   * Verifica se está autenticado
   */
  const isAuthenticated = useCallback(() => {
    return authService.isAuthenticated();
  }, []);

  /**
   * Verifica se é admin
   */
  const isAdmin = useCallback(() => {
    return authService.isAdmin();
  }, []);

  /**
   * Verifica se é avaliador
   */
  const isAvaliador = useCallback(() => {
    return authService.isAvaliador();
  }, []);

  /**
   * Verifica se é estudante
   */
  const isEstudante = useCallback(() => {
    return authService.isEstudante();
  }, []);

  // Mantém compatibilidade com código antigo
  const isReady = !loading;
  const userProfile = usuario?.tipoUsuario || null;

  return {
    usuario,
    loading,
    error,
    login,
    logout,
    isAuthenticated: isAuthenticated(),
    isAdmin,
    isAvaliador,
    isEstudante,
    // Compatibilidade
    isReady,
    userProfile,
  };
};

export default useAuth;
