/**
 * @fileoverview Funções utilitárias para validação de dados
 * 
 * Centralize todas as validações aqui para reutilização
 * e consistência em toda a aplicação.
 */

import { VALIDATION } from '../constants';
import { unformatCPF, isValidCPF } from './formatters';

/**
 * Valida se email é válido
 * @param {string} email - Email para validar
 * @returns {boolean} True se válido
 */
export const validateEmail = (email) => {
  if (!email) return false;
  
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

/**
 * Valida se CPF é válido
 * @param {string} cpf - CPF para validar
 * @returns {boolean} True se válido
 */
export const validateCPF = (cpf) => {
  if (!cpf) return false;
  
  const cleaned = unformatCPF(cpf);
  return cleaned.length === VALIDATION.CPF_LENGTH && isValidCPF(cpf);
};

/**
 * Valida se senha atende aos requisitos mínimos
 * @param {string} password - Senha para validar
 * @returns {{valid: boolean, errors: string[]}} Resultado da validação
 */
export const validatePassword = (password) => {
  const errors = [];
  
  if (!password) {
    errors.push('Senha é obrigatória');
    return { valid: false, errors };
  }
  
  if (password.length < VALIDATION.MIN_PASSWORD_LENGTH) {
    errors.push(`Senha deve ter no mínimo ${VALIDATION.MIN_PASSWORD_LENGTH} caracteres`);
  }
  
  return {
    valid: errors.length === 0,
    errors,
  };
};

/**
 * Valida se PIN tem formato correto
 * @param {string} pin - PIN para validar
 * @returns {boolean} True se válido
 */
export const validatePIN = (pin) => {
  if (!pin) return false;
  
  const cleaned = pin.replace(/\D/g, '');
  return cleaned.length === VALIDATION.PIN_LENGTH;
};

/**
 * Valida se campo obrigatório está preenchido
 * @param {any} value - Valor para validar
 * @returns {boolean} True se preenchido
 */
export const validateRequired = (value) => {
  if (value === null || value === undefined) return false;
  if (typeof value === 'string') return value.trim().length > 0;
  if (Array.isArray(value)) return value.length > 0;
  return true;
};

/**
 * Valida se arquivo tem tamanho válido
 * @param {File} file - Arquivo para validar
 * @returns {boolean} True se válido
 */
export const validateFileSize = (file) => {
  if (!file) return false;
  return file.size <= VALIDATION.MAX_FILE_SIZE;
};

/**
 * Valida se arquivo tem tipo válido
 * @param {File} file - Arquivo para validar
 * @param {string[]} allowedTypes - Tipos permitidos
 * @returns {boolean} True se válido
 */
export const validateFileType = (file, allowedTypes) => {
  if (!file || !allowedTypes) return false;
  return allowedTypes.includes(file.type);
};

/**
 * Valida se URL é válida
 * @param {string} url - URL para validar
 * @returns {boolean} True se válida
 */
export const validateURL = (url) => {
  if (!url) return false;
  
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
};

/**
 * Valida se data é válida
 * @param {string|Date} date - Data para validar
 * @returns {boolean} True se válida
 */
export const validateDate = (date) => {
  if (!date) return false;
  
  const d = new Date(date);
  return !isNaN(d.getTime());
};

/**
 * Valida se data está no futuro
 * @param {string|Date} date - Data para validar
 * @returns {boolean} True se está no futuro
 */
export const isFutureDate = (date) => {
  if (!validateDate(date)) return false;
  
  const d = new Date(date);
  const now = new Date();
  return d > now;
};

/**
 * Valida se data está no passado
 * @param {string|Date} date - Data para validar
 * @returns {boolean} True se está no passado
 */
export const isPastDate = (date) => {
  if (!validateDate(date)) return false;
  
  const d = new Date(date);
  const now = new Date();
  return d < now;
};

/**
 * Valida se número de telefone brasileiro é válido
 * @param {string} phone - Telefone para validar
 * @returns {boolean} True se válido
 */
export const validatePhone = (phone) => {
  if (!phone) return false;
  
  const cleaned = phone.replace(/\D/g, '');
  return cleaned.length === 10 || cleaned.length === 11;
};

/**
 * Valida formulário completo
 * @param {Object} data - Dados do formulário
 * @param {Object} rules - Regras de validação
 * @returns {{valid: boolean, errors: Object}} Resultado da validação
 * 
 * @example
 * const rules = {
 *   cpf: { required: true, validator: validateCPF },
 *   senha: { required: true, validator: validatePassword }
 * };
 * validateForm({ cpf: '123', senha: '' }, rules);
 */
export const validateForm = (data, rules) => {
  const errors = {};
  let valid = true;
  
  Object.keys(rules).forEach((field) => {
    const rule = rules[field];
    const value = data[field];
    
    // Valida campo obrigatório
    if (rule.required && !validateRequired(value)) {
      errors[field] = 'Campo obrigatório';
      valid = false;
      return;
    }
    
    // Se campo não é obrigatório e está vazio, não valida
    if (!rule.required && !validateRequired(value)) {
      return;
    }
    
    // Valida com função customizada
    if (rule.validator) {
      const result = rule.validator(value);
      
      if (typeof result === 'boolean' && !result) {
        errors[field] = rule.message || 'Campo inválido';
        valid = false;
      } else if (typeof result === 'object' && !result.valid) {
        errors[field] = result.errors?.[0] || 'Campo inválido';
        valid = false;
      }
    }
  });
  
  return { valid, errors };
};

/**
 * Sanitiza string removendo caracteres especiais
 * @param {string} str - String para sanitizar
 * @returns {string} String sanitizada
 */
export const sanitizeString = (str) => {
  if (!str) return '';
  
  return str
    .trim()
    .replace(/[<>]/g, '') // Remove tags HTML básicas
    .replace(/javascript:/gi, '') // Remove javascript:
    .replace(/on\w+=/gi, ''); // Remove event handlers
};

/**
 * Valida se coordenadas GPS são válidas
 * @param {number} latitude - Latitude
 * @param {number} longitude - Longitude
 * @returns {boolean} True se válidas
 */
export const validateCoordinates = (latitude, longitude) => {
  return (
    typeof latitude === 'number' &&
    typeof longitude === 'number' &&
    latitude >= -90 &&
    latitude <= 90 &&
    longitude >= -180 &&
    longitude <= 180
  );
};

export default {
  validateEmail,
  validateCPF,
  validatePassword,
  validatePIN,
  validateRequired,
  validateFileSize,
  validateFileType,
  validateURL,
  validateDate,
  isFutureDate,
  isPastDate,
  validatePhone,
  validateForm,
  sanitizeString,
  validateCoordinates,
};
