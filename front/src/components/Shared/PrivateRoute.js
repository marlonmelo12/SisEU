// src/components/Shared/PrivateRoute.js

import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import AcessoNegado from '../../pages/AcessoNegado';

/**
 * Componente de proteção de rotas
 * @param {Object} props
 * @param {React.ReactElement} props.element - Elemento a ser renderizado
 * @param {string|string[]} props.allowedRoles - Role(s) permitida(s) para acessar a rota
 */
const PrivateRoute = ({ element, allowedRoles }) => {
  const { isAuthenticated, usuario, loading } = useAuth();
  
  // Aguarda carregamento da autenticação
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500"></div>
      </div>
    );
  }

  // Redireciona para login se não autenticado
  if (!isAuthenticated) {
    return <Navigate to="/" replace />;
  }

  // Verifica permissões se allowedRoles foi especificado
  if (allowedRoles) {
    const roles = Array.isArray(allowedRoles) ? allowedRoles : [allowedRoles];
    const userRole = usuario?.tipoUsuario;
    
    if (!roles.includes(userRole)) {
      // Mostra página de acesso negado
      return <AcessoNegado />;
    }
  }

  return element;
};

export default PrivateRoute;