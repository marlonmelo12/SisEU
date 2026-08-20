// src/pages/PresencaSelecaoPage.js
import React from 'react';
import { useNavigate } from 'react-router-dom';
import Layout from '../components/layout/Layout';
import { FiLogIn, FiLogOut, FiArrowRight } from 'react-icons/fi';

/**
 * Seleção entre Check-in e Check-out — Mobile-first
 * Cards de toque grande, layout em coluna no mobile
 */
const PresencaSelecaoPage = () => {
  const navigate = useNavigate();

  return (
    <Layout>
      <div className="max-w-lg mx-auto">
        {/* Cabeçalho */}
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            Registro de Presença
          </h1>
          <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">
            Selecione o tipo de registro
          </p>
        </div>

        {/* Cards de ação */}
        <div className="flex flex-col gap-3">
          {/* Check-in */}
          <button
            onClick={() => navigate('/presenca/checkin/metodo')}
            className="w-full text-left bg-white dark:bg-gray-800 rounded-2xl p-5 border border-gray-200 dark:border-gray-700 shadow-sm hover:shadow-md active:scale-[0.98] transition-all duration-150 group"
          >
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 bg-emerald-100 dark:bg-emerald-900/40 rounded-2xl flex items-center justify-center flex-shrink-0 group-hover:bg-emerald-200 dark:group-hover:bg-emerald-900/60 transition-colors">
                <FiLogIn className="text-emerald-600 dark:text-emerald-400" size={26} />
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-bold text-gray-900 dark:text-white text-base">Check-in</p>
                <p className="text-gray-500 dark:text-gray-400 text-sm mt-0.5 leading-snug">
                  Registre sua entrada no evento
                </p>
              </div>
              <FiArrowRight className="text-gray-400 group-hover:text-emerald-500 transition-colors flex-shrink-0" size={20} />
            </div>
          </button>

          {/* Check-out */}
          <button
            onClick={() => navigate('/presenca/checkout/metodo')}
            className="w-full text-left bg-white dark:bg-gray-800 rounded-2xl p-5 border border-gray-200 dark:border-gray-700 shadow-sm hover:shadow-md active:scale-[0.98] transition-all duration-150 group"
          >
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 bg-red-100 dark:bg-red-900/40 rounded-2xl flex items-center justify-center flex-shrink-0 group-hover:bg-red-200 dark:group-hover:bg-red-900/60 transition-colors">
                <FiLogOut className="text-red-600 dark:text-red-400" size={26} />
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-bold text-gray-900 dark:text-white text-base">Check-out</p>
                <p className="text-gray-500 dark:text-gray-400 text-sm mt-0.5 leading-snug">
                  Registre sua saída do evento
                </p>
              </div>
              <FiArrowRight className="text-gray-400 group-hover:text-red-500 transition-colors flex-shrink-0" size={20} />
            </div>
          </button>
        </div>

        {/* Informação compacta */}
        <div className="mt-5 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-2xl border border-blue-100 dark:border-blue-800">
          <p className="text-xs text-blue-700 dark:text-blue-300 leading-relaxed">
            <strong>Importante:</strong> Você precisará de PIN ou QR Code e ter o GPS ativado para confirmar sua presença dentro da área do evento.
          </p>
        </div>
      </div>
    </Layout>
  );
};

export default PresencaSelecaoPage;
