// src/pages/MetodoSelecaoPage.js
import React from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import Layout from '../components/layout/Layout';
import Button from '../components/ui/Button';
import { FiHash, FiCamera, FiAlertCircle } from 'react-icons/fi';
import { useGeolocation } from '../features/presence/hooks/useGeolocation';

/**
 * Página de seleção do método de validação (PIN ou QR Code)
 * Funciona tanto para check-in quanto check-out
 */
const MetodoSelecaoPage = () => {
  const navigate = useNavigate();
  const { tipo } = useParams(); // 'checkin' ou 'checkout'
  const { isPermitted, error } = useGeolocation(true);

  const isCheckin = tipo === 'checkin';
  const tituloAcao = isCheckin ? 'Check-in' : 'Check-out';
  const corPrimaria = isCheckin ? 'green' : 'red';

  const handleMetodoSelecionado = (metodo) => {
    if (metodo === 'qr' && !isPermitted) {
      return; // Não permite QR Code sem GPS
    }
    navigate(`/presenca/${tipo}/${metodo}`);
  };

  return (
    <Layout>
      <div className="max-w-2xl mx-auto px-4 py-8">
        {/* Cabeçalho */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            {tituloAcao}
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Escolha o método de validação
          </p>
        </div>

        {/* Status do GPS */}
        <div className={`mb-6 rounded-lg p-4 ${
          isPermitted 
            ? 'bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800' 
            : 'bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800'
        }`}>
          <div className="flex items-start">
            <FiAlertCircle 
              className={`mt-0.5 mr-3 ${
                isPermitted 
                  ? 'text-green-600 dark:text-green-400' 
                  : 'text-yellow-600 dark:text-yellow-400'
              }`}
              size={20}
            />
            <div>
              <p className={`font-medium ${
                isPermitted 
                  ? 'text-green-900 dark:text-green-300' 
                  : 'text-yellow-900 dark:text-yellow-300'
              }`}>
                {isPermitted ? 'Geolocalização ativada' : 'Geolocalização necessária'}
              </p>
              <p className={`text-sm mt-1 ${
                isPermitted 
                  ? 'text-green-700 dark:text-green-400' 
                  : 'text-yellow-700 dark:text-yellow-400'
              }`}>
                {isPermitted 
                  ? 'Você pode prosseguir com qualquer método de validação.'
                  : error || 'Por favor, ative a geolocalização para usar o QR Code.'}
              </p>
            </div>
          </div>
        </div>

        {/* Opções de método */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Método PIN */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-8 hover:shadow-xl transition-shadow">
            <div className="flex flex-col items-center text-center">
              <div className={`bg-${corPrimaria}-100 dark:bg-${corPrimaria}-900 rounded-full p-6 mb-4`}>
                <FiHash className={`text-${corPrimaria}-600 dark:text-${corPrimaria}-400`} size={40} />
              </div>
              <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                Código PIN
              </h2>
              <p className="text-gray-600 dark:text-gray-400 mb-6">
                Digite o código fornecido pela organização
              </p>
              <Button
                variant="primary"
                onClick={() => handleMetodoSelecionado('pin')}
                className="w-full"
              >
                Usar PIN
              </Button>
            </div>
          </div>

          {/* Método QR Code */}
          <div className={`bg-white dark:bg-gray-800 rounded-lg shadow-lg p-8 transition-shadow ${
            isPermitted ? 'hover:shadow-xl' : 'opacity-60'
          }`}>
            <div className="flex flex-col items-center text-center">
              <div className={`bg-${corPrimaria}-100 dark:bg-${corPrimaria}-900 rounded-full p-6 mb-4`}>
                <FiCamera className={`text-${corPrimaria}-600 dark:text-${corPrimaria}-400`} size={40} />
              </div>
              <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                QR Code
              </h2>
              <p className="text-gray-600 dark:text-gray-400 mb-6">
                Escaneie o código com a câmera
              </p>
              <Button
                variant="secondary"
                onClick={() => handleMetodoSelecionado('qr')}
                disabled={!isPermitted}
                className="w-full"
              >
                {isPermitted ? 'Escanear QR Code' : 'GPS Desativado'}
              </Button>
            </div>
          </div>
        </div>

        {/* Informações */}
        <div className="mt-8 bg-gray-50 dark:bg-gray-800 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
            Como funciona?
          </h3>
          <div className="space-y-3 text-gray-700 dark:text-gray-300">
            <div className="flex items-start">
              <span className="font-bold mr-2">1.</span>
              <span>Escolha o método de validação (PIN ou QR Code)</span>
            </div>
            <div className="flex items-start">
              <span className="font-bold mr-2">2.</span>
              <span>Complete a validação inicial</span>
            </div>
            <div className="flex items-start">
              <span className="font-bold mr-2">3.</span>
              <span>O sistema verificará sua localização automaticamente</span>
            </div>
            <div className="flex items-start">
              <span className="font-bold mr-2">4.</span>
              <span>Se você estiver na área do evento, seu {tituloAcao.toLowerCase()} será confirmado</span>
            </div>
          </div>
        </div>

        {/* Botão voltar */}
        <div className="mt-6 text-center">
          <button
            onClick={() => navigate('/presenca')}
            className="text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors"
          >
            ← Voltar
          </button>
        </div>
      </div>
    </Layout>
  );
};

export default MetodoSelecaoPage;
