// src/pages/DashboardPage.js
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Layout from '../components/layout/Layout';
import ApresentacaoCard from '../components/ApresentacaoCard';
import SessionCard from '../components/sessions/SessionCard';
import Button from '../components/ui/Button';
import Alert from '../components/ui/Alert';
import { useAuth } from '../hooks/useAuth';
import { useSessoes } from '../hooks/useSessoes';
import apresentacaoService from '../services/apresentacaoService';
import { FiPlus } from 'react-icons/fi';

/**
 * Dashboard principal - mostra apresentações do usuário
 */
const DashboardPage = () => {
  const navigate = useNavigate();
  const { usuario, isAdmin } = useAuth();
  const [activeTab, setActiveTab] = useState('apresentacoes');
  const [apresentacoes, setApresentacoes] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const { sessoes, loading: loadingSessoes, listarTodas } = useSessoes();

  useEffect(() => {
    if (activeTab === 'apresentacoes') {
      carregarApresentacoes();
    } else {
      listarTodas();
    }
  }, [activeTab]);

  const carregarApresentacoes = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await apresentacaoService.minhasApresentacoes();
      setApresentacoes(data);
    } catch (err) {
      setError(err.message || 'Erro ao carregar apresentações');
    } finally {
      setLoading(false);
    }
  };

  const handleCheckin = () => {
    navigate('/presenca');
  };

  const handleSessionClick = (sessao) => {
    navigate(`/sessoes/${sessao.id}`);
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

      {/* Cabeçalho */}
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
          {activeTab === 'apresentacoes' ? 'Minhas Apresentações' : 'Todas as Sessões'}
        </h1>
        
        {/* Abas */}
        <div className="border-b border-gray-200 dark:border-gray-700">
          <nav className="-mb-px flex space-x-8">
            <button
              onClick={() => setActiveTab('apresentacoes')}
              className={`${
                activeTab === 'apresentacoes'
                  ? 'border-primary-500 text-primary-600 dark:text-primary-400'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300'
              } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm transition-colors`}
            >
              Minhas Apresentações
            </button>
            <button
              onClick={() => setActiveTab('sessoes')}
              className={`${
                activeTab === 'sessoes'
                  ? 'border-primary-500 text-primary-600 dark:text-primary-400'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300'
              } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm transition-colors`}
            >
              Todas as Sessões
            </button>
          </nav>
        </div>
      </div>

      {/* Mensagens */}
      {error && (
        <Alert type="error" message={error} className="mb-6" />
      )}

      {/* Loading */}
      {activeTab === 'apresentacoes' && loading && (
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500 mx-auto"></div>
          <p className="mt-4 text-gray-600 dark:text-gray-400">Carregando apresentações...</p>
        </div>
      )}

      {activeTab === 'sessoes' && loadingSessoes && (
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500 mx-auto"></div>
          <p className="mt-4 text-gray-600 dark:text-gray-400">Carregando sessões...</p>
        </div>
      )}

      {/* Lista de Apresentações */}
      {activeTab === 'apresentacoes' && !loading && apresentacoes.length === 0 && (
        <div className="text-center py-12">
          <p className="text-gray-600 dark:text-gray-400 text-lg">
            Você ainda não possui apresentações cadastradas
          </p>
        </div>
      )}

      {activeTab === 'apresentacoes' && !loading && apresentacoes.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {apresentacoes.map((apresentacao) => (
            <ApresentacaoCard
              key={apresentacao.id}
              apresentacao={apresentacao}
            />
          ))}
        </div>
      )}

      {/* Lista de Sessões */}
      {activeTab === 'sessoes' && !loadingSessoes && sessoes.length === 0 && (
        <div className="text-center py-12">
          <p className="text-gray-600 dark:text-gray-400 text-lg">
            Nenhuma sessão encontrada
          </p>
        </div>
      )}

      {activeTab === 'sessoes' && !loadingSessoes && sessoes.length > 0 && (
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