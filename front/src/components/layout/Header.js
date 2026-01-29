// src/components/layout/Header.js
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FiMenu, FiX, FiLogOut, FiSettings, FiUser, FiSun, FiMoon, FiClipboard } from 'react-icons/fi';
import { useAuth } from '../../hooks/useAuth';
import { useTheme } from '../../context/ThemeContext';

/**
 * Componente Header com navegação e menu
 */
const Header = () => {
  const [menuOpen, setMenuOpen] = useState(false);
  const navigate = useNavigate();
  const { usuario, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();

  const handleLogout = () => {
    logout();
    setMenuOpen(false);
  };

  // Verifica se o usuário é PROFESSOR ou AVALIADOR
  const isProfessorOuAvaliador = usuario?.tipoUsuario === 'PROFESSOR' || usuario?.tipoUsuario === 'AVALIADOR';

  const menuItems = [
    // Minhas Avaliações - Disponível apenas para PROFESSOR e AVALIADOR
    ...(isProfessorOuAvaliador ? [{
      label: 'Minhas Avaliações',
      icon: FiClipboard,
      onClick: () => {
        navigate('/minhas-avaliacoes');
        setMenuOpen(false);
      },
    }] : []),
    {
      label: 'Configurações',
      icon: FiSettings,
      onClick: () => {
        navigate('/configuracoes');
        setMenuOpen(false);
      },
    },
    {
      label: 'Perfil',
      icon: FiUser,
      onClick: () => {
        navigate('/perfil');
        setMenuOpen(false);
      },
    },
  ];

  return (
    <header className="bg-primary-500 shadow-lg relative z-10">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <div
            className="flex items-center gap-3 cursor-pointer"
            onClick={() => navigate('/dashboard')}
          >
            <div className="text-white">
              <h1 className="text-xl font-bold">SisEUs</h1>
              <p className="text-xs opacity-90">Encontros Universitários</p>
            </div>
          </div>

          {/* Usuário e Menu */}
          <div className="flex items-center gap-4">
            {/* Toggle tema */}
            <button
              onClick={toggleTheme}
              className="text-white hover:bg-primary-600 p-2 rounded-lg transition-colors"
              aria-label="Alternar tema"
            >
              {theme === 'dark' ? <FiSun size={20} /> : <FiMoon size={20} />}
            </button>

            {/* Nome do usuário */}
            {usuario && (
              <div className="hidden md:block text-white">
                <p className="text-sm font-medium">{usuario.nome}</p>
                <p className="text-xs opacity-90">{usuario.tipoUsuario || 'Usuário'}</p>
              </div>
            )}

            {/* Menu hamburguer */}
            <button
              onClick={() => setMenuOpen(!menuOpen)}
              className="text-white hover:bg-primary-600 p-2 rounded-lg transition-colors"
              aria-label="Menu"
            >
              {menuOpen ? <FiX size={24} /> : <FiMenu size={24} />}
            </button>
          </div>
        </div>

        {/* Menu dropdown */}
        {menuOpen && (
          <div className="absolute right-4 top-20 bg-white dark:bg-gray-800 rounded-lg shadow-xl w-64 overflow-hidden">
            {/* Usuário mobile */}
            {usuario && (
              <div className="md:hidden px-4 py-3 bg-gray-50 dark:bg-gray-700 border-b border-gray-200 dark:border-gray-600">
                <p className="font-medium text-gray-900 dark:text-white">{usuario.nome}</p>
                <p className="text-sm text-gray-600 dark:text-gray-400">{usuario.tipoUsuario || 'Usuário'}</p>
              </div>
            )}

            {/* Items do menu */}
            <div className="py-2">
              {menuItems.map((item, index) => {
                const Icon = item.icon;
                return (
                  <button
                    key={index}
                    onClick={item.onClick}
                    className="w-full flex items-center gap-3 px-4 py-3 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                  >
                    <Icon size={18} />
                    <span>{item.label}</span>
                  </button>
                );
              })}

              {/* Logout */}
              <button
                onClick={handleLogout}
                className="w-full flex items-center gap-3 px-4 py-3 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors border-t border-gray-200 dark:border-gray-600"
              >
                <FiLogOut size={18} />
                <span>Sair</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </header>
  );
};

export default Header;
