// src/components/layout/Header.js
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  FiMenu, FiX, FiLogOut, FiSettings, FiUser,
  FiSun, FiMoon, FiClipboard,
} from 'react-icons/fi';
import { useAuth } from '../../hooks/useAuth';
import { useTheme } from '../../context/ThemeContext';

/**
 * Header — Mobile-first
 * - Mobile: logo + toggle tema. Menu hambúrguer oculto (nav via BottomNav)
 * - Desktop: header completo com nome do usuário e dropdown
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

  const isProfessorOuAvaliador =
    usuario?.tipoUsuario === 'PROFESSOR' || usuario?.tipoUsuario === 'AVALIADOR';

  const menuItems = [
    ...(isProfessorOuAvaliador
      ? [{
          label: 'Minhas Avaliações',
          icon: FiClipboard,
          onClick: () => { navigate('/minhas-avaliacoes'); setMenuOpen(false); },
        }]
      : []),
    {
      label: 'Configurações',
      icon: FiSettings,
      onClick: () => { navigate('/configuracoes'); setMenuOpen(false); },
    },
    {
      label: 'Perfil',
      icon: FiUser,
      onClick: () => { navigate('/perfil'); setMenuOpen(false); },
    },
  ];

  return (
    <header className="bg-primary-500 shadow-md relative z-40">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-14">

          {/* Logo */}
          <button
            className="flex items-center gap-2 text-white active:opacity-80 transition-opacity"
            onClick={() => navigate('/dashboard')}
            aria-label="Ir para o início"
          >
            <div>
              <p className="text-lg font-bold leading-tight">SisEUs</p>
              {/* Subtítulo visível só em md+ */}
              <p className="text-[10px] opacity-80 leading-tight hidden md:block">
                Encontros Universitários
              </p>
            </div>
          </button>

          {/* Direita */}
          <div className="flex items-center gap-1">
            {/* Toggle tema */}
            <button
              onClick={toggleTheme}
              className="p-2 rounded-xl text-white hover:bg-primary-600 active:bg-primary-700 transition-colors min-h-[44px] min-w-[44px] flex items-center justify-center"
              aria-label="Alternar tema"
            >
              {theme === 'dark' ? <FiSun size={20} /> : <FiMoon size={20} />}
            </button>

            {/* Nome do usuário — só desktop */}
            {usuario && (
              <div className="hidden md:block text-white text-right mr-1">
                <p className="text-sm font-semibold leading-tight">{usuario.nome}</p>
                <p className="text-[11px] opacity-80 leading-tight">
                  {usuario.tipoUsuario || 'Usuário'}
                </p>
              </div>
            )}

            {/* Hambúrguer — só desktop (mobile usa BottomNav) */}
            <button
              onClick={() => setMenuOpen(!menuOpen)}
              className="hidden md:flex p-2 rounded-xl text-white hover:bg-primary-600 active:bg-primary-700 transition-colors min-h-[44px] min-w-[44px] items-center justify-center"
              aria-label="Menu"
            >
              {menuOpen ? <FiX size={22} /> : <FiMenu size={22} />}
            </button>
          </div>
        </div>

        {/* Dropdown menu — apenas desktop */}
        {menuOpen && (
          <div className="hidden md:block absolute right-4 top-16 bg-white dark:bg-gray-800 rounded-2xl shadow-2xl w-64 overflow-hidden border border-gray-100 dark:border-gray-700">
            {usuario && (
              <div className="px-4 py-3 bg-gray-50 dark:bg-gray-700/60 border-b border-gray-200 dark:border-gray-600">
                <p className="font-semibold text-gray-900 dark:text-white text-sm">{usuario.nome}</p>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                  {usuario.tipoUsuario || 'Usuário'}
                </p>
              </div>
            )}

            <div className="py-1.5">
              {menuItems.map((item, index) => {
                const Icon = item.icon;
                return (
                  <button
                    key={index}
                    onClick={item.onClick}
                    className="w-full flex items-center gap-3 px-4 py-3 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700/60 transition-colors"
                  >
                    <Icon size={16} />
                    <span>{item.label}</span>
                  </button>
                );
              })}

              <button
                onClick={handleLogout}
                className="w-full flex items-center gap-3 px-4 py-3 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors border-t border-gray-100 dark:border-gray-700"
              >
                <FiLogOut size={16} />
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
