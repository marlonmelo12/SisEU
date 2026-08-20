// src/context/AuthContext.js
import React, { createContext, useState, useEffect, useCallback } from 'react';
import authService from '../services/authService';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [usuario, setUsuario] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Inicializa o usuário a partir do localStorage
  useEffect(() => {
    try {
      const usuarioLogado = authService.getUsuarioLogado();
      setUsuario(usuarioLogado);
    } catch (err) {
      console.error('[AUTH-CONTEXT] Erro ao carregar usuário:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  const login = useCallback(async (cpf, senha) => {
    setLoading(true);
    setError(null);
    try {
      const responseData = await authService.login(cpf, senha);
      const { usuario: usuarioData } = responseData;
      setUsuario(usuarioData);
      return { success: true, usuario: usuarioData };
    } catch (err) {
      const msg = err.message || 'Erro ao realizar login';
      setError(msg);
      return { success: false, error: msg };
    } finally {
      setLoading(false);
    }
  }, []);

  const logout = useCallback(() => {
    authService.logout();
    setUsuario(null);
    setError(null);
  }, []);

  const isAuthenticated = !!usuario && authService.isAuthenticated();

  const isAdmin = useCallback(() => {
    return usuario?.tipoUsuario === 'ADMINISTRADOR';
  }, [usuario]);

  const isAvaliador = useCallback(() => {
    return usuario?.tipoUsuario === 'AVALIADOR';
  }, [usuario]);

  const isEstudante = useCallback(() => {
    return usuario?.tipoUsuario === 'ESTUDANTE';
  }, [usuario]);

  const value = {
    usuario,
    loading,
    error,
    login,
    logout,
    isAuthenticated,
    isAdmin,
    isAvaliador,
    isEstudante,
    isReady: !loading,
    userProfile: usuario?.tipoUsuario || null,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export default AuthContext;
