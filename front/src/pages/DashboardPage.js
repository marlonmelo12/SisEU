// src/pages/DashboardPage.js
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Layout from '../components/layout/Layout';
import SessionCard from '../components/sessions/SessionCard';
import Button from '../components/ui/Button';
import Loading from '../components/ui/Loading';
import Alert from '../components/ui/Alert';
import apresentacaoService from '../services/apresentacaoService';
import checkinService from '../services/checkinService';
import { useSessoes } from '../hooks/useSessoes';
import { useAuth } from '../hooks/useAuth';
import { FiCheckSquare, FiLogOut, FiCalendar, FiFileText } from 'react-icons/fi';

/**
 * Dashboard principal — Mobile-first
 * - Abas condicionais por perfil (RF002)
 * - Segmented control pill ao invés de abas com borda inferior
 * - Banner de presença redesenhado para mobile
 */
const DashboardPage = () => {
  const navigate = useNavigate();
  const { usuario } = useAuth();
  const { sessoes, loading: loadingSessoes, error: errorSessoes, listarTodas } = useSessoes();

  const [apresentacoes, setApresentacoes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('sessoes');
  const [checkinAtivo, setCheckinAtivo] = useState(null);

  const isProfessorOuAvaliador =
    usuario?.tipoUsuario === 'PROFESSOR' || usuario?.tipoUsuario === 'AVALIADOR';
  const isEstudante =
    usuario?.tipoUsuario === 'ESTUDANTE';

  useEffect(() => {
    carregarApresentacoes();
    carregarCheckinAtivo();
    listarTodas();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const carregarCheckinAtivo = async () => {
    try {
      const active = await checkinService.buscarCheckinAtivo();
      setCheckinAtivo(active);
    } catch (err) {
      console.warn('Nenhum check-in ativo encontrado:', err);
    }
  };

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

  const handleAcaoPresenca = () => {
    if (checkinAtivo) {
      navigate('/presenca/checkout/geolocalizacao');
    } else {
      navigate('/presenca');
    }
  };

  const handleSessionClick = (sessao) => {
    navigate(`/sessao/${sessao.id}`);
  };

  // Abas disponíveis conforme perfil (RF002)
  const tabs = [
    { id: 'sessoes', label: 'Sessões', icon: FiCalendar },
    ...(isEstudante
      ? [{ id: 'apresentacoes', label: 'Minhas Apresentações', icon: FiFileText }]
      : []),
    ...(isProfessorOuAvaliador
      ? [{ id: 'avaliacoes', label: 'Avaliações', icon: FiFileText }]
      : []),
  ];

  return (
    <Layout>
      {/* ── Banner de Presença Dinâmico — Visível APENAS para ESTUDANTE ────────────────── */}
      {isEstudante && (
        checkinAtivo ? (
          <div className="bg-gradient-to-r from-amber-500 to-amber-600 rounded-2xl p-4 sm:p-5 mb-5 shadow-lg text-white">
            <div className="flex items-start gap-3 mb-3">
              <div className="p-2 bg-white/20 rounded-xl">
                <FiCheckSquare size={22} />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-0.5">
                  <span className="relative flex h-2.5 w-2.5">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-300 opacity-75" />
                    <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-400" />
                  </span>
                  <span className="text-[11px] font-bold uppercase tracking-wider opacity-90">
                    Check-in Ativo
                  </span>
                </div>
                <p className="font-bold text-base leading-tight">Presença confirmada!</p>
                <p className="text-amber-100 text-xs mt-0.5 leading-snug">
                  Não esqueça de registrar o Check-out ao sair.
                </p>
              </div>
            </div>
            <Button
              onClick={handleAcaoPresenca}
              className="w-full bg-white text-amber-800 hover:bg-amber-50 font-bold border-none justify-center text-sm"
            >
              <FiLogOut size={16} />
              Realizar Check-out
            </Button>
          </div>
        ) : (
          <div className="bg-gradient-to-r from-primary-500 to-primary-600 rounded-2xl p-4 sm:p-5 mb-5 shadow-lg text-white">
            <div className="flex items-start gap-3 mb-3">
              <div className="p-2 bg-white/20 rounded-xl">
                <FiCheckSquare size={22} />
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-bold text-base leading-tight">Registrar Presença</p>
                <p className="text-primary-100 text-xs mt-0.5 leading-snug">
                  Use PIN ou QR Code para confirmar sua entrada no evento.
                </p>
              </div>
            </div>
            <Button
              onClick={handleAcaoPresenca}
              className="w-full bg-white text-primary-700 hover:bg-primary-50 font-bold border-none justify-center text-sm"
            >
              <FiCheckSquare size={16} />
              Fazer Check-in
            </Button>
          </div>
        )
      )}

      {/* ── Segmented Control (Abas) ──────────────────────────────── */}
      {tabs.length > 1 && (
        <div className="bg-gray-100 dark:bg-gray-800 rounded-2xl p-1 mb-5 flex gap-1">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => {
                setActiveTab(tab.id);
                if (tab.id === 'avaliacoes') navigate('/minhas-avaliacoes');
              }}
              className={`flex-1 flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl text-xs font-semibold transition-all duration-200 ${
                activeTab === tab.id
                  ? 'bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm'
                  : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200'
              }`}
            >
              <tab.icon size={14} />
              <span className="leading-none">{tab.label}</span>
            </button>
          ))}
        </div>
      )}

      {/* ── Alertas ──────────────────────────────────────────────── */}
      {error && <Alert type="error" message={error} className="mb-4" />}
      {errorSessoes && <Alert type="error" message={errorSessoes} className="mb-4" />}

      {/* ── Conteúdo da aba ──────────────────────────────────────── */}
      {activeTab === 'apresentacoes' ? (
        loading ? (
          <Loading message="Carregando suas apresentações..." />
        ) : apresentacoes.length === 0 ? (
          <div className="text-center py-12 bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 p-6">
            <FiFileText className="mx-auto text-gray-300 dark:text-gray-600 mb-3" size={40} />
            <p className="text-gray-500 dark:text-gray-400 text-sm mb-1 font-medium">
              Nenhuma apresentação cadastrada
            </p>
            <p className="text-xs text-gray-400">
              Entre em contato com a coordenação caso acredite ser um engano.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-5">
            {apresentacoes.map((apresentacao) => (
              <div
                key={apresentacao.id}
                className="bg-white dark:bg-gray-800 rounded-2xl p-4 shadow-sm border border-gray-200 dark:border-gray-700 hover:shadow-md transition-all active:scale-[0.99]"
              >
                <span className="text-xs font-semibold text-primary-600 dark:text-primary-400 bg-primary-50 dark:bg-primary-900/30 px-2.5 py-1 rounded-lg">
                  {apresentacao.modalidade || 'Apresentação'}
                </span>
                <h3 className="font-bold text-sm text-gray-900 dark:text-white mt-3 mb-2 line-clamp-2 leading-snug">
                  {apresentacao.titulo}
                </h3>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  <strong>Autor:</strong> {apresentacao.autor?.nome || usuario?.nome}
                </p>
                {apresentacao.orientador && (
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                    <strong>Orientador:</strong> {apresentacao.orientador?.nome}
                  </p>
                )}
              </div>
            ))}
          </div>
        )
      ) : (
        loadingSessoes ? (
          <Loading message="Carregando sessões..." />
        ) : sessoes.length === 0 ? (
          <div className="text-center py-12 bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 p-6">
            <FiCalendar className="mx-auto text-gray-300 dark:text-gray-600 mb-3" size={40} />
            <p className="text-gray-500 dark:text-gray-400 text-sm font-medium">
              Nenhuma sessão cadastrada no momento.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-5">
            {sessoes.map((sessao) => (
              <SessionCard
                key={sessao.id}
                sessao={sessao}
                onClick={() => handleSessionClick(sessao)}
              />
            ))}
          </div>
        )
      )}
    </Layout>
  );
};

export default DashboardPage;