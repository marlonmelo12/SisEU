// src/pages/PinValidacaoPage.js
import React, { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import Layout from '../components/layout/Layout';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import Alert from '../components/ui/Alert';
import { FiHash, FiLoader } from 'react-icons/fi';
import checkinService from '../services/checkinService';

/**
 * Página de validação via PIN
 * Funciona tanto para check-in quanto check-out
 */
const PinValidacaoPage = () => {
  const navigate = useNavigate();
  const { tipo } = useParams(); // 'checkin' ou 'checkout'
  const [pin, setPin] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const isCheckin = tipo === 'checkin';
  const tituloAcao = isCheckin ? 'Check-in' : 'Check-out';

  const handlePinChange = (e) => {
    const value = e.target.value.replace(/\D/g, ''); // Apenas números
    if (value.length <= 6) {
      setPin(value);
      setError(null);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (pin.length !== 6) {
      setError('O PIN deve conter 6 dígitos');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // Valida o PIN na API
      const validacao = await checkinService.validarPin(pin);

      if (validacao.valid) {
        // Armazena o PIN validado e dados do evento
        localStorage.setItem('pinValidado', pin);
        localStorage.setItem('tipoPresenca', tipo);
        localStorage.setItem('eventoId', validacao.eventoId);
        if (validacao.sessaoId) {
          localStorage.setItem('sessaoId', validacao.sessaoId);
        }

        // Redireciona para validação de geolocalização
        navigate(`/presenca/${tipo}/geolocalizacao`);
      } else {
        setError('PIN inválido ou expirado. Tente novamente.');
      }
    } catch (err) {
      setError(err.message || 'PIN inválido ou expirado. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Layout>
      <div className="max-w-md mx-auto px-4 py-8">
        {/* Cabeçalho */}
        <div className="text-center mb-8">
          <div className="inline-block bg-primary-100 dark:bg-primary-900 rounded-full p-4 mb-4">
            <FiHash className="text-primary-600 dark:text-primary-400" size={40} />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            {tituloAcao} via PIN
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Digite o código fornecido pela organização do evento
          </p>
        </div>

        {/* Formulário */}
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Código PIN
            </label>
            <Input
              type="text"
              placeholder="000000"
              value={pin}
              onChange={handlePinChange}
              maxLength={6}
              className="text-center text-2xl font-mono tracking-widest"
              autoFocus
            />
            <p className="mt-2 text-sm text-gray-500 dark:text-gray-400 text-center">
              {pin.length}/6 dígitos
            </p>
          </div>

          {/* Mensagens de erro */}
          {error && (
            <Alert type="error" message={error} />
          )}

          {/* Botões */}
          <div className="space-y-3">
            <Button
              type="submit"
              variant="primary"
              disabled={loading || pin.length !== 6}
              className="w-full"
            >
              {loading ? (
                <span className="flex items-center justify-center">
                  <FiLoader className="animate-spin mr-2" />
                  Validando...
                </span>
              ) : (
                `Validar ${tituloAcao}`
              )}
            </Button>

            <button
              type="button"
              onClick={() => navigate(`/presenca/${tipo}/metodo`)}
              className="w-full text-center text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors"
              disabled={loading}
            >
              Voltar
            </button>
          </div>
        </form>

        {/* Informações adicionais */}
        <div className="mt-8 bg-blue-50 dark:bg-blue-900/20 rounded-lg p-6">
          <h3 className="text-sm font-semibold text-blue-900 dark:text-blue-300 mb-2">
            Onde encontrar o PIN?
          </h3>
          <ul className="space-y-2 text-sm text-blue-800 dark:text-blue-200">
            <li className="flex items-start">
              <span className="mr-2">•</span>
              <span>No material impresso do evento</span>
            </li>
            <li className="flex items-start">
              <span className="mr-2">•</span>
              <span>Na tela de projeção do auditório</span>
            </li>
            <li className="flex items-start">
              <span className="mr-2">•</span>
              <span>Com os organizadores do evento</span>
            </li>
          </ul>
        </div>
      </div>
    </Layout>
  );
};

export default PinValidacaoPage;
