// src/services/authService.js
import api from './api';

/**
 * Serviço de autenticação
 */
const authService = {
  /**
   * Realiza login do usuário
   * @param {string} cpf 
   * @param {string} senha 
   * @returns {Promise<{token: string, usuario: import('../models').Usuario}>}
   */
  async login(cpf, senha) {
    try {
      const response = await api.post('/Authenticacoes/login', {
        cpf,
        senha,
      });

      console.log('[AUTH] Resposta do login:', response.data);

      const { token, tipoUsuario, nomeCompleto, cpf: usuarioCpf, usuarioId, ...rest } = response.data;

      // Formatar nome completo caso venha como objeto
      let nomeFormatado = nomeCompleto;
      if (typeof nomeCompleto === 'object' && nomeCompleto !== null) {
        const { nome, sobrenome } = nomeCompleto;
        nomeFormatado = `${nome || ''} ${sobrenome || ''}`.trim();
      }

      // Mapear tipo de usuário corretamente (backend ETipoUsuario)
      const tipoUsuarioMap = {
        1: 'ESTUDANTE',
        2: 'PROFESSOR',
        3: 'AVALIADOR',
        4: 'ADMINISTRADOR'
      };

      // Montar objeto de usuário a partir da resposta do backend
      const usuario = {
        id: usuarioId,
        cpf: usuarioCpf,
        nome: nomeFormatado,
        tipoUsuario: tipoUsuarioMap[tipoUsuario] || 'ESTUDANTE',
        ...rest
      };

      console.log('[AUTH] Token:', token);
      console.log('[AUTH] Usuario montado:', usuario);

      if (token) {
        localStorage.setItem('authToken', token);
        localStorage.setItem('usuario', JSON.stringify(usuario));
        console.log('[AUTH] Token e usuário salvos no localStorage');
      } else {
        console.error('[AUTH] Token não encontrado na resposta');
      }

      return { token, usuario };
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'Erro ao fazer login';
      throw new Error(errorMessage);
    }
  },

  /**
   * Registra novo usuário
   * @param {Object} dadosUsuario 
   * @returns {Promise<any>}
   */
  async registrar(dadosUsuario) {
    try {
      const response = await api.post('/Authenticacoes/registrar', dadosUsuario);
      return response.data;
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'Erro ao registrar usuário';
      throw new Error(errorMessage);
    }
  },

  /**
   * Realiza logout do usuário
   */
  logout() {
    localStorage.removeItem('authToken');
    localStorage.removeItem('accessToken');
    localStorage.removeItem('token');
    localStorage.removeItem('usuario');
  },

  /**
   * Obtém usuário logado do localStorage
   * @returns {import('../models').Usuario | null}
   */
  getUsuarioLogado() {
    const usuario = localStorage.getItem('usuario');
    if (!usuario || usuario === 'undefined' || usuario === 'null') {
      return null;
    }
    try {
      return JSON.parse(usuario);
    } catch (error) {
      console.error('Erro ao parsear usuário do localStorage:', error);
      return null;
    }
  },

  /**
   * Verifica se usuário está autenticado
   * @returns {boolean}
   */
  isAuthenticated() {
    return !!localStorage.getItem('authToken');
  },

  /**
   * Verifica se usuário é administrador
   * @returns {boolean}
   */
  isAdmin() {
    const usuario = this.getUsuarioLogado();
    return usuario?.tipoUsuario === 'ADMINISTRADOR';
  },

  /**
   * Verifica se usuário é avaliador
   * @returns {boolean}
   */
  isAvaliador() {
    const usuario = this.getUsuarioLogado();
    return usuario?.tipoUsuario === 'AVALIADOR';
  },

  /**
   * Verifica se usuário é estudante
   * @returns {boolean}
   */
  isEstudante() {
    const usuario = this.getUsuarioLogado();
    return usuario?.tipoUsuario === 'ESTUDANTE';
  },
};

export default authService;
