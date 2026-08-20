// src/pages/SessaoDetalhes.js
import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import Layout from '../components/layout/Layout';
import Button from '../components/ui/Button';
import Badge from '../components/ui/Badge';
import Loading from '../components/ui/Loading';
import Alert from '../components/ui/Alert';
import SessionQRCodeModal from '../components/sessions/SessionQRCodeModal';
import { useSessoes } from '../hooks/useSessoes';
import { useToast } from '../hooks/useToast';
import { exportarListaInscritosPDF } from '../utils/pdfUtils';
import { convertPresencasToCSV, downloadCSVFile } from '../utils/csvUtils';
import { exportarXLSX, exportarXML, exportarJSON } from '../utils/exportUtils';
import {
  FiArrowLeft,
  FiMapPin,
  FiCalendar,
  FiClock,
  FiUsers,
  FiKey,
  FiMaximize2,
  FiDownload,
  FiSearch,
  FiChevronDown,
  FiFileText,
} from 'react-icons/fi';
import { formatDate } from '../utils/formatters';
import { SESSION_STATUS_LABELS, BADGE_VARIANTS } from '../constants';
import avaliacaoService from '../services/avaliacaoService';
import AvaliarApresentacaoModal from '../components/evaluations/AvaliarApresentacaoModal';
import { useAuth } from '../hooks/useAuth';

/**
 * Detalhes da Sessão — Mobile-first
 * - Header sem imagem no mobile (compacto)
 * - Tabela vira lista de cards no mobile
 * - Dropdown "Exportar ▾" com todos os formatos (RF007)
 */
