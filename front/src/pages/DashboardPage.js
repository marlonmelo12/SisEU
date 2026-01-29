// src/pages/DashboardPage.js
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Layout from '../components/layout/Layout';
import SessionCard from '../components/sessions/SessionCard';
import Button from '../components/ui/Button';
import Alert from '../components/ui/Alert';
import { useAuth } from '../hooks/useAuth';
import { useSessoes } from '../hooks/useSessoes';
import { FiPlus } from 'react-icons/fi';

/**
 * Dashboard principal - mostra sessões por perfil
 */
const DashboardPage = () => {
  const navigate = useNavigate();
  const { usuario, isAdmin } = useAuth();
  const { sessoes, loading, error, listarTodas, listarMinhas } = useSessoes();
  const [activeTab, setActiveTab] = useState('minhas');

  useEffect(() => {
    if (activeTab === 'minhas') {
      listarMinhas();
    } else {
      listarTodas();
    }
  }, [activeTab]);

  const handleSessionClick = (sessao) => {
    navigate(`/sessao/${sessao.id}`, { state: { sessao } });
  };

  const handleAddSession = () => {
    navigate('/sessao/nova');
  };

  const handleCheckin = () => {
    navigate('/presenca');
  };

  return (
    <Layout>
      {/* Banner de Check-in */}
      <div className="bg-gradient-to-r from-primary-500 to-primary-600 rounded-lg p-6 mb-8 shadow-lg">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="text-white">
            <h2 className="text-2xl font-bold mb-2">
              Registre sua presença
            </h2>
            <p className="text-primary-100">
              Faça check-in nas sessões como ouvinte ou apresentador
            </p>
          </div>
          <Button
            variant="secondary"
            size="lg"
            onClick={handleCheckin}
          >
            Fazer Check-in
          </Button>
        </div>
      </div>

      {/* Cabeçalho com tabs e ações */}
      <div className="mb-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-4">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            {isAdmin() ? 'Gerenciar Sessões' : 'Minhas Sessões'}
          </h1>

          {isAdmin() && (
            <Button
              variant="primary"
              onClick={handleAddSession}
              className="flex items-center gap-2"
            >
              <FiPlus size={20} />
              Adicionar Sessão
            </Button>
          )}
        </div>

        {/* Tabs */}
        <div className="flex gap-2 border-b border-gray-200 dark:border-gray-700">
          <button
            onClick={() => setActiveTab('minhas')}
            className={`px-4 py-2 font-medium transition-colors ${
              activeTab === 'minhas'
                ? 'text-primary-500 border-b-2 border-primary-500'
                : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'
            }`}
          >
            Minhas Sessões
          </button>
          <button
            onClick={() => setActiveTab('todas')}
            className={`px-4 py-2 font-medium transition-colors ${
              activeTab === 'todas'
                ? 'text-primary-500 border-b-2 border-primary-500'
                : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'
            }`}
          >
            Todas as Sessões
          </button>
        </div>
      </div>

      {/* Mensagens */}
      {error && (
        <Alert type="error" message={error} className="mb-6" />
      )}

      {/* Loading */}
      {loading && (
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500 mx-auto"></div>
          <p className="mt-4 text-gray-600 dark:text-gray-400">Carregando sessões...</p>
        </div>
      )}

      {/* Lista de Sessões */}
      {!loading && sessoes.length === 0 && (
        <div className="text-center py-12">
          <p className="text-gray-600 dark:text-gray-400 text-lg">
            Nenhuma sessão encontrada
          </p>
        </div>
      )}

      {!loading && sessoes.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {sessoes.map((sessao) => (
            <SessionCard
              key={sessao.id}
              sessao={sessao}
              onClick={() => handleSessionClick(sessao)}
            />
          ))}
        </div>
      )}
    </Layout>
  );
};

export default DashboardPage;