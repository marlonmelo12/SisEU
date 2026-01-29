// src/components/ui/Alert.js
import React from 'react';
import { FiAlertCircle, FiCheckCircle, FiInfo, FiXCircle } from 'react-icons/fi';

/**
 * Componente Alert para mensagens
 */
const Alert = ({ type = 'info', title, message, onClose, className = '' }) => {
  const styles = {
    success: {
      container: 'bg-green-50 border-green-500 dark:bg-green-900/20',
      icon: 'text-green-500',
      title: 'text-green-800 dark:text-green-300',
      message: 'text-green-700 dark:text-green-400',
      Icon: FiCheckCircle,
    },
    error: {
      container: 'bg-red-50 border-red-500 dark:bg-red-900/20',
      icon: 'text-red-500',
      title: 'text-red-800 dark:text-red-300',
      message: 'text-red-700 dark:text-red-400',
      Icon: FiXCircle,
    },
    warning: {
      container: 'bg-yellow-50 border-yellow-500 dark:bg-yellow-900/20',
      icon: 'text-yellow-500',
      title: 'text-yellow-800 dark:text-yellow-300',
      message: 'text-yellow-700 dark:text-yellow-400',
      Icon: FiAlertCircle,
    },
    info: {
      container: 'bg-blue-50 border-blue-500 dark:bg-blue-900/20',
      icon: 'text-blue-500',
      title: 'text-blue-800 dark:text-blue-300',
      message: 'text-blue-700 dark:text-blue-400',
      Icon: FiInfo,
    },
  };

  const style = styles[type];
  const Icon = style.Icon;

  return (
    <div
      className={`
        flex items-start gap-3 p-4 
        border-l-4 rounded-lg 
        ${style.container} ${className}
      `}
    >
      <Icon className={`${style.icon} flex-shrink-0 mt-0.5`} size={20} />
      
      <div className="flex-1">
        {title && (
          <h4 className={`font-semibold ${style.title} mb-1`}>
            {title}
          </h4>
        )}
        {message && (
          <p className={`text-sm ${style.message}`}>
            {message}
          </p>
        )}
      </div>

      {onClose && (
        <button
          onClick={onClose}
          className={`${style.icon} hover:opacity-70 transition-opacity`}
        >
          <FiXCircle size={20} />
        </button>
      )}
    </div>
  );
};

export default Alert;
