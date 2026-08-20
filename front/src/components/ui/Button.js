// src/components/ui/Button.js
import React from 'react';

/**
 * Componente Button reutilizável — Mobile-first
 * - min-h-[44px]: cumpre Apple HIG / Material mínimo de área de toque
 * - active:scale-[0.97]: feedback tátil em toque
 */
const Button = ({
  children,
  onClick,
  type = 'button',
  variant = 'primary',
  size = 'md',
  disabled = false,
  fullWidth = false,
  className = '',
  ...props
}) => {
  const baseStyles =
    'inline-flex items-center justify-center font-semibold rounded-xl transition-all duration-150 ' +
    'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 ' +
    'disabled:opacity-50 disabled:cursor-not-allowed ' +
    'active:scale-[0.97] select-none min-h-[44px]';

  const variantStyles = {
    primary:   'bg-primary-500 hover:bg-primary-600 text-white focus-visible:ring-primary-500',
    secondary: 'bg-gray-100 hover:bg-gray-200 text-gray-800 focus-visible:ring-gray-400 dark:bg-gray-700 dark:hover:bg-gray-600 dark:text-white',
    success:   'bg-emerald-500 hover:bg-emerald-600 text-white focus-visible:ring-emerald-500',
    danger:    'bg-red-500 hover:bg-red-600 text-white focus-visible:ring-red-500',
    warning:   'bg-amber-500 hover:bg-amber-600 text-white focus-visible:ring-amber-500',
    outline:   'border-2 border-primary-500 text-primary-500 hover:bg-primary-50 focus-visible:ring-primary-500 dark:hover:bg-primary-900/30',
    ghost:     'text-gray-600 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-800 focus-visible:ring-gray-400',
  };

  const sizeStyles = {
    sm: 'px-3 py-1.5 text-sm gap-1.5',
    md: 'px-4 py-2.5 text-sm gap-2',
    lg: 'px-6 py-3 text-base gap-2',
  };

  const widthStyle = fullWidth ? 'w-full' : '';

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={`${baseStyles} ${variantStyles[variant] || variantStyles.primary} ${sizeStyles[size]} ${widthStyle} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
};

export default Button;
