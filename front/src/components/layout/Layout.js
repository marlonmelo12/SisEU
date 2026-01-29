// src/components/layout/Layout.js
import React from 'react';
import PropTypes from 'prop-types';
import Header from './Header';

/**
 * Layout principal da aplicação
 */
const Layout = ({ children }) => {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <Header />
      <main className="container mx-auto px-4 py-8">
        {children}
      </main>
    </div>
  );
};

Layout.propTypes = {
  children: PropTypes.node.isRequired,
};

export default Layout;
