// src/components/ui/Card.js
import React from 'react';

/**
 * Componente Card reutilizável com Tailwind CSS
 */
const Card = ({
  children,
  title,
  subtitle,
  image,
  footer,
  className = '',
  onClick,
  hoverable = false,
}) => {
  const hoverStyle = hoverable ? 'hover:shadow-xl hover:scale-105 cursor-pointer' : '';

  return (
    <div
      className={`
        bg-white dark:bg-gray-800 
        rounded-lg shadow-md 
        overflow-hidden
        transition-all duration-300
        ${hoverStyle}
        ${className}
      `}
      onClick={onClick}
    >
      {image && (
        <div className="w-full h-48 overflow-hidden">
          <img
            src={image}
            alt={title || 'Card image'}
            className="w-full h-full object-cover"
          />
        </div>
      )}

      <div className="p-6">
        {title && (
          <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
            {title}
          </h3>
        )}

        {subtitle && (
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
            {subtitle}
          </p>
        )}

        <div className="text-gray-700 dark:text-gray-300">
          {children}
        </div>
      </div>

      {footer && (
        <div className="px-6 py-4 bg-gray-50 dark:bg-gray-700 border-t border-gray-200 dark:border-gray-600">
          {footer}
        </div>
      )}
    </div>
  );
};

export default Card;
