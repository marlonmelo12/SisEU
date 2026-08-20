import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider } from './context/ThemeContext';
import { AuthProvider } from './context/AuthContext';
import { ToastProvider } from './context/ToastContext';

// Pages
import LoginPage from './pages/LoginPage';
import DashboardPage from './pages/DashboardPage';
import AdminDashboard from './pages/AdminDashboard';
import SessaoDetalhes from './pages/SessaoDetalhes';
import Sobre from './pages/Sobre';
import Configuracoes from './pages/Configuracoes';
import MinhasAvaliacoesPage from './pages/MinhasAvaliacoesPage';
import PerfilPage from './pages/PerfilPage';
import AcessoNegado from './pages/AcessoNegado';

// Páginas de Presença (Check-in/Check-out)
import PresencaSelecaoPage from './pages/PresencaSelecaoPage';
import MetodoSelecaoPage from './pages/MetodoSelecaoPage';
import PinValidacaoPage from './pages/PinValidacaoPage';
import QrCodeValidacaoPage from './pages/QrCodeValidacaoPage';
import GeolocalizacaoValidacaoPage from './pages/GeolocalizacaoValidacaoPage';

// Components
import PrivateRoute from './components/Shared/PrivateRoute';

/**
 * Configuração de rotas da aplicação
 */
function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <ToastProvider>
          <Routes>
            <Route path="/" element={<LoginPage />} />
            
            {/* Rota exclusiva para Administrador */}
            <Route 
              path="/admin" 
              element={
                <PrivateRoute 
                  element={<AdminDashboard />} 
                  allowedRoles={['ADMINISTRADOR']}
                />
              }
            />
            
            {/* Dashboard - todos usuários autenticados */}
            <Route 
              path="/dashboard" 
              element={<PrivateRoute element={<DashboardPage />} />} 
            /> 
            
            {/* Detalhes de sessão - todos usuários autenticados */}
            <Route 
              path="/sessao/:id" 
              element={<PrivateRoute element={<SessaoDetalhes />} />} 
            />
            <Route 
              path="/sessoes/:id" 
              element={<PrivateRoute element={<SessaoDetalhes />} />} 
            />
            
            {/* Perfil - todos usuários autenticados */}
            <Route 
              path="/perfil" 
              element={<PrivateRoute element={<PerfilPage />} />} 
            />

            {/* Configurações - todos usuários autenticados */}
            <Route 
              path="/configuracoes" 
              element={<PrivateRoute element={<Configuracoes />} />} 
            />

            {/* Sobre - todos usuários autenticados */}
            <Route 
              path="/sobre" 
              element={<PrivateRoute element={<Sobre />} />} 
            />

            {/* Avaliações - exclusivo para Professores e Avaliadores */}
            <Route 
              path="/minhas-avaliacoes" 
              element={
                <PrivateRoute 
                  element={<MinhasAvaliacoesPage />} 
                  allowedRoles={['PROFESSOR', 'AVALIADOR']}
                />
              }
            />

            <Route 
              path="/avaliacoes" 
              element={
                <PrivateRoute 
                  element={<MinhasAvaliacoesPage />} 
                  allowedRoles={['PROFESSOR', 'AVALIADOR']}
                />
              }
            />

            {/* Rotas de Presença (Check-in/Check-out) */}
            <Route 
              path="/presenca" 
              element={<PrivateRoute element={<PresencaSelecaoPage />} />} 
            />
            <Route 
              path="/presenca/:tipo/metodo" 
              element={<PrivateRoute element={<MetodoSelecaoPage />} />} 
            />
            <Route 
              path="/presenca/:tipo/pin" 
              element={<PrivateRoute element={<PinValidacaoPage />} />} 
            />
            <Route 
              path="/presenca/:tipo/qr" 
              element={<PrivateRoute element={<QrCodeValidacaoPage />} />} 
            />
            <Route 
              path="/presenca/:tipo/geolocalizacao" 
              element={<PrivateRoute element={<GeolocalizacaoValidacaoPage />} />} 
            />

            {/* Página de acesso negado */}
            <Route path="/acesso-negado" element={<AcessoNegado />} />

            {/* Rota padrão para páginas não encontradas */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </ToastProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;
