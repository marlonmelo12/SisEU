// src/components/ui/Loading.js
import React from 'react';

/**
 * Componente Loading reutilizável
 */
const Loading = ({ size = 'md', text = 'Carregando...', fullScreen = false }) => {
  const sizes = {
    sm: 'h-6 w-6 border-2',
    md: 'h-12 w-12 border-2',
    lg: 'h-16 w-16 border-4',
  };

  const Container = fullScreen ? 'div' : React.Fragment;
  const containerProps = fullScreen ? {
    className: 'fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50'
  } : {};

  return (
    <Container {...containerProps}>
      <div className={`text-center ${fullScreen ? 'bg-white dark:bg-gray-800 p-8 rounded-lg' : 'py-12'}`}>
        <div
          className={`
            ${sizes[size]}
            animate-spin rounded-full 
            border-primary-500 border-t-transparent 
            mx-auto
          `}
        />
        {text && (
          <p className="mt-4 text-gray-600 dark:text-gray-400">
            {text}
          </p>
        )}
      </div>
    </Container>
  );
};

export default Loading;
