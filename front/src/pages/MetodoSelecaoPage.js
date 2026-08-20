// src/pages/MetodoSelecaoPage.js
import React from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import Layout from '../components/layout/Layout';
import Button from '../components/ui/Button';
import { FiHash, FiCamera, FiMapPin, FiCheckCircle, FiArrowLeft } from 'react-icons/fi';
import { useGeolocation } from '../features/presence/hooks/useGeolocation';

/**
 * Seleção do método de validação — Mobile-first
 * - Step indicator (Passo 1 de 2)
 * - Radio cards selecionáveis
 * - GPS status compacto
 */
const MetodoSelecaoPage = () => {
  const navigate = useNavigate();
  const { tipo } = useParams();
  const { isPermitted, error } = useGeolocation(true);
  const [metodoSelecionado, setMetodoSelecionado] = React.useState('pin');

  const isCheckin = tipo === 'checkin';
  const tituloAcao = isCheckin ? 'Check-in' : 'Check-out';

  const handleConfirmar = () => {
    if (!isPermitted) return;
    navigate(`/presenca/${tipo}/${metodoSelecionado === 'qr' ? 'qr' : 'pin'}`);
  };

  const metodos = [
    {
      id: 'pin',
      label: 'Código PIN',
      desc: isPermitted
        ? 'Digite o código de 6 dígitos fornecido pela organização'
        : 'GPS necessário para usar o PIN',
      icon: FiHash,
      available: isPermitted,
    },
    {
      id: 'qr',
      label: 'QR Code',
      desc: isPermitted
        ? 'Escaneie o código exibido na tela do evento'
        : 'GPS necessário para usar QR Code',
      icon: FiCamera,
      available: isPermitted,
    },
  ];

  return (
    <Layout>
      <div className="max-w-lg mx-auto">
        {/* Botão voltar */}
        <button
          onClick={() => navigate('/presenca')}
          className="flex items-center gap-1.5 text-sm text-gray-500 dark:text-gray-400 hover:text-gray-800 dark:hover:text-white mb-5 transition-colors min-h-[44px]"
        >
          <FiArrowLeft size={16} /> Voltar
        </button>

        {/* Step Indicator */}
        <div className="flex items-center gap-2 mb-5">
          <div className="flex items-center gap-1.5">
            <div className="w-7 h-7 rounded-full bg-primary-500 text-white text-xs font-bold flex items-center justify-center">1</div>
            <span className="text-xs font-semibold text-primary-600 dark:text-primary-400">Método</span>
          </div>
          <div className="flex-1 h-px bg-gray-200 dark:bg-gray-700" />
          <div className="flex items-center gap-1.5">
            <div className="w-7 h-7 rounded-full bg-gray-200 dark:bg-gray-700 text-gray-400 dark:text-gray-500 text-xs font-bold flex items-center justify-center">2</div>
            <span className="text-xs text-gray-400">GPS</span>
          </div>
        </div>

        {/* Título */}
        <div className="mb-4">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">{tituloAcao}</h1>
          <p className="text-gray-500 dark:text-gray-400 text-sm mt-0.5">Escolha como validar sua presença</p>
        </div>

        {/* GPS status — compacto */}
        <div className={`flex items-center gap-2.5 p-3 rounded-xl mb-4 text-sm ${
          isPermitted
            ? 'bg-emerald-50 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-300'
            : 'bg-amber-50 dark:bg-amber-900/20 text-amber-700 dark:text-amber-300'
        }`}>
          <FiMapPin size={16} className="flex-shrink-0" />
          <span className="text-xs">
            {isPermitted
              ? 'Geolocalização ativada — métodos disponíveis'
              : error || 'Ative o GPS para prosseguir com a presença'}
          </span>
        </div>

        {/* Radio Cards */}
        <div className="flex flex-col gap-3 mb-5">
          {metodos.map((m) => {
            const Icon = m.icon;
            const selected = metodoSelecionado === m.id;
            return (
              <button
                key={m.id}
                onClick={() => m.available && setMetodoSelecionado(m.id)}
                disabled={!m.available}
                className={`w-full text-left p-4 rounded-2xl border-2 transition-all duration-150 ${
                  !m.available
                    ? 'opacity-50 cursor-not-allowed border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800'
                    : selected
                    ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/20'
                    : 'border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 hover:border-gray-300 dark:hover:border-gray-600 active:scale-[0.99]'
                }`}
              >
                <div className="flex items-center gap-4">
                  <div className={`w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 ${
                    selected
                      ? 'bg-primary-500 text-white'
                      : 'bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-400'
                  }`}>
                    <Icon size={22} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className={`font-bold text-sm ${selected ? 'text-primary-700 dark:text-primary-300' : 'text-gray-900 dark:text-white'}`}>
                      {m.label}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5 leading-snug">
                      {m.desc}
                    </p>
                  </div>
                  {selected && m.available && (
                    <FiCheckCircle className="text-primary-500 flex-shrink-0" size={20} />
                  )}
                </div>
              </button>
            );
          })}
        </div>

        {/* Botão confirmar */}
        <Button
          variant="primary"
          onClick={handleConfirmar}
          fullWidth
          disabled={!isPermitted}
          className="text-base font-bold py-3.5"
        >
          Continuar com {metodoSelecionado === 'pin' ? 'PIN' : 'QR Code'}
        </Button>
      </div>
    </Layout>
  );
};

export default MetodoSelecaoPage;
