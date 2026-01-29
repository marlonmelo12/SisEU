// src/pages/PresencaSelecaoPage.js
import React from 'react';
import { useNavigate } from 'react-router-dom';
import Layout from '../components/layout/Layout';
import Button from '../components/ui/Button';
import { FiLogIn, FiLogOut } from 'react-icons/fi';

/**
 * Página de seleção entre Check-in e Check-out
 */
const PresencaSelecaoPage = () => {
  const navigate = useNavigate();

  return (
    <Layout>
      <div className="max-w-2xl mx-auto px-4 py-8">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
            Registro de Presença
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Selecione o tipo de registro que deseja realizar
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Card Check-in */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-8 hover:shadow-xl transition-shadow">
            <div className="flex flex-col items-center text-center">
              <div className="bg-green-100 dark:bg-green-900 rounded-full p-6 mb-4">
                <FiLogIn className="text-green-600 dark:text-green-400" size={48} />
              </div>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                Check-in
              </h2>
              <p className="text-gray-600 dark:text-gray-400 mb-6">
                Registre sua entrada no evento
              </p>
              <Button
                variant="primary"
                size="lg"
                onClick={() => navigate('/presenca/checkin/metodo')}
                className="w-full"
              >
                Fazer Check-in
              </Button>
            </div>
          </div>

          {/* Card Check-out */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-8 hover:shadow-xl transition-shadow">
            <div className="flex flex-col items-center text-center">
              <div className="bg-red-100 dark:bg-red-900 rounded-full p-6 mb-4">
                <FiLogOut className="text-red-600 dark:text-red-400" size={48} />
              </div>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                Check-out
              </h2>
              <p className="text-gray-600 dark:text-gray-400 mb-6">
                Registre sua saída do evento
              </p>
              <Button
                variant="secondary"
                size="lg"
                onClick={() => navigate('/presenca/checkout/metodo')}
                className="w-full"
              >
                Fazer Check-out
              </Button>
            </div>
          </div>
        </div>

        {/* Informações adicionais */}
        <div className="mt-8 bg-blue-50 dark:bg-blue-900/20 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-blue-900 dark:text-blue-300 mb-2">
            Importante
          </h3>
          <ul className="space-y-2 text-blue-800 dark:text-blue-200">
            <li className="flex items-start">
              <span className="mr-2">•</span>
              <span>Você precisará validar sua presença com PIN ou QR Code</span>
            </li>
            <li className="flex items-start">
              <span className="mr-2">•</span>
              <span>A geolocalização deve estar ativada para confirmar sua presença</span>
            </li>
            <li className="flex items-start">
              <span className="mr-2">•</span>
              <span>Você deve estar dentro da área do evento para concluir o registro</span>
            </li>
          </ul>
        </div>
      </div>
    </Layout>
  );
};

export default PresencaSelecaoPage;
