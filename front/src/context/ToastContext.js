// src/context/ToastContext.js
import React, { createContext, useState, useContext, useCallback } from 'react';
import { FiCheckCircle, FiAlertCircle, FiInfo, FiXCircle, FiX } from 'react-icons/fi';

export const ToastContext = createContext();

export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast deve ser utilizado dentro de um ToastProvider');
  }
  return context;
};

export const ToastProvider = ({ children }) => {
  const [toasts, setToasts] = useState([]);

  const addToast = useCallback((message, type = 'success', duration = 4000) => {
    const id = Date.now() + Math.random();
    setToasts((prev) => [...prev, { id, message, type, duration }]);

    if (duration > 0) {
      setTimeout(() => {
        removeToast(id);
      }, duration);
    }
  }, []);

  const removeToast = useCallback((id) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id));
  }, []);

  const getToastIcon = (type) => {
    switch (type) {
      case 'success':
        return <FiCheckCircle className="text-emerald-400 text-xl flex-shrink-0" />;
      case 'error':
        return <FiXCircle className="text-rose-400 text-xl flex-shrink-0" />;
      case 'warning':
        return <FiAlertCircle className="text-amber-400 text-xl flex-shrink-0" />;
      case 'info':
      default:
        return <FiInfo className="text-sky-400 text-xl flex-shrink-0" />;
    }
  };

  const getToastStyle = (type) => {
    switch (type) {
      case 'success':
        return 'border-emerald-500/30 bg-gray-900/90 text-white shadow-emerald-500/10';
      case 'error':
        return 'border-rose-500/30 bg-gray-900/90 text-white shadow-rose-500/10';
      case 'warning':
        return 'border-amber-500/30 bg-gray-900/90 text-white shadow-amber-500/10';
      case 'info':
      default:
        return 'border-sky-500/30 bg-gray-900/90 text-white shadow-sky-500/10';
    }
  };

  return (
    <ToastContext.Provider value={{ showToast: addToast, removeToast }}>
      {children}
      
      {/* Container de Toasts Flutuantes */}
      <div className="fixed bottom-5 right-5 z-50 flex flex-col gap-3 max-w-sm w-full pointer-events-none px-4 md:px-0">
        {toasts.map((toast) => (
          <div
            key={toast.id}
            className={`pointer-events-auto flex items-start gap-3 p-4 rounded-xl border backdrop-blur-md shadow-2xl transition-all transform animate-slide-up ${getToastStyle(
              toast.type
            )}`}
          >
            {getToastIcon(toast.type)}
            <div className="flex-1 text-sm font-medium pr-2 break-words">
              {toast.message}
            </div>
            <button
              onClick={() => removeToast(toast.id)}
              className="text-gray-400 hover:text-white transition-colors p-1"
              aria-label="Fechar notificação"
            >
              <FiX size={16} />
            </button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
};
