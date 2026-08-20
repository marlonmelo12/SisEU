// src/components/layout/Layout.js
import React from 'react';
import PropTypes from 'prop-types';
import Header from './Header';
import BottomNav from './BottomNav';

/**
 * Layout principal da aplicação — Mobile-first
 * - Header compacto em mobile, BottomNav para navegação
 * - main-content-mobile: padding-bottom reserva espaço para o BottomNav
 */
const Layout = ({ children }) => {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <Header />
      <main className="container mx-auto px-4 py-6 main-content-mobile">
        {children}
      </main>
      <BottomNav />
    </div>
  );
};

Layout.propTypes = {
  children: PropTypes.node.isRequired,
};

export default Layout;
