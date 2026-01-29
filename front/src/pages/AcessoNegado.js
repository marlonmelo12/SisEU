// src/pages/AcessoNegado.js
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { FiAlertTriangle, FiArrowLeft } from 'react-icons/fi';
import Layout from '../components/layout/Layout';
import Button from '../components/ui/Button';
import { useAuth } from '../hooks/useAuth';

const AcessoNegado = () => {
  const navigate = useNavigate();
  const { usuario } = useAuth();

  const handleVoltar = () => {
    // Redireciona para a página apropriada baseado no tipo de usuário
    switch (usuario?.tipoUsuario) {
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
        navigate('/');
    }
  };

  return (
    <Layout>
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center max-w-md mx-auto p-8">
          <div className="mb-6">
            <FiAlertTriangle className="mx-auto text-red-500 w-20 h-20" />
          </div>
          
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
            Acesso Negado
          </h1>
          
          <p className="text-gray-600 dark:text-gray-400 mb-8">
            Você não tem permissão para acessar esta página. 
            Esta funcionalidade está disponível apenas para usuários com permissões específicas.
          </p>
          
          <Button
            variant="primary"
            size="lg"
            onClick={handleVoltar}
            className="inline-flex items-center gap-2"
          >
            <FiArrowLeft />
            Voltar para o início
          </Button>
        </div>
      </div>
    </Layout>
  );
};

export default AcessoNegado;
