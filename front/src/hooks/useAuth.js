// src/hooks/useAuth.js
import { useContext, useCallback } from 'react';
import { AuthContext } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

/**
 * Hook de autenticação que consome o AuthContext global
 */
export const useAuth = () => {
  const context = useContext(AuthContext);
  const navigate = useNavigate();

  if (!context) {
    throw new Error('useAuth deve ser usado dentro de um AuthProvider');
  }

  const {
    usuario,
    loading,
    error,
    login: contextLogin,
    logout: contextLogout,
    isAuthenticated,
    isAdmin,
    isAvaliador,
    isEstudante,
    isReady,
    userProfile,
  } = context;

  /**
   * Realiza login e redireciona baseado no tipo de usuário
   */
  const login = useCallback(
    async (cpf, senha) => {
      const result = await contextLogin(cpf, senha);

      if (result.success && result.usuario) {
        switch (result.usuario.tipoUsuario) {
          case 'ADMINISTRADOR':
            navigate('/admin');
            break;
          case 'PROFESSOR':
          case 'AVALIADOR':
            navigate('/avaliacoes');
            break;
          case 'ESTUDANTE':
          default:
            navigate('/dashboard');
            break;
        }
      }

      return result;
    },
    [contextLogin, navigate]
  );

  /**
   * Realiza logout e redireciona para a página inicial
   */
  const logout = useCallback(() => {
    contextLogout();
    navigate('/');
  }, [contextLogout, navigate]);

  return {
    usuario,
    loading,
    error,
    login,
    logout,
    isAuthenticated,
    isAdmin,
    isAvaliador,
    isEstudante,
    isReady,
    userProfile,
  };
};

export default useAuth;
