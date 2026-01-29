// src/components/checkin/CheckinModal.js
import React, { useState } from 'react';
import PropTypes from 'prop-types';
import Modal from '../ui/Modal';
import Input from '../ui/Input';
import Button from '../ui/Button';
import Alert from '../ui/Alert';
import { useCheckin } from '../../hooks/useCheckin';
import { FiKey, FiMapPin } from 'react-icons/fi';

/**
 * Modal de Check-in com PIN e GPS
 */
const CheckinModal = ({ isOpen, onClose, tipoParticipacao = 'OUVINTE' }) => {
  const [pin, setPin] = useState('');
  const [step, setStep] = useState(1); // 1: PIN, 2: GPS, 3: Sucesso
  const [dadosEvento, setDadosEvento] = useState(null);
  
  const {
    loading,
    error,
    validarPin,
    realizarCheckin,
    solicitarGPS,
  } = useCheckin();

  const handleValidarPin = async () => {
    if (pin.length !== 6) {
      alert('PIN deve ter 6 dígitos');
      return;
    }

    const resultado = await validarPin(pin);
    
    if (resultado.success) {
      setDadosEvento(resultado.data);
      setStep(2);
    }
  };

  const handleSolicitarGPS = async () => {
    const resultado = await solicitarGPS();
    
    if (resultado.success) {
      // GPS obtido com sucesso, agora registra check-in
      await handleRegistrarCheckin();
    }
  };

  const handleRegistrarCheckin = async () => {
    const resultado = await realizarCheckin(
      pin,
      dadosEvento?.eventoId,
      dadosEvento?.sessaoId,
      tipoParticipacao
    );

    if (resultado.success) {
      setStep(3);
      setTimeout(() => {
        handleClose();
      }, 3000);
    }
  };

  const handleClose = () => {
    setPin('');
    setStep(1);
    setDadosEvento(null);
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title={`Check-in - ${tipoParticipacao === 'APRESENTADOR' ? 'Apresentador' : 'Ouvinte'}`}
      size="md"
    >
      <div className="space-y-6">
        {/* Step 1: Validar PIN */}
        {step === 1 && (
          <>
            <p className="text-gray-600 dark:text-gray-400">
              Digite o PIN de 6 dígitos fornecido pelo organizador
            </p>

            <Input
              label="PIN"
              type="text"
              value={pin}
              onChange={(e) => setPin(e.target.value.replace(/\D/g, '').slice(0, 6))}
              placeholder="000000"
              maxLength={6}
              icon={<FiKey className="text-gray-400" />}
            />

            {error && (
              <Alert type="error" message={error} />
            )}

            <Button
              variant="primary"
              fullWidth
              onClick={handleValidarPin}
              disabled={loading || pin.length !== 6}
            >
              {loading ? 'Validando...' : 'Continuar'}
            </Button>
          </>
        )}

        {/* Step 2: Solicitar GPS */}
        {step === 2 && (
          <>
            <div className="text-center">
              <FiMapPin className="mx-auto text-primary-500 mb-4" size={48} />
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                Verificação de Localização
              </h3>
              <p className="text-gray-600 dark:text-gray-400">
                Precisamos verificar se você está no local do evento. 
                Por favor, permita o acesso à sua localização.
              </p>
            </div>

            {error && (
              <Alert type="error" message={error} />
            )}

            <Button
              variant="primary"
              fullWidth
              onClick={handleSolicitarGPS}
              disabled={loading}
            >
              {loading ? 'Verificando localização...' : 'Permitir Localização'}
            </Button>

            <Button
              variant="outline"
              fullWidth
              onClick={() => setStep(1)}
            >
              Voltar
            </Button>
          </>
        )}

        {/* Step 3: Sucesso */}
        {step === 3 && (
          <div className="text-center py-8">
            <div className="w-16 h-16 bg-green-100 dark:bg-green-900 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg
                className="w-8 h-8 text-green-500"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M5 13l4 4L19 7"
                />
              </svg>
            </div>
            
            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
              Check-in realizado!
            </h3>
            <p className="text-gray-600 dark:text-gray-400">
              Sua presença foi registrada com sucesso.
            </p>
          </div>
        )}
      </div>
    </Modal>
  );
};

CheckinModal.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  tipoParticipacao: PropTypes.oneOf(['OUVINTE', 'APRESENTADOR', 'ORGANIZADOR']),
};

export default CheckinModal;