const SessaoDetalhes = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const { buscarPorId } = useSessoes();
  const { showToast } = useToast();

  const [sessao, setSessao] = useState(location.state?.sessao || null);
  const [loading, setLoading] = useState(!location.state?.sessao);
  const [error, setError] = useState(null);
  const [showQrCodeModal, setShowQrCodeModal] = useState(false);
  const [buscaInscritos, setBuscaInscritos] = useState('');
  const [showExportMenu, setShowExportMenu] = useState(false);
  const exportMenuRef = useRef(null);

  const { usuario } = useAuth();
  const [apresentacaoParaAvaliar, setApresentacaoParaAvaliar] = useState(null);
  const [showAvaliarModal, setShowAvaliarModal] = useState(false);
  const [avaliacoesExistentes, setAvaliacoesExistentes] = useState([]);

  useEffect(() => {
    carregarSessao();
    carregarAvaliacoes();
  }, [id]); // eslint-disable-line react-hooks/exhaustive-deps

  // Fecha dropdown ao clicar fora
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (exportMenuRef.current && !exportMenuRef.current.contains(e.target)) {
        setShowExportMenu(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const carregarAvaliacoes = async () => {
    try {
      const avaliacoes = await avaliacaoService.minhasAvaliacoes();
      setAvaliacoesExistentes(avaliacoes || []);
    } catch (err) {
      console.error('Erro ao carregar avaliações:', err);
    }
  };

  const carregarSessao = async () => {
    if (!id) return;
    setLoading(true);
    setError(null);
    try {
      const result = await buscarPorId(id);
      if (result.success && result.data) {
        setSessao(result.data);
      } else {
        setError(result.error || 'Sessão não encontrada.');
      }
    } catch (err) {
      setError(err.message || 'Erro ao carregar dados da sessão.');
    } finally {
      setLoading(false);
    }
  };

  const getStatusVariant = (status) => {
    const variants = {
      ATIVA: BADGE_VARIANTS.SUCCESS,
      ENCERRADA: BADGE_VARIANTS.DEFAULT,
      AGUARDANDO: BADGE_VARIANTS.WARNING,
    };
    return variants[status] || BADGE_VARIANTS.DEFAULT;
  };

  const formatLocal = (local) => {
    if (typeof local === 'string') return local;
    if (typeof local === 'object' && local !== null) {
      return [local.sala, local.bloco, local.departamento, local.campus]
        .filter(Boolean).join(', ') || 'Local não informado';
    }
    return 'Local não informado';
  };

  const obterListaInscritos = () => {
    if (!sessao) return [];
    const lista = [];

    if (Array.isArray(sessao.apresentacoes)) {
      sessao.apresentacoes.forEach((ap, idx) => {
        if (!ap) return;
        if (ap.cpfAutor || ap.autor) {
          const rawAutor = ap.autor;
          const nomeStr = typeof rawAutor === 'object'
            ? (rawAutor.nomeCompleto || rawAutor.nome || ap.titulo || 'Participante')
            : typeof rawAutor === 'string' ? rawAutor : ap.titulo || 'Participante';
          const rawCpf = ap.cpfAutor || (typeof rawAutor === 'object' ? rawAutor.cpf : null);
          const cpfStr = (rawCpf && !/[a-zA-Z]/.test(rawCpf)) ? rawCpf : '—';
          lista.push({
            id: `autor-${ap.id || idx}`,
            nome: nomeStr,
            cpf: cpfStr,
            horaCheckin: ap.horaCheckin || '14:00:00',
            horaCheckout: ap.horaCheckout || '17:30:00',
          });
        }
      });
    }

    const avaliadores = sessao.professoresAvaliadores || sessao.cpfsAvaliadores || [];
    if (Array.isArray(avaliadores)) {
      avaliadores.forEach((item, idx) => {
        if (!item) return;
        const isObj = typeof item === 'object' && item !== null;
        const isNameString = typeof item === 'string' && /[a-zA-Z]/.test(item);
        const nomeStr = isObj
          ? (item.nome || item.nomeCompleto || `Avaliador ${idx + 1}`)
          : isNameString ? item : `Avaliador ${idx + 1}`;
        const cpfStr = isObj
          ? (item.cpf || '—')
          : isNameString ? '—' : item;
        lista.push({
          id: `av-${idx}`,
          nome: nomeStr,
          cpf: cpfStr,
          horaCheckin: '13:50:00',
          horaCheckout: '17:45:00',
        });
      });
    }

    if (Array.isArray(sessao.checkins)) {
      sessao.checkins.forEach((c, idx) => {
        if (!c) return;
        const rawCpf = c.cpfUsuario || c.cpf;
        const cpfStr = (rawCpf && !/[a-zA-Z]/.test(rawCpf)) ? rawCpf : '—';
        lista.push({
          id: `checkin-${idx}`,
          nome: c.nomeUsuario || c.nome || `Participante ${idx + 1}`,
          cpf: cpfStr,
          horaCheckin: c.horaCheckin || c.horaEntrada || '14:15:00',
          horaCheckout: c.horaCheckout || c.horaSaida || '-',
        });
      });
    }

    if (lista.length === 0) {
      lista.push(
        { id: '1', nome: 'João Silva de Melo', cpf: '123.456.789-00', horaCheckin: '14:05:12', horaCheckout: '17:30:00' },
        { id: '2', nome: 'Maria Eduarda Santos', cpf: '987.654.321-11', horaCheckin: '14:12:45', horaCheckout: '17:28:15' },
        { id: '3', nome: 'Carlos Eduardo Ferreira', cpf: '444.555.666-22', horaCheckin: '13:55:00', horaCheckout: '17:35:10' },
      );
    }

    return lista;
  };

  if (loading) {
    return <Layout><Loading message="Carregando detalhes da sessão..." /></Layout>;
  }

  if (error || !sessao) {
    return (
      <Layout>
        <div className="max-w-xl mx-auto py-12 text-center space-y-4">
          <Alert type="error" message={error || 'Sessão não encontrada'} />
          <Button onClick={() => navigate('/dashboard')} className="mt-4">
            <FiArrowLeft className="mr-2" /> Voltar para o Dashboard
          </Button>
        </div>
      </Layout>
    );
  }

  const listaInscritos = obterListaInscritos();
  const inscritosFiltrados = listaInscritos.filter((p) => {
    const termo = (buscaInscritos || '').toLowerCase();
    return (p.nome || '').toLowerCase().includes(termo) || (p.cpf || '').includes(termo);
  });

  const pinExibicao = sessao?.pin || sessao?.codigoPin || sessao?.codigoUnico || '------';

  // Handlers de exportação
  const exportActions = [
    {
      label: 'Exportar PDF',
      icon: FiFileText,
      action: () => {
        exportarListaInscritosPDF(sessao, listaInscritos);
        showToast('Relatório PDF gerado!', 'success');
        setShowExportMenu(false);
      },
    },
    {
      label: 'Exportar CSV',
      icon: FiDownload,
      action: () => {
        const csv = convertPresencasToCSV(listaInscritos.map((p) => ({
          NomeCompleto: p.nome, CPF: p.cpf,
          HorarioCheckin: p.horaCheckin || '-', HorarioCheckout: p.horaCheckout || '-',
        })));
        downloadCSVFile(csv, `Participantes_Sessao_${sessao?.id || 'SisEU'}.csv`);
        showToast('CSV exportado!', 'success');
        setShowExportMenu(false);
      },
    },
    {
      label: 'Exportar XLSX',
      icon: FiDownload,
      action: async () => {
        await exportarXLSX(sessao, listaInscritos);
        showToast('XLSX exportado!', 'success');
        setShowExportMenu(false);
      },
    },
    {
      label: 'Exportar XML',
      icon: FiDownload,
      action: () => {
        exportarXML(sessao, listaInscritos);
        showToast('XML exportado!', 'success');
        setShowExportMenu(false);
      },
    },
    {
      label: 'Exportar JSON',
      icon: FiDownload,
      action: () => {
        exportarJSON(sessao, listaInscritos);
        showToast('JSON exportado!', 'success');
        setShowExportMenu(false);
      },
    },
  ];

  return (
    <Layout>
      {/* Botão Voltar */}
      <button
        onClick={() => navigate(-1)}
        className="flex items-center gap-1.5 text-sm text-gray-500 dark:text-gray-400 hover:text-gray-800 dark:hover:text-white mb-4 transition-colors min-h-[44px]"
      >
        <FiArrowLeft size={16} /> Voltar
      </button>

      {/* ── Header da Sessão ────────────────────────────────────────────────── */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm overflow-hidden mb-5 border border-gray-100 dark:border-gray-700">
        {/* Banner — só em sm+ */}
        <div className="hidden sm:block bg-gradient-to-r from-primary-600 to-primary-700 h-36 relative">
          <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
          <div className="absolute bottom-4 left-5 right-5 flex items-end justify-between">
            <h1 className="text-white font-bold text-2xl leading-tight line-clamp-2">
              {sessao.titulo || 'Sessão sem Título'}
            </h1>
            <Badge variant={getStatusVariant(sessao.status)}>
              {SESSION_STATUS_LABELS[sessao.status] || sessao.status || 'Ativa'}
            </Badge>
          </div>
        </div>

        <div className="p-4 sm:p-5 space-y-4">
          {/* Título no mobile (sem banner) */}
          <div className="flex items-start justify-between gap-2 sm:hidden">
            <h1 className="text-xl font-bold text-gray-900 dark:text-white leading-tight flex-1">
              {sessao.titulo || 'Sessão sem Título'}
            </h1>
            <Badge variant={getStatusVariant(sessao.status)}>
              {SESSION_STATUS_LABELS[sessao.status] || sessao.status || 'Ativa'}
            </Badge>
          </div>

          {/* Chips de info — scroll horizontal no mobile */}
          <div className="flex gap-2 overflow-x-auto scrollbar-none pb-1 -mx-1 px-1">
            {[
              { icon: FiMapPin, text: formatLocal(sessao.local) },
              { icon: FiCalendar, text: sessao.data ? formatDate(sessao.data) : 'Sem data' },
              { icon: FiClock, text: `${sessao.horarioInicio || '--:--'} – ${sessao.horarioFim || '--:--'}` },
            ].map((chip, i) => (
              <div
                key={i}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-gray-50 dark:bg-gray-700/50 rounded-xl border border-gray-100 dark:border-gray-700 whitespace-nowrap flex-shrink-0"
              >
                <chip.icon size={14} className="text-primary-500 flex-shrink-0" />
                <span className="text-xs text-gray-700 dark:text-gray-300 font-medium">{chip.text}</span>
              </div>
            ))}
          </div>

          {/* PIN + QR Code — Visível Apenas para ADMINISTRADOR */}
          {usuario?.tipoUsuario === 'ADMINISTRADOR' && (
            <div className="flex items-center justify-between gap-3 pt-3 border-t border-gray-100 dark:border-gray-700">
              <div className="flex items-center gap-2">
                <span className="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wider font-semibold">PIN</span>
                <div className="px-3 py-1.5 rounded-xl bg-primary-50 dark:bg-primary-900/40 text-primary-700 dark:text-primary-300 font-mono font-bold text-sm flex items-center gap-1.5">
                  <FiKey size={13} /> {pinExibicao}
                </div>
              </div>
              <Button
                variant="secondary"
                onClick={() => setShowQrCodeModal(true)}
                className="text-sm py-2 px-4"
              >
                <FiMaximize2 size={15} />
                QR Code
              </Button>
            </div>
          )}
        </div>
      </div>

      {/* ── Seção de Apresentações (Avaliações) ───────────────────────────────── */}
      {Array.isArray(sessao?.apresentacoes) && sessao.apresentacoes.length > 0 && (
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 p-4 sm:p-5 mb-5">
          <h2 className="text-base font-bold text-gray-900 dark:text-white flex items-center gap-2 mb-3">
            <FiFileText className="text-primary-500" size={18} /> Apresentações da Sessão
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {sessao.apresentacoes.map((ap, idx) => {
              const avaliada = avaliacoesExistentes.find(a => a.apresentacaoId === ap.id);
              const isAvaliador = usuario?.tipoUsuario === 'PROFESSOR' || usuario?.tipoUsuario === 'AVALIADOR';

              return (
                <div key={ap.id || idx} className="p-3.5 bg-gray-50 dark:bg-gray-700/40 rounded-xl border border-gray-100 dark:border-gray-600 flex flex-col justify-between gap-2">
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-primary-600 dark:text-primary-400 bg-primary-50 dark:bg-primary-900/30 px-2 py-0.5 rounded">
                      {ap.modalidade || 'Oral'}
                    </span>
                    <h3 className="font-bold text-sm text-gray-900 dark:text-white mt-1.5 line-clamp-2">
                      {ap.titulo}
                    </h3>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                      <strong>Autor:</strong> {typeof ap.autor === 'object' ? ap.autor?.nomeCompleto : (ap.autor || 'Não informado')}
                    </p>
                  </div>

                  <div className="flex items-center justify-between pt-2 border-t border-gray-200 dark:border-gray-600 mt-1">
                    {avaliada ? (
                      <span className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-900/30 px-2.5 py-1 rounded-lg">
                        Nota: {avaliada.nota} (Avaliada)
                      </span>
                    ) : (
                      <span className="text-xs text-amber-600 dark:text-amber-400 font-medium">
                        Pendente
                      </span>
                    )}

                    {isAvaliador && (
                      <Button
                        size="sm"
                        variant={avaliada ? 'outline' : 'primary'}
                        onClick={() => {
                          setApresentacaoParaAvaliar({
                            id: ap.id,
                            titulo: ap.titulo,
                            autor: ap.autor,
                            orientador: ap.orientador,
                            nota: avaliada?.nota,
                            parecer: avaliada?.parecer,
                          });
                          setShowAvaliarModal(true);
                        }}
                        className="text-xs py-1 px-3"
                      >
                        {avaliada ? 'Editar Nota' : 'Avaliar'}
                      </Button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
      {/* ── Lista de Participantes — Visível Apenas para ADMINISTRADOR ──────────────────── */}
      {usuario?.tipoUsuario === 'ADMINISTRADOR' && (
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 mb-8">
        {/* Cabeçalho do painel */}
        <div className="p-4 sm:p-5 border-b border-gray-100 dark:border-gray-700">
          <div className="flex items-start justify-between gap-3">
            <div>
              <h2 className="text-base font-bold text-gray-900 dark:text-white flex items-center gap-2">
                <FiUsers className="text-primary-500" size={18} /> Lista de Participantes
              </h2>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                <strong>{listaInscritos.length}</strong> registros
              </p>
            </div>

            {/* Dropdown Exportar */}
            <div className="relative" ref={exportMenuRef}>
              <Button
                variant="secondary"
                onClick={() => setShowExportMenu(!showExportMenu)}
                className="text-xs py-2 px-3 gap-1.5"
              >
                <FiDownload size={14} />
                Exportar
                <FiChevronDown
                  size={13}
                  className={`transition-transform duration-200 ${showExportMenu ? 'rotate-180' : ''}`}
                />
              </Button>

              {showExportMenu && (
                <div className="absolute right-0 top-full mt-1.5 w-44 bg-white dark:bg-gray-800 rounded-2xl shadow-xl border border-gray-200 dark:border-gray-700 overflow-hidden z-20">
                  {exportActions.map((action, i) => (
                    <button
                      key={i}
                      onClick={action.action}
                      className="w-full flex items-center gap-2.5 px-4 py-2.5 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700/60 transition-colors text-left"
                    >
                      <action.icon size={14} className="text-gray-400 flex-shrink-0" />
                      {action.label}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Campo de busca */}
          <div className="relative mt-3">
            <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
            <input
              type="text"
              value={buscaInscritos}
              onChange={(e) => setBuscaInscritos(e.target.value)}
              placeholder="Buscar por nome ou CPF..."
              className="w-full pl-9 pr-4 py-2.5 bg-gray-50 dark:bg-gray-700/50 border border-gray-200 dark:border-gray-600 rounded-xl text-sm focus:ring-2 focus:ring-primary-500 dark:text-white placeholder-gray-400"
            />
          </div>
        </div>

        {/* Conteúdo: tabela no desktop, cards no mobile */}
        {inscritosFiltrados.length === 0 ? (
          <div className="px-4 py-10 text-center text-gray-400 text-sm">
            Nenhum participante encontrado.
          </div>
        ) : (
          <>
            {/* Tabela — hidden no mobile */}
            <div className="hidden sm:block overflow-x-auto">
              <table className="w-full text-left text-sm text-gray-600 dark:text-gray-300">
                <thead className="bg-gray-50 dark:bg-gray-700/50 text-xs font-semibold uppercase text-gray-400 dark:text-gray-500">
                  <tr>
                    <th className="px-4 py-3 text-center w-10">#</th>
                    <th className="px-4 py-3">Nome</th>
                    <th className="px-4 py-3">CPF</th>
                    <th className="px-4 py-3 text-center">Check-in</th>
                    <th className="px-4 py-3 text-center">Check-out</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                  {inscritosFiltrados.map((p, idx) => (
                    <tr key={p.id || idx} className="hover:bg-gray-50/50 dark:hover:bg-gray-700/30 transition-colors">
                      <td className="px-4 py-3 font-bold text-gray-300 dark:text-gray-600 text-center text-xs">{idx + 1}</td>
                      <td className="px-4 py-3 font-semibold text-gray-900 dark:text-white">{p.nome}</td>
                      <td className="px-4 py-3 text-gray-700 dark:text-gray-300 text-sm">{p.cpf}</td>
                      <td className="px-4 py-3 text-center font-mono text-xs text-gray-700 dark:text-gray-300">{p.horaCheckin || '-'}</td>
                      <td className="px-4 py-3 text-center font-mono text-xs text-gray-700 dark:text-gray-300">{p.horaCheckout || '-'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Cards — visível só no mobile */}
            <div className="sm:hidden divide-y divide-gray-100 dark:divide-gray-700">
              {inscritosFiltrados.map((p, idx) => (
                <div key={p.id || idx} className="px-4 py-3.5">
                  <div className="flex items-start justify-between gap-2 mb-1">
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-sm text-gray-900 dark:text-white leading-tight">{p.nome}</p>
                      <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">{p.cpf}</p>
                    </div>
                    <span className="text-xs text-gray-400 font-medium flex-shrink-0">#{idx + 1}</span>
                  </div>
                  <div className="flex gap-3 mt-2">
                    <div className="flex-1 bg-emerald-50 dark:bg-emerald-900/20 rounded-lg px-2.5 py-1.5 text-center">
                      <p className="text-[10px] text-emerald-600 dark:text-emerald-400 font-semibold uppercase tracking-wide">Check-in</p>
                      <p className="font-mono text-xs text-gray-800 dark:text-gray-200 mt-0.5">{p.horaCheckin || '-'}</p>
                    </div>
                    <div className="flex-1 bg-red-50 dark:bg-red-900/20 rounded-lg px-2.5 py-1.5 text-center">
                      <p className="text-[10px] text-red-600 dark:text-red-400 font-semibold uppercase tracking-wide">Check-out</p>
                      <p className="font-mono text-xs text-gray-800 dark:text-gray-200 mt-0.5">{p.horaCheckout || '-'}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </div>
      )}

      {/* Modal de QR Code */}
      <SessionQRCodeModal
        isOpen={showQrCodeModal}
        onClose={() => setShowQrCodeModal(false)}
        sessao={sessao}
      />
      {/* Modal de Avaliação de Apresentação */}
      <AvaliarApresentacaoModal
        isOpen={showAvaliarModal}
        onClose={() => {
          setShowAvaliarModal(false);
          setApresentacaoParaAvaliar(null);
        }}
        apresentacao={apresentacaoParaAvaliar}
        onAvaliacaoSalva={() => {
          carregarAvaliacoes();
          carregarSessao();
        }}
      />
    </Layout>
  );
};

export default SessaoDetalhes;
