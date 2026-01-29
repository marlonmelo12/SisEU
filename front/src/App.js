import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider } from './context/ThemeContext';

// Pages
import LoginPage from './pages/LoginPage';
import DashboardPage from './pages/DashboardPage';
import AdminDashboard from './pages/AdminDashboard';
import SessaoDetalhes from './pages/SessaoDetalhes';
import Sobre from './pages/Sobre';
import Configuracoes from './pages/Configuracoes';
import MinhasAvaliacoesPage from './pages/MinhasAvaliacoesPage';

// Páginas de Presença (Check-in/Check-out)
import PresencaSelecaoPage from './pages/PresencaSelecaoPage';
import MetodoSelecaoPage from './pages/MetodoSelecaoPage';
import PinValidacaoPage from './pages/PinValidacaoPage';
import QrCodeValidacaoPage from './pages/QrCodeValidacaoPage';
import GeolocalizacaoValidacaoPage from './pages/GeolocalizacaoValidacaoPage';

// Components
import PrivateRoute from './components/Shared/PrivateRoute';

function App() {
  return (
    <ThemeProvider>
      <Routes>
        <Route path="/" element={<LoginPage />} />
        
        <Route 
          path="/admin" 
          element={<PrivateRoute element={<AdminDashboard />} />}
        />
        
        <Route 
          path="/dashboard" 
          element={<PrivateRoute element={<DashboardPage />} />} 
        /> 
        
        <Route 
          path="/sessao/:id" 
          element={<PrivateRoute element={<SessaoDetalhes />} />} 
        />
        
        <Route 
          path="/configuracoes" 
          element={<PrivateRoute element={<Configuracoes />} />} 
        />

        <Route 
          path="/sobre" 
          element={<PrivateRoute element={<Sobre />} />} 
        />

        <Route 
          path="/minhas-avaliacoes" 
          element={<PrivateRoute element={<MinhasAvaliacoesPage />} />} 
        />

        <Route 
          path="/avaliacoes" 
          element={<PrivateRoute element={<MinhasAvaliacoesPage />} />} 
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

        {/* Rota padrão para páginas não encontradas */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </ThemeProvider>
  );
}

export default App;
