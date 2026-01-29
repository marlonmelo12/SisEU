// src/pages/LoginPage.js
import React, { useState } from 'react';
import { useAuth } from '../hooks/useAuth';
import Input from '../components/ui/Input';
import Button from '../components/ui/Button';
import Alert from '../components/ui/Alert';
import { FiUser, FiLock, FiEye, FiEyeOff } from 'react-icons/fi';
import { formatCPF, unformatCPF, isValidCPF } from '../utils/formatters';
import { VALIDATION } from '../constants';

/**
 * Página de Login (RF001)
 */
const LoginPage = () => {
  const [cpf, setCpf] = useState('');
  const [senha, setSenha] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showAlert, setShowAlert] = useState(false);
  const { login, loading, error } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    console.log('[LOGIN-PAGE] handleSubmit chamado');
    console.log('[LOGIN-PAGE] CPF:', cpf, 'Senha:', senha ? '***' : 'vazia');
    setShowAlert(false);

    // Validação básica
    if (!cpf || !senha) {
      console.log('[LOGIN-PAGE] Validação falhou: campos vazios');
      setShowAlert(true);
      return;
    }

    // Validação de CPF
    if (!isValidCPF(cpf)) {
      console.log('[LOGIN-PAGE] Validação falhou: CPF inválido');
      setShowAlert(true);
      return;
    }

    // Validação de senha mínima
    if (senha.length < VALIDATION.MIN_PASSWORD_LENGTH) {
      console.log('[LOGIN-PAGE] Validação falhou: senha muito curta');
      setShowAlert(true);
      return;
    }

    // Desformatar CPF antes de enviar (remover pontos e traços)
    const cpfLimpo = unformatCPF(cpf);
    console.log('[LOGIN-PAGE] CPF limpo:', cpfLimpo);
    console.log('[LOGIN-PAGE] Chamando login...');
    
    const result = await login(cpfLimpo, senha);
    
    console.log('[LOGIN-PAGE] Resultado do login:', result);
    
    if (!result.success) {
      setShowAlert(true);
    }
  };

  const handleCPFChange = (e) => {
    const formatted = formatCPF(e.target.value);
    setCpf(formatted);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary-500 to-primary-700 px-4">
      <div className="w-full max-w-md">
        {/* Logo e Título */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-white mb-2">SisEUs</h1>
          <p className="text-primary-100">Sistema de Encontros Universitários - UFC</p>
        </div>

        {/* Card de Login */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-2xl p-8">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6 text-center">
            Entrar no Sistema
          </h2>

          {/* Alert de erro */}
          {showAlert && error && (
            <Alert
              type="error"
              message={error}
              onClose={() => setShowAlert(false)}
              className="mb-4"
            />
          )}

          {!showAlert && error && (
            <Alert
              type="error"
              message="Por favor, preencha todos os campos"
              className="mb-4"
            />
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              label="CPF"
              type="text"
              name="cpf"
              value={cpf}
              onChange={handleCPFChange}
              placeholder="000.000.000-00"
              required
              icon={<FiUser className="text-gray-400" size={18} />}
              maxLength={14}
            />

            <div className="relative">
              <Input
                label="Senha"
                type={showPassword ? "text" : "password"}
                name="senha"
                value={senha}
                onChange={(e) => setSenha(e.target.value)}
                placeholder="Digite sua senha"
                required
                icon={<FiLock className="text-gray-400" size={18} />}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-9 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
                aria-label={showPassword ? "Ocultar senha" : "Mostrar senha"}
              >
                {showPassword ? (
                  <FiEyeOff size={20} />
                ) : (
                  <FiEye size={20} />
                )}
              </button>
            </div>

            <Button
              type="submit"
              variant="primary"
              size="lg"
              fullWidth
              disabled={loading}
            >
              {loading ? 'Entrando...' : 'Entrar'}
            </Button>
          </form>

          {/* Links adicionais */}
          <div className="mt-6 text-center">
            <a
              href="#"
              className="text-sm text-primary-500 hover:text-primary-600 transition-colors"
            >
              Esqueceu sua senha?
            </a>
          </div>
        </div>

        {/* Rodapé */}
        <div className="mt-8 text-center text-primary-100 text-sm">
          <p>© 2026 Universidade Federal do Ceará</p>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
