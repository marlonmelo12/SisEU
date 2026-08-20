import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Layout from '../components/layout/Layout';
import { Card } from '../components/ui';
import Loading from '../components/ui/Loading';
import EmptyState from '../components/ui/EmptyState';
import Badge from '../components/ui/Badge';
import eventoService from '../services/eventoService';
import avaliacaoService from '../services/avaliacaoService';
import bannerEUs from '../Imagens/bannerEUs.png';
import { FiCalendar, FiMapPin, FiUsers, FiClock, FiArrowLeft } from 'react-icons/fi';
import { useAuth } from '../hooks/useAuth';

const MinhasAvaliacoesPage = () => {
  const navigate = useNavigate();
  const { usuario } = useAuth();
  const [eventos, setEventos] = useState([]);
  const [avaliacoes, setAvaliacoes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [erro, setErro] = useState(null);

  useEffect(() => {
    if (usuario?.id) {
      carregarDados();
    }
  }, [usuario]);

  const carregarDados = async () => {
    setLoading(true);
    setErro(null);
    
    try {
      // Carrega eventos onde o usuário é avaliador usando o novo endpoint
      if (!usuario?.id) {
        setErro('Usuário não autenticado');
        setEventos([]);
        setLoading(false);
        return;
      }

      const resultEventos = await eventoService.listarEventosPorAvaliador(usuario.id);
      console.log('Eventos do avaliador recebidos:', resultEventos);
      
      if (resultEventos.success && resultEventos.data) {
        setEventos(resultEventos.data);
        
        // Carrega avaliações para calcular status
        try {
          const avaliacoesData = await avaliacaoService.minhasAvaliacoes();
          setAvaliacoes(avaliacoesData || []);
        } catch (avError) {
          console.warn('Aviso ao carregar avaliações:', avError);
          setAvaliacoes([]);
        }
      } else {
        setErro(resultEventos.error || 'Erro ao carregar eventos');
        setEventos([]);
      }
    } catch (error) {
      console.error('Erro ao carregar dados:', error);
      setErro(error.message);
      setEventos([]);
    }
    
    setLoading(false);
  };

  const getStatusAvaliacoes = (evento) => {
    if (!evento.apresentacoes || evento.apresentacoes.length === 0) {
      return { total: 0, concluidas: 0, pendentes: 0 };
    }

    const apresentacoesIds = evento.apresentacoes.map(ap => ap.id);
    const avaliacoesDoEvento = avaliacoes.filter(av => 
      apresentacoesIds.includes(av.apresentacaoId)
    );
    
    const concluidas = avaliacoesDoEvento.filter(av => 
      av.nota !== null && av.nota !== undefined
    ).length;
    
    return {
      total: apresentacoesIds.length,
      concluidas: concluidas,
      pendentes: apresentacoesIds.length - concluidas
    };
  };

  const formatLocal = (local) => {
    if (!local) return 'Local não informado';
    if (typeof local === 'string') return local;
    
    const partes = [
      local.sala,
      local.bloco,
      local.departamento,
      local.campus
    ].filter(Boolean);
    
    return partes.join(', ') || 'Local não informado';
  };

  const handleEventoClick = (evento) => {
    // Prepara os dados da sessão no formato esperado pelo SessaoDetalhes
    const sessao = {
      id: evento.id,
      titulo: evento.titulo,
      local: evento.local,
      dataInicio: evento.dataInicio,
      dataFim: evento.dataFim,
      organizadores: evento.organizadores || [],
      professoresAvaliadores: evento.avaliadores || [],
      apresentacoes: (evento.apresentacoes || []).map(ap => ({
        id: ap.id,
        titulo: ap.titulo,
        autor: ap.autor?.nomeCompleto || 'Autor não informado',
        professorOrientador: ap.orientador?.nomeCompleto || null,
        modalidade: ap.modalidade || 0
      })),
      imgUrl: evento.imgUrl,
      codigoUnico: evento.codigoUnico,
      eTipoEvento: evento.eTipoEvento
    };

    navigate(`/sessao/${evento.id}`, { state: { sessao } });
  };

  if (loading) {
    return (
      <Layout>
        <div className="flex justify-center items-center h-64">
          <Loading />
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="container mx-auto px-4 py-6">
        {/* Botão Voltar */}
        <button
          onClick={() => navigate('/dashboard')}
          className="flex items-center gap-1.5 text-sm text-gray-500 dark:text-gray-400 hover:text-gray-800 dark:hover:text-white mb-4 transition-colors min-h-[44px]"
        >
          <FiArrowLeft size={16} /> Voltar
        </button>

        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            Minhas Avaliações
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-2">
            Eventos onde você é avaliador
          </p>
        </div>

        {erro && (
          <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-400 px-4 py-3 rounded mb-6">
            {erro}
          </div>
        )}

        {eventos.length === 0 ? (
          <EmptyState
            title="Nenhum evento para avaliar"
            description="Você não possui eventos onde é avaliador no momento."
          />
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-5">
            {eventos.map((evento) => {
              const status = getStatusAvaliacoes(evento);
              
              return (
                <Card
                  key={evento.id}
                  image={evento.imgUrl || bannerEUs}
                  hoverable
                  onClick={() => handleEventoClick(evento)}
                  className="h-full"
                >
                  <div className="space-y-3">
                    {/* Título e Status */}
                    <div className="flex items-start justify-between gap-2">
                      <h3 className="text-lg font-bold text-gray-900 dark:text-white flex-1 line-clamp-2">
                        {evento.titulo}
                      </h3>
                      <Badge variant={status.concluidas === status.total && status.total > 0 ? "success" : status.pendentes > 0 ? "warning" : "default"}>
                        {status.concluidas === status.total && status.total > 0 ? "Concluído" : status.pendentes > 0 ? "Pendente" : "Sem apresentações"}
                      </Badge>
                    </div>

                    {/* Informações */}
                    <div className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
                      <div className="flex items-center gap-2">
                        <FiMapPin size={16} className="flex-shrink-0 text-primary-500" />
                        <span className="line-clamp-1">
                          {formatLocal(evento.local)}
                        </span>
                      </div>

                      <div className="flex items-center gap-2">
                        <FiCalendar size={16} className="flex-shrink-0 text-primary-500" />
                        <span>{evento.dataInicio?.dataPorExtenso || evento.data || 'Data não informada'}</span>
                      </div>

                      <div className="flex items-center gap-2">
                        <FiClock size={16} className="flex-shrink-0 text-primary-500" />
                        <span>
                          {evento.horarioInicio || '14:00'} - {evento.horarioFim || '18:00'}
                        </span>
                      </div>

                      <div className="flex items-center gap-2">
                        <FiUsers size={16} className="flex-shrink-0 text-primary-500" />
                        <span>{status.total} {status.total === 1 ? 'apresentação' : 'apresentações'}</span>
                      </div>
                    </div>

                    {/* Status das Avaliações */}
                    <div className="pt-3 border-t border-gray-200 dark:border-gray-700 flex items-center justify-between">
                      <span className="text-xs text-gray-500 dark:text-gray-400 font-medium">
                        Avaliações da banca
                      </span>
                      <div className="flex gap-1.5">
                        {status.concluidas > 0 && (
                          <Badge variant="success" size="sm">
                            {status.concluidas} concluída{status.concluidas > 1 ? 's' : ''}
                          </Badge>
                        )}
                        {status.pendentes > 0 && (
                          <Badge variant="warning" size="sm">
                            {status.pendentes} pendente{status.pendentes > 1 ? 's' : ''}
                          </Badge>
                        )}
                        {status.total === 0 && (
                          <Badge variant="default" size="sm">
                            Sem apresentações
                          </Badge>
                        )}
                      </div>
                    </div>
                  </div>
                </Card>
              );
            })}
          </div>
        )}
      </div>
    </Layout>
  );
};

export default MinhasAvaliacoesPage;
