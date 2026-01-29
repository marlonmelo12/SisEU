// src/pages/SessaoDetalhes.js
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import Layout from '../components/layout/Layout';
import Button from '../components/ui/Button';
import Badge from '../components/ui/Badge';
import Loading from '../components/ui/Loading';
import Alert from '../components/ui/Alert';
import { useSessoes } from '../hooks/useSessoes';
import { useAuth } from '../hooks/useAuth';
import { FiArrowLeft, FiMapPin, FiCalendar, FiClock, FiUsers, FiUser, FiStar, FiX } from 'react-icons/fi';
import { formatDate, formatTime } from '../utils/formatters';
import { SESSION_STATUS_LABELS, BADGE_VARIANTS } from '../constants';
import bannerEUs from '../Imagens/bannerEUs.png';
import avaliacaoService from '../services/avaliacaoService';
import FormularioBanner from '../components/avaliacoes/FormularioBanner';
import FormularioPitch from '../components/avaliacoes/FormularioPitch';
import FormularioOral from '../components/avaliacoes/FormularioOral';
import VisualizacaoAvaliacao from '../components/avaliacoes/VisualizacaoAvaliacao';

/**
 * Página de detalhes da sessão
 */
const SessaoDetalhes = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const { buscarPorId } = useSessoes();
  const { usuario } = useAuth();
  const [sessao, setSessao] = useState(location.state?.sessao || null);
  const [loading, setLoading] = useState(!location.state?.sessao);
  const [error, setError] = useState(null);
  
  // Estados para avaliação
  const [showAvaliacaoModal, setShowAvaliacaoModal] = useState(false);
  const [apresentacaoSelecionada, setApresentacaoSelecionada] = useState(null);
  const [avaliacaoIniciada, setAvaliacaoIniciada] = useState(null);
  const [notas, setNotas] = useState({});
  const [comentarios, setComentarios] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [avaliacaoError, setAvaliacaoError] = useState(null);
  const [avaliacoesExistentes, setAvaliacoesExistentes] = useState([]);
  const [modoVisualizacao, setModoVisualizacao] = useState(false);

  useEffect(() => {
    // Só buscar se não tiver dados do state
    if (!location.state?.sessao) {
      carregarSessao();
    }
    // Carregar avaliações existentes
    carregarAvaliacoes();
  }, [id]);

  const carregarAvaliacoes = async () => {
    try {
      const avaliacoes = await avaliacaoService.minhasAvaliacoes();
      setAvaliacoesExistentes(avaliacoes);
    } catch (error) {
      console.error('Erro ao carregar avaliações:', error);
    }
  };

  const carregarSessao = async () => {
    setLoading(true);
    setError(null);

    const result = await buscarPorId(id);
    
    if (result.success) {
      setSessao(result.data);
    } else {
      setError(result.error);
    }
    
    setLoading(false);
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
    if (typeof local === 'object') {
      return `${local.sala || ''}, ${local.bloco || ''} - ${local.departamento || ''}, ${local.campus || ''}`.trim();
    }
    return 'Local não informado';
  };

  const getAvaliacaoDaApresentacao = (apresentacaoId) => {
    return avaliacoesExistentes.find(av => av.apresentacaoId === apresentacaoId);
  };

  const apresentacaoJaAvaliada = (apresentacaoId) => {
    const avaliacao = getAvaliacaoDaApresentacao(apresentacaoId);
    return avaliacao && avaliacao.nota !== null;
  };

  const handleAbrirAvaliacao = async (apresentacao) => {
    setApresentacaoSelecionada(apresentacao);
    setAvaliacaoError(null);
    
    // Verifica se já existe avaliação
    const avaliacaoExistente = getAvaliacaoDaApresentacao(apresentacao.id);
    
    if (avaliacaoExistente && avaliacaoExistente.nota !== null) {
      // Modo visualização - carrega dados existentes
      setModoVisualizacao(true);
      setAvaliacaoIniciada(avaliacaoExistente);
      setNotas({});
      setComentarios(avaliacaoExistente.parecer || '');
      setShowAvaliacaoModal(true);
    } else {
      // Modo edição - inicia nova avaliação
      setModoVisualizacao(false);
      setNotas({});
      setComentarios('');
      setSubmitting(true);

      try {
        const avaliacaoIniciada = await avaliacaoService.iniciar(apresentacao.id);
        setAvaliacaoIniciada(avaliacaoIniciada);
        setShowAvaliacaoModal(true);
      } catch (error) {
        setAvaliacaoError(error.message);
        alert('Erro ao iniciar avaliação: ' + error.message);
      } finally {
        setSubmitting(false);
      }
    }
  };

  const handleFecharModal = () => {
    setShowAvaliacaoModal(false);
    setApresentacaoSelecionada(null);
    setAvaliacaoIniciada(null);
    setNotas({});
    setComentarios('');
    setAvaliacaoError(null);
    setModoVisualizacao(false);
  };

  const calcularNotaFinal = () => {
    const valores = Object.values(notas).filter(v => v !== '').map(v => parseFloat(v));
    if (valores.length === 0) return 0;
    const soma = valores.reduce((acc, val) => acc + val, 0);
    return soma / valores.length;
  };

  const handleEnviarAvaliacao = async (e) => {
    e.preventDefault();
    
    // Valida se todas as notas foram preenchidas
    const notasVazias = Object.values(notas).some(v => v === '' || v === undefined);
    if (notasVazias) {
      setAvaliacaoError('Por favor, preencha todas as notas');
      return;
    }

    // Valida se todas as notas estão no intervalo correto
    const notasInvalidas = Object.values(notas).some(v => {
      const num = parseFloat(v);
      return isNaN(num) || num < 0 || num > 10;
    });
    
    if (notasInvalidas) {
      setAvaliacaoError('Todas as notas devem estar entre 0 e 10');
      return;
    }

    setSubmitting(true);
    setAvaliacaoError(null);

    try {
      const notaFinal = calcularNotaFinal();
      
      await avaliacaoService.enviar(avaliacaoIniciada.id, {
        nota: notaFinal,
        parecer: comentarios || null
      });
      
      // Recarrega as avaliações para atualizar a lista
      await carregarAvaliacoes();
      
      handleFecharModal();
      alert('Avaliação enviada com sucesso!');
    } catch (error) {
      setAvaliacaoError(error.message);
    } finally {
      setSubmitting(false);
    }
  };

  const renderFormularioPorModalidade = () => {
    if (!apresentacaoSelecionada) return null;

    const modalidade = apresentacaoSelecionada.modalidade;

    // Banner/Pôster = 0, Pitch = 1, Oral = 2
    switch (modalidade) {
      case 0:
        return (
          <FormularioBanner
            notas={notas}
            setNotas={setNotas}
            comentarios={comentarios}
            setComentarios={setComentarios}
          />
        );
      case 1:
        return (
          <FormularioPitch
            notas={notas}
            setNotas={setNotas}
            comentarios={comentarios}
            setComentarios={setComentarios}
          />
        );
      case 2:
        return (
          <FormularioOral
            notas={notas}
            setNotas={setNotas}
            comentarios={comentarios}
            setComentarios={setComentarios}
          />
        );
      default:
        return (
          <div className="text-center py-4">
            <p className="text-red-600">Modalidade não reconhecida</p>
          </div>
        );
    }
  };

  if (loading) {
    return (
      <Layout>
        <Loading message="Carregando detalhes da sessão..." />
      </Layout>
    );
  }

  if (error) {
    return (
      <Layout>
        <Alert type="error" message={error} />
        <Button onClick={() => navigate(-1)} className="mt-4">
          <FiArrowLeft className="mr-2" />
          Voltar
        </Button>
      </Layout>
    );
  }

  if (!sessao) {
    return (
      <Layout>
        <Alert type="error" message="Sessão não encontrada" />
        <Button onClick={() => navigate(-1)} className="mt-4">
          <FiArrowLeft className="mr-2" />
          Voltar
        </Button>
      </Layout>
    );
  }

  return (
    <Layout>
      {/* Botão Voltar */}
      <Button
        variant="ghost"
        onClick={() => navigate(-1)}
        className="mb-4"
      >
        <FiArrowLeft className="mr-2" />
        Voltar
      </Button>

      {/* Header da Sessão */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg overflow-hidden mb-6">
        <img 
          src={bannerEUs} 
          alt={sessao.titulo}
          className="w-full h-64 object-cover"
        />
        
        <div className="p-6">
          <div className="flex items-start justify-between mb-4">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
              {sessao.titulo}
            </h1>
            <Badge variant={getStatusVariant(sessao.status)}>
              {SESSION_STATUS_LABELS[sessao.status] || sessao.status}
            </Badge>
          </div>

          {sessao.descricao && (
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              {sessao.descricao}
            </p>
          )}

          {/* Informações */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            <div className="flex items-center gap-3 text-gray-700 dark:text-gray-300">
              <FiMapPin size={20} className="text-primary-500" />
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">Local</p>
                <p className="font-medium">{formatLocal(sessao.local)}</p>
              </div>
            </div>

            <div className="flex items-center gap-3 text-gray-700 dark:text-gray-300">
              <FiCalendar size={20} className="text-primary-500" />
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">Data</p>
                <p className="font-medium">{formatDate(sessao.data)}</p>
              </div>
            </div>

            <div className="flex items-center gap-3 text-gray-700 dark:text-gray-300">
              <FiClock size={20} className="text-primary-500" />
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">Horário</p>
                <p className="font-medium">
                  {sessao.horarioInicio} - {sessao.horarioFim}
                </p>
              </div>
            </div>

            {sessao.apresentacoes && (
              <div className="flex items-center gap-3 text-gray-700 dark:text-gray-300">
                <FiUsers size={20} className="text-primary-500" />
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Apresentações</p>
                  <p className="font-medium">{sessao.apresentacoes.length}</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Organizadores */}
      {sessao.organizadores && sessao.organizadores.length > 0 && (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 mb-6">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
            Organizadores
          </h2>
          <div className="flex flex-wrap gap-2">
            {sessao.organizadores.map((org, index) => (
              <Badge key={index} variant="default">
                {typeof org === 'string' ? org : org.nomeCompleto || org.nome || `Org ${index + 1}`}
              </Badge>
            ))}
          </div>
        </div>
      )}

      {/* Professores Avaliadores */}
      {sessao.professoresAvaliadores && sessao.professoresAvaliadores.length > 0 && (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 mb-6">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
            Professores Avaliadores
          </h2>
          <div className="space-y-2">
            {sessao.professoresAvaliadores.map((prof, index) => (
              <div key={index} className="flex items-center gap-2 text-gray-700 dark:text-gray-300">
                <FiUser size={16} />
                <span>
                  {typeof prof === 'string' 
                    ? prof 
                    : `${prof.nomeCompleto || prof.nome || 'Professor'}${prof.instituicao ? ` - ${prof.instituicao}` : ''}`
                  }
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Apresentações */}
      {sessao.apresentacoes && sessao.apresentacoes.length > 0 && (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
            Apresentações
          </h2>
          <div className="space-y-4">
            {sessao.apresentacoes.map((apresentacao, index) => {
              const avaliacao = getAvaliacaoDaApresentacao(apresentacao.id);
              const jaAvaliada = apresentacaoJaAvaliada(apresentacao.id);
              
              return (
                <div 
                  key={index}
                  className={`border-l-4 pl-4 py-2 flex items-start justify-between ${
                    jaAvaliada 
                      ? 'border-green-500 bg-green-50 dark:bg-green-900/10' 
                      : 'border-primary-500'
                  }`}
                >
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-bold text-gray-900 dark:text-white">
                        {apresentacao.titulo}
                      </h3>
                      {jaAvaliada && (
                        <Badge variant="success" size="sm">
                          Avaliada
                        </Badge>
                      )}
                    </div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      <strong>Autor:</strong> {apresentacao.autor}
                    </p>
                    {apresentacao.professorOrientador && (
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        <strong>Professor Orientador:</strong> {apresentacao.professorOrientador}
                      </p>
                    )}
                    {jaAvaliada && avaliacao && (
                      <div className="mt-2 p-2 bg-white dark:bg-gray-800 rounded border border-green-200 dark:border-green-800">
                        <p className="text-sm font-semibold text-green-700 dark:text-green-400">
                          <strong>Nota atribuída:</strong> {avaliacao.nota?.toFixed(1)}
                        </p>
                        {avaliacao.parecer && (
                          <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                            <strong>Parecer:</strong> {avaliacao.parecer}
                          </p>
                        )}
                      </div>
                    )}
                  </div>
                  {(usuario?.tipoUsuario === 'PROFESSOR' || usuario?.tipoUsuario === 'AVALIADOR') && (
                    <Button
                      variant={jaAvaliada ? "outline" : "primary"}
                      size="sm"
                      onClick={() => handleAbrirAvaliacao(apresentacao)}
                      className="ml-4 flex items-center gap-2"
                    >
                      <FiStar size={16} />
                      {jaAvaliada ? 'Visualizar' : 'Avaliar'}
                    </Button>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Modal de Avaliação */}
      {showAvaliacaoModal && apresentacaoSelecionada && avaliacaoIniciada && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              {/* Header com botão voltar */}
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-sm font-medium text-primary-600 dark:text-primary-400 px-3 py-1 bg-primary-50 dark:bg-primary-900/20 rounded-full">
                      SisEUs
                    </span>
                    <button
                      onClick={handleFecharModal}
                      className="ml-auto text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
                    >
                      Sair ✕
                    </button>
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                    Título do Trabalho
                  </h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                    {apresentacaoSelecionada.titulo}
                  </p>
                </div>
              </div>

              <div className="border-t border-gray-200 dark:border-gray-700 pt-4 mb-6">
                <p className="text-sm text-gray-700 dark:text-gray-300 mb-1">
                  <strong>
                    {modoVisualizacao ? 'Visualização da Avaliação' : 'Início da Avaliação - Insira notas de 0 à 10'}
                  </strong>
                </p>
              </div>

              {avaliacaoError && (
                <Alert type="error" message={avaliacaoError} className="mb-4" />
              )}

              {modoVisualizacao ? (
                // Modo visualização - apenas exibe os dados
                <>
                  <VisualizacaoAvaliacao
                    avaliacao={avaliacaoIniciada}
                    comentarios={comentarios}
                  />
                  <div className="flex gap-4 pt-6 mt-6 border-t border-gray-200 dark:border-gray-700">
                    <Button
                      type="button"
                      onClick={handleFecharModal}
                      className="flex-1 bg-gray-600 hover:bg-gray-700 text-white font-medium py-3 rounded-lg"
                    >
                      Fechar
                    </Button>
                  </div>
                </>
              ) : (
                // Modo edição - formulário normal
                <form onSubmit={handleEnviarAvaliacao}>
                  {renderFormularioPorModalidade()}

                  <div className="flex gap-4 pt-6 mt-6 border-t border-gray-200 dark:border-gray-700">
                    <Button
                      type="submit"
                      className="flex-1 bg-green-600 hover:bg-green-700 text-white font-medium py-3 rounded-lg"
                      disabled={submitting}
                    >
                      {submitting ? 'Enviando...' : 'Finalizar Avaliação'}
                    </Button>
                    
                    <Button
                      type="button"
                      onClick={handleFecharModal}
                      className="px-6 bg-red-600 hover:bg-red-700 text-white font-medium py-3 rounded-lg"
                      disabled={submitting}
                    >
                      Cancelar
                    </Button>
                  </div>
                </form>
              )}
            </div>
          </div>
        </div>
      )}
    </Layout>
  );
};

export default SessaoDetalhes;
