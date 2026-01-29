// src/components/ui/EmptyState.js
import React from 'react';
import Button from './Button';

/**
 * Componente EmptyState para quando não há dados
 */
const EmptyState = ({
  icon: Icon,
  title = 'Nenhum item encontrado',
  description,
  actionLabel,
  onAction,
}) => {
  return (
    <div className="text-center py-12">
      {Icon && (
        <Icon className="mx-auto text-gray-400 dark:text-gray-600 mb-4" size={64} />
      )}
      
      <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
        {title}
      </h3>
      
      {description && (
        <p className="text-gray-600 dark:text-gray-400 mb-6 max-w-md mx-auto">
          {description}
        </p>
      )}
      
      {actionLabel && onAction && (
        <Button variant="primary" onClick={onAction}>
          {actionLabel}
        </Button>
      )}
    </div>
  );
};

export default EmptyState;
