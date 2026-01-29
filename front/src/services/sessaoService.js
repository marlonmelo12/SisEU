// src/services/sessaoService.js
import api from './api';

/**
 * Serviço de Sessões
 */
const sessaoService = {
  /**
   * Transforma dados do backend para o formato do card
   */
  transformarEvento(evento) {
    // dataInicio e dataFim já vêm como Date do backend
    const dataInicio = evento.dataInicio ? new Date(evento.dataInicio) : null;
    const dataFim = evento.dataFim ? new Date(evento.dataFim) : null;

    // Valida se as datas são válidas
    const dataInicioValida = dataInicio && !isNaN(dataInicio.getTime());
    const dataFimValida = dataFim && !isNaN(dataFim.getTime());

    // Transforma avaliadores (pode vir como array de objetos ou strings/CPFs)
    const avaliadores = Array.isArray(evento.avaliadores) 
      ? evento.avaliadores.map(av => typeof av === 'string' ? av : av.nomeCompleto || av.nome || av.cpf)
      : [];

    // Transforma apresentações para extrair nomes de autor e orientador
    const apresentacoes = Array.isArray(evento.apresentacoes)
      ? evento.apresentacoes.map(ap => ({
          ...ap,
          autor: typeof ap.autor === 'string' ? ap.autor : ap.autor?.nomeCompleto || ap.autor?.nome || 'Autor não informado',
          professorOrientador: ap.orientador 
            ? (typeof ap.orientador === 'string' ? ap.orientador : ap.orientador?.nomeCompleto || ap.orientador?.nome)
            : undefined
        }))
      : [];

    // Formata local
    let localFormatado = 'Local não informado';
    if (evento.local && typeof evento.local === 'object') {
      const partes = [];
      if (evento.local.sala) partes.push(evento.local.sala);
      if (evento.local.bloco) partes.push(evento.local.bloco);
      if (evento.local.departamento) partes.push(evento.local.departamento);
      
      // Campus
      const campusLabels = {
        0: 'Pici',
        1: 'Benfica',
        2: 'Porangabussu',
        'Pici': 'Pici',
        'Benfica': 'Benfica',
        'Porangabussu': 'Porangabussu',
        'Fortaleza': 'Pici'
      };
      const campus = campusLabels[evento.local.campus] || '';
      if (campus) partes.push(campus);
      
      localFormatado = partes.join(', ') || 'Local não informado';
    } else if (typeof evento.local === 'string') {
      localFormatado = evento.local;
    }

    return {
      ...evento,
      data: dataInicioValida ? dataInicio.toISOString() : null,
      horarioInicio: dataInicioValida ? dataInicio.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }) : '-',
      horarioFim: dataFimValida ? dataFim.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }) : '-',
      local: localFormatado,
      imagemUrl: evento.imgUrl || evento.imagemUrl,
      status: sessaoService.calcularStatus(dataInicio, dataFim),
      professoresAvaliadores: avaliadores,
      apresentacoes: apresentacoes,
    };
  },

  /**
   * Calcula o status do evento baseado nas datas
   */
  calcularStatus(dataInicio, dataFim) {
    const agora = new Date();
    // Remove hora/minuto para comparar apenas data
    agora.setHours(0, 0, 0, 0);
    
    if (!dataInicio || isNaN(dataInicio.getTime())) {
      return 'AGUARDANDO';
    }
    
    const inicioComparar = new Date(dataInicio);
    inicioComparar.setHours(0, 0, 0, 0);
    
    if (agora < inicioComparar) {
      return 'AGUARDANDO';
    }
    
    if (dataFim && !isNaN(dataFim.getTime())) {
      const fimComparar = new Date(dataFim);
      fimComparar.setHours(23, 59, 59, 999);
      
      if (agora > fimComparar) {
        return 'ENCERRADA';
      }
    } else {
      // Se não tem data fim, considera encerrado se passou da data de início
      if (agora > inicioComparar) {
        return 'ENCERRADA';
      }
    }
    
    return 'ATIVA';
  },

  /**
   * Verifica se um evento já aconteceu (está no passado)
   */
  eventoJaAconteceu(dataFim, dataInicio) {
    const agora = new Date();
    agora.setHours(0, 0, 0, 0);
    
    if (dataFim && !isNaN(dataFim.getTime())) {
      const fimComparar = new Date(dataFim);
      fimComparar.setHours(23, 59, 59, 999);
      return agora > fimComparar;
    }
    
    if (dataInicio && !isNaN(dataInicio.getTime())) {
      const inicioComparar = new Date(dataInicio);
      inicioComparar.setHours(23, 59, 59, 999);
      return agora > inicioComparar;
    }
    
    return false;
  },

  /**
   * Lista todas as sessões
   * @returns {Promise<import('../models').Sessao[]>}
   */
  async listarTodas() {
    try {
      console.log('[SESSAO-SERVICE] Buscando eventos...');
      const response = await api.get('/Eventos');
      console.log('[SESSAO-SERVICE] Eventos recebidos:', response.data);
      
      const eventosTransformados = response.data.map(evento => {
        try {
          return sessaoService.transformarEvento(evento);
        } catch (error) {
          console.error('[SESSAO-SERVICE] Erro ao transformar evento:', evento, error);
          throw error;
        }
      });
      
      console.log('[SESSAO-SERVICE] Eventos transformados:', eventosTransformados);
      return eventosTransformados;
    } catch (error) {
      console.error('[SESSAO-SERVICE] Erro ao listar sessões:', error);
      const errorMessage = error.response?.data?.message || error.message || 'Erro ao listar sessões';
      throw new Error(errorMessage);
    }
  },

  /**
   * Busca sessões do usuário logado
   * @returns {Promise<import('../models').Sessao[]>}
   */
  async minhasSessoes() {
    try {
      const response = await api.get('/Apresentacoes/minhas-apresentacoes');
      return response.data;
    } catch (error) {
      // Se o erro for "Sequence contains no matching element", retornar array vazio
      if (error.response?.status === 500 && 
          error.response?.data?.includes?.('Sequence contains no matching element')) {
        console.warn('[SESSAO] Usuário sem apresentações/sessões, retornando array vazio');
        return [];
      }
      const errorMessage = error.response?.data?.message || 'Erro ao buscar sessões';
      throw new Error(errorMessage);
    }
  },

  /**
   * Busca sessão por ID
   * @param {string} id 
   * @returns {Promise<import('../models').Sessao>}
   */
  async buscarPorId(id) {
    try {
      console.log('[SESSAO-SERVICE] Buscando evento ID:', id);
      const response = await api.get(`/Eventos/${id}`);
      console.log('[SESSAO-SERVICE] Evento recebido:', response.data);
      return sessaoService.transformarEvento(response.data);
    } catch (error) {
      console.error('[SESSAO-SERVICE] Erro ao buscar evento:', error);
      const errorMessage = error.response?.data?.message || 'Evento não encontrado';
      throw new Error(errorMessage);
    }
  },

  /**
   * Cria nova sessão (apenas admin)
   * @param {Object} dados 
   * @returns {Promise<import('../models').Sessao>}
   */
  async criar(dados) {
    try {
      const response = await api.post('/Sessoes', dados);
      return response.data;
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'Erro ao criar sessão';
      throw new Error(errorMessage);
    }
  },

  /**
   * Atualiza sessão existente (apenas admin)
   * @param {string} id 
   * @param {Object} dados 
   * @returns {Promise<import('../models').Sessao>}
   */
  async atualizar(id, dados) {
    try {
      const response = await api.put(`/Sessoes/${id}`, dados);
      return response.data;
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'Erro ao atualizar sessão';
      throw new Error(errorMessage);
    }
  },

  /**
   * Deleta sessão (apenas admin)
   * @param {string} id 
   * @returns {Promise<void>}
   */
  async deletar(id) {
    try {
      await api.delete(`/Sessoes/${id}`);
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'Erro ao deletar sessão';
      throw new Error(errorMessage);
    }
  },

  /**
   * Verifica se sessão pode ser editada (24h antes)
   * @param {string} dataInicio 
   * @returns {boolean}
   */
  podeEditar(dataInicio) {
    const dataLimite = new Date(dataInicio);
    dataLimite.setHours(dataLimite.getHours() - 24);
    return new Date() < dataLimite;
  },
};

// Exporta também com nome SessionService para compatibilidade
export const SessionService = {
  loadSession: (id) => sessaoService.buscarPorId(id),
  createSession: (dados) => sessaoService.criar(dados),
  updateSession: (id, dados) => sessaoService.atualizar(id, dados),
  deleteSession: (id) => sessaoService.deletar(id),
};

export default sessaoService;
