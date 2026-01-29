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
import { FiCalendar, FiMapPin, FiUsers } from 'react-icons/fi';
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
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {eventos.map((evento) => {
              const status = getStatusAvaliacoes(evento);
              
              return (
                <Card
                  key={evento.id}
                  className="cursor-pointer hover:shadow-lg transition-shadow overflow-hidden"
                  onClick={() => handleEventoClick(evento)}
                >
                  {/* Banner do Evento */}
                  <div className="relative h-40 bg-gradient-to-r from-primary-500 to-primary-600">
                    <img
                      src={evento.imgUrl || bannerEUs}
                      alt={evento.titulo}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        e.target.src = bannerEUs;
                      }}
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                    <div className="absolute bottom-4 left-4 right-4">
                      <h3 className="text-white font-bold text-lg line-clamp-2">
                        {evento.titulo}
                      </h3>
                    </div>
                  </div>

                  {/* Informações do Evento */}
                  <div className="p-4">
                    <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400 mb-2">
                      <FiCalendar size={16} />
                      <span>{evento.dataInicio?.dataPorExtenso || 'Data não informada'}</span>
                    </div>
                    
                    <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400 mb-2">
                      <FiMapPin size={16} />
                      <span className="line-clamp-1">{formatLocal(evento.local)}</span>
                    </div>

                    <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400 mb-4">
                      <FiUsers size={16} />
                      <span>
                        {status.total} {status.total === 1 ? 'apresentação' : 'apresentações'}
                      </span>
                    </div>

                    {/* Status das Avaliações */}
                    <div className="flex items-center justify-between pt-3 border-t border-gray-200 dark:border-gray-700">
                      <span className="text-xs text-gray-500 dark:text-gray-400">
                        Status das avaliações
                      </span>
                      <div className="flex gap-2">
                        {status.concluidas > 0 && (
                          <Badge variant="success" size="sm">
                            {status.concluidas} ✓
                          </Badge>
                        )}
                        {status.pendentes > 0 && (
                          <Badge variant="warning" size="sm">
                            {status.pendentes} Pendente{status.pendentes > 1 ? 's' : ''}
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
