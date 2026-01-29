// src/services/eventoService.js
import api from './api';

/**
 * Serviço para gerenciar eventos/sessões
 */
class EventoService {
  /**
   * Cria um novo evento
   */
  async criar(dadosEvento) {
    try {
      console.log('[EVENTO-SERVICE] Criando evento com payload:', dadosEvento);
      const response = await api.post('/Eventos', dadosEvento);
      console.log('[EVENTO-SERVICE] Resposta do servidor:', response.data);
      return { success: true, data: response.data };
    } catch (error) {
      console.error('[EVENTO-SERVICE] Erro ao criar evento:', error);
      console.error('[EVENTO-SERVICE] Resposta de erro:', error.response?.data);
      console.error('[EVENTO-SERVICE] Status:', error.response?.status);
      
      // Extrai mensagens de erro do backend
      let mensagemErro = 'Erro ao criar evento';
      
      if (error.response?.data?.erros && Array.isArray(error.response.data.erros)) {
        // Backend retorna array de erros
        console.error('[EVENTO-SERVICE] Erros detalhados:', error.response.data.erros);
        mensagemErro = error.response.data.erros.join(', ');
      } else if (error.response?.data?.message) {
        mensagemErro = error.response.data.message;
      } else if (error.response?.data?.title) {
        mensagemErro = error.response.data.title;
      } else if (error.message) {
        mensagemErro = error.message;
      }
      
      return {
        success: false,
        error: mensagemErro,
      };
    }
  }

  /**
   * Atualiza um evento existente
   */
  async atualizar(eventoId, dadosEvento) {
    try {
      console.log('[EVENTO-SERVICE] Atualizando evento ID:', eventoId);
      console.log('[EVENTO-SERVICE] Payload de atualização:', dadosEvento);
      const response = await api.patch(`/Eventos/${eventoId}`, dadosEvento);
      console.log('[EVENTO-SERVICE] Resposta de atualização:', response.data);
      return { success: true, data: response.data };
    } catch (error) {
      console.error('[EVENTO-SERVICE] Erro ao atualizar evento:', error);
      console.error('[EVENTO-SERVICE] Resposta de erro:', error.response?.data);
      console.error('[EVENTO-SERVICE] Status:', error.response?.status);
      
      // Log dos erros de validação específicos
      if (error.response?.data?.errors) {
        console.error('[EVENTO-SERVICE] Erros de validação:', JSON.stringify(error.response.data.errors, null, 2));
      }
      
      // Extrai mensagens de erro do backend
      let mensagemErro = 'Erro ao atualizar evento';
      
      if (error.response?.data?.errors) {
        // Erros de validação do ASP.NET Core
        const erros = Object.entries(error.response.data.errors)
          .map(([campo, mensagens]) => `${campo}: ${Array.isArray(mensagens) ? mensagens.join(', ') : mensagens}`)
          .join(' | ');
        mensagemErro = erros || error.response.data.title;
      } else if (error.response?.data?.erros && Array.isArray(error.response.data.erros)) {
        console.error('[EVENTO-SERVICE] Erros detalhados:', error.response.data.erros);
        mensagemErro = error.response.data.erros.join(', ');
      } else if (error.response?.data?.message) {
        mensagemErro = error.response.data.message;
      } else if (error.response?.data?.title) {
        mensagemErro = error.response.data.title;
      } else if (error.message) {
        mensagemErro = error.message;
      }
      
      return {
        success: false,
        error: mensagemErro,
      };
    }
  }

  /**
   * Busca um evento por ID
   */
  async buscarPorId(eventoId) {
    try {
      const response = await api.get(`/Eventos/${eventoId}`);
      return { success: true, data: response.data };
    } catch (error) {
      console.error('[EVENTO-SERVICE] Erro ao buscar evento:', error);
      return {
        success: false,
        error: error.response?.data?.message || error.message || 'Erro ao buscar evento',
      };
    }
  }

  /**
   * Lista todos os eventos
   */
  async listar() {
    try {
      const response = await api.get('/Eventos');
      return { success: true, data: response.data };
    } catch (error) {
      console.error('[EVENTO-SERVICE] Erro ao listar eventos:', error);
      return {
        success: false,
        error: error.response?.data?.message || error.message || 'Erro ao listar eventos',
      };
    }
  }

  /**
   * Deleta um evento
   */
  async deletar(eventoId) {
    try {
      await api.delete(`/Eventos/${eventoId}`);
      return { success: true };
    } catch (error) {
      console.error('[EVENTO-SERVICE] Erro ao deletar evento:', error);
      return {
        success: false,
        error: error.response?.data?.message || error.message || 'Erro ao deletar evento',
      };
    }
  }

  /**
   * Lista eventos que o usuário logado precisa avaliar
   */
  async listarEventosParaAvaliar() {
    try {
      const response = await api.get('/Eventos/meus-eventos-avaliar');
      return { success: true, data: response.data };
    } catch (error) {
      console.error('[EVENTO-SERVICE] Erro ao listar eventos para avaliar:', error);
      return {
        success: false,
        error: error.response?.data?.message || error.message || 'Erro ao listar eventos para avaliar',
      };
    }
  }

  /**
   * Lista eventos de um avaliador específico
   */
  async listarEventosPorAvaliador(avaliadorId) {
    try {
      console.log('[EVENTO-SERVICE] Buscando eventos do avaliador ID:', avaliadorId);
      const response = await api.get(`/Eventos/avaliador/${avaliadorId}/eventos`);
      console.log('[EVENTO-SERVICE] Eventos do avaliador:', response.data);
      return { success: true, data: response.data };
    } catch (error) {
      console.error('[EVENTO-SERVICE] Erro ao listar eventos do avaliador:', error);
      return {
        success: false,
        error: error.response?.data?.message || error.message || 'Erro ao listar eventos do avaliador',
      };
    }
  }
}

const eventoService = new EventoService();
export default eventoService;
