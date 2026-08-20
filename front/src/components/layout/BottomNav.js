// src/components/layout/BottomNav.js
import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { FiHome, FiCheckSquare, FiClipboard, FiUser } from 'react-icons/fi';
import { useAuth } from '../../hooks/useAuth';

/**
 * Bottom Navigation Bar — Mobile-first (visível apenas em telas < md)
 * Substitui o menu hambúrguer para navegação principal no mobile.
 * Em desktop, fica oculto (hidden md:hidden).
 */
const BottomNav = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { usuario } = useAuth();

  const isProfessorOuAvaliador =
    usuario?.tipoUsuario === 'PROFESSOR' || usuario?.tipoUsuario === 'AVALIADOR';
  const isAdmin = usuario?.tipoUsuario === 'ADMINISTRADOR';

  const isEstudanteOuAdmin =
    usuario?.tipoUsuario === 'ESTUDANTE' || usuario?.tipoUsuario === 'ADMINISTRADOR';

  const items = [
    {
      label: 'Início',
      icon: FiHome,
      path: isAdmin ? '/admin' : '/dashboard',
      match: ['/dashboard', '/admin'],
    },
    ...(isEstudanteOuAdmin
      ? [{
          label: 'Presença',
          icon: FiCheckSquare,
          path: '/presenca',
          match: ['/presenca'],
        }]
      : []),
    ...(isProfessorOuAvaliador
      ? [{
          label: 'Avaliações',
          icon: FiClipboard,
          path: '/minhas-avaliacoes',
          match: ['/minhas-avaliacoes', '/avaliacoes'],
        }]
      : []),
    {
      label: 'Perfil',
      icon: FiUser,
      path: '/perfil',
      match: ['/perfil', '/configuracoes'],
    },
  ];

  const isActive = (item) =>
    item.match.some((p) => location.pathname.startsWith(p));

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-800 bottom-nav-safe">
      <div className="flex items-stretch">
        {items.map((item) => {
          const Icon = item.icon;
          const active = isActive(item);
          return (
            <button
              key={item.path}
              onClick={() => navigate(item.path)}
              className={`flex-1 flex flex-col items-center justify-center gap-0.5 pt-2.5 pb-1 transition-colors min-h-[56px] ${
                active
                  ? 'text-primary-600 dark:text-primary-400'
                  : 'text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300'
              }`}
              aria-label={item.label}
            >
              <div className={`relative p-1 rounded-xl transition-all ${active ? 'bg-primary-50 dark:bg-primary-900/30' : ''}`}>
                <Icon size={22} strokeWidth={active ? 2.5 : 1.8} />
                {active && (
                  <span className="absolute top-0.5 right-0.5 w-1.5 h-1.5 bg-primary-500 rounded-full" />
                )}
              </div>
              <span className={`text-[10px] font-medium leading-none ${active ? 'font-semibold' : ''}`}>
                {item.label}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
};

export default BottomNav;
