// src/services/api.js
import axios from 'axios';

const BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8080/api';

const api = axios.create({
  baseURL: BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10000,
});

// Interceptor de requisição - adiciona token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('authToken') 
                || localStorage.getItem('accessToken') 
                || localStorage.getItem('token');

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    // Log para desenvolvimento
    if (process.env.NODE_ENV === 'development') {
      console.log(`[API] ${config.method?.toUpperCase()} ${config.url}`, {
        headers: config.headers,
        data: config.data,
        params: config.params,
      });
    }

    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Interceptor de resposta - tratamento de erros
api.interceptors.response.use(
  (response) => {
    if (process.env.NODE_ENV === 'development') {
      console.log(`[API-RESPONSE] ${response.status} ${response.config.url}`, response.data);
    }
    return response;
  },
  (error) => {
    if (process.env.NODE_ENV === 'development') {
      console.error('[API-ERROR]', error.response?.data || error.message);
      
      // Log detalhado de erros array
      if (error.response?.data?.erros && Array.isArray(error.response.data.erros)) {
        console.error('[API-ERROR-DETALHES] Erros do backend:', error.response.data.erros);
      }
    }

    // Tratamento específico de erros
    if (error.response?.status === 401) {
      // Token inválido ou expirado
      localStorage.removeItem('authToken');
      localStorage.removeItem('accessToken');
      localStorage.removeItem('token');
      localStorage.removeItem('usuario');
      window.location.href = '/';
    }

    if (error.response?.status === 403) {
      // Sem permissão
      console.error('Acesso negado: sem permissão para esta operação');
    }

    // Erro 500 com "Sequence contains no matching element" - usuário não encontrado
    if (error.response?.status === 500 && 
        error.response?.data?.includes?.('Sequence contains no matching element')) {
      console.error('Erro: Usuário não encontrado no backend. Verifique se o usuário existe no banco de dados.');
      // Não fazer logout automático - deixar o usuário ver a mensagem de erro
    }

    return Promise.reject(error);
  }
);

export default api;
