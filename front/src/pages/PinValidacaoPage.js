// src/pages/PinValidacaoPage.js
import React, { useState, useRef, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import Layout from '../components/layout/Layout';
import Button from '../components/ui/Button';
import { FiHash, FiLoader, FiArrowLeft, FiAlertTriangle } from 'react-icons/fi';
import checkinService from '../services/checkinService';
import { useGeolocation } from '../features/presence/hooks/useGeolocation';

/**
 * Validação via PIN — Mobile-first OTP Input
 * - 6 campos individuais com auto-avanço e auto-retrocesso
 * - inputmode="numeric" força teclado numérico no mobile
 * - Auto-submit ao completar o 6º dígito
 * - Animação de shake em erro
 */
const PinValidacaoPage = () => {
  const navigate = useNavigate();
  const { tipo } = useParams();
  const { isPermitted } = useGeolocation(true);
  const [digits, setDigits] = useState(['', '', '', '', '', '']);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [shake, setShake] = useState(false);
  const [success, setSuccess] = useState(false);
  const inputRefs = useRef([]);

  const isCheckin = tipo === 'checkin';
  const tituloAcao = isCheckin ? 'Check-in' : 'Check-out';
  const pin = digits.join('');

  // Auto-foca o primeiro campo ao montar
  useEffect(() => {
    inputRefs.current[0]?.focus();
  }, []);

  const handleChange = (index, value) => {
    // Aceita apenas dígitos
    const digit = value.replace(/\D/g, '').slice(-1);
    const newDigits = [...digits];
    newDigits[index] = digit;
    setDigits(newDigits);
    setError(null);

    // Avança para o próximo campo
    if (digit && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }

    // Auto-submit ao completar o 6º dígito
    if (digit && index === 5) {
      const fullPin = newDigits.join('');
      if (fullPin.length === 6) {
        handleSubmit(fullPin);
      }
    }
  };

  const handleKeyDown = (index, e) => {
    if (e.key === 'Backspace' && !digits[index] && index > 0) {
      // Retrocede ao campo anterior ao apagar campo vazio
      inputRefs.current[index - 1]?.focus();
      const newDigits = [...digits];
      newDigits[index - 1] = '';
      setDigits(newDigits);
    }
    if (e.key === 'ArrowLeft' && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
    if (e.key === 'ArrowRight' && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  // Suporte a colar (paste) o PIN inteiro
  const handlePaste = (e) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6);
    if (!pasted) return;
    const newDigits = Array(6).fill('');
    pasted.split('').forEach((d, i) => { newDigits[i] = d; });
    setDigits(newDigits);
    const lastFilled = Math.min(pasted.length, 5);
    inputRefs.current[lastFilled]?.focus();
    if (pasted.length === 6) handleSubmit(pasted);
  };

  const triggerShake = () => {
    setShake(true);
    setTimeout(() => setShake(false), 600);
  };

  const handleSubmit = async (pinValue) => {
    const pinToValidate = pinValue || pin;
    if (pinToValidate.length !== 6) {
      setError('O PIN deve conter 6 dígitos');
      triggerShake();
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const validacao = await checkinService.validarPin(pinToValidate, tipo);

      if (validacao.valid) {
        setSuccess(true);
        localStorage.setItem('pinValidado', pinToValidate);
        localStorage.setItem('tipoPresenca', tipo);
        localStorage.setItem('eventoId', validacao.eventoId);
        if (validacao.sessaoId) localStorage.setItem('sessaoId', validacao.sessaoId);

        setTimeout(() => {
          navigate(`/presenca/${tipo}/geolocalizacao`);
        }, 500);
      } else {
        setError('PIN inválido ou expirado.');
        triggerShake();
        setDigits(['', '', '', '', '', '']);
        setTimeout(() => inputRefs.current[0]?.focus(), 100);
      }
    } catch (err) {
      setError(err.message || 'PIN inválido ou expirado.');
      triggerShake();
      setDigits(['', '', '', '', '', '']);
      setTimeout(() => inputRefs.current[0]?.focus(), 100);
    } finally {
      setLoading(false);
    }
  };

  const boxColor = (index) => {
    const d = digits[index];
    if (success) return 'border-emerald-500 bg-emerald-50 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-300';
    if (error && d) return 'border-red-400 bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-300';
    if (d) return 'border-primary-500 bg-primary-50 dark:bg-primary-900/20 text-primary-700 dark:text-primary-300';
    return 'border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white';
  };

  return (
    <Layout>
      <div className="max-w-sm mx-auto">
        {/* Voltar */}
        <button
          onClick={() => navigate(`/presenca/${tipo}/metodo`)}
          className="flex items-center gap-1.5 text-sm text-gray-500 dark:text-gray-400 hover:text-gray-800 dark:hover:text-white mb-5 transition-colors min-h-[44px]"
        >
          <FiArrowLeft size={16} /> Voltar
        </button>

        {/* Step Indicator */}
        <div className="flex items-center gap-2 mb-6">
          <div className="flex items-center gap-1.5">
            <div className="w-7 h-7 rounded-full bg-primary-100 dark:bg-primary-900/40 text-primary-600 dark:text-primary-400 text-xs font-bold flex items-center justify-center">1</div>
            <span className="text-xs text-gray-400">Método</span>
          </div>
          <div className="flex-1 h-px bg-primary-200 dark:bg-primary-800" />
          <div className="flex items-center gap-1.5">
            <div className="w-7 h-7 rounded-full bg-primary-500 text-white text-xs font-bold flex items-center justify-center">2</div>
            <span className="text-xs font-semibold text-primary-600 dark:text-primary-400">PIN</span>
          </div>
        </div>

        {/* Ícone + título */}
        <div className="text-center mb-7">
          <div className={`inline-flex items-center justify-center w-16 h-16 rounded-2xl mb-4 ${
            success ? 'bg-emerald-100 dark:bg-emerald-900/30' : 'bg-primary-100 dark:bg-primary-900/30'
          }`}>
            <FiHash
              size={30}
              className={success ? 'text-emerald-600 dark:text-emerald-400' : 'text-primary-600 dark:text-primary-400'}
            />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">{tituloAcao} via PIN</h1>
          <p className="text-gray-500 dark:text-gray-400 text-sm mt-1.5">
            Digite o código de 6 dígitos
          </p>
        </div>

        {/* Alerta de GPS necessário */}
        {!isPermitted && (
          <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 text-amber-800 dark:text-amber-200 text-xs rounded-2xl p-4 mb-5 flex items-start gap-2.5">
            <FiAlertTriangle size={18} className="flex-shrink-0 text-amber-500 mt-0.5" />
            <div>
              <p className="font-bold">Permissão de GPS necessária</p>
              <p className="mt-0.5 text-[11px]">Você precisa ativar a geolocalização do dispositivo para validar o PIN e registrar sua presença.</p>
            </div>
          </div>
        )}

        {/* OTP Boxes */}
        <div
          className={`flex gap-2 sm:gap-3 justify-center mb-5 transition-transform ${shake ? 'animate-[shake_0.5s_ease-in-out]' : ''}`}
          onPaste={handlePaste}
        >
          {digits.map((digit, i) => (
            <input
              key={i}
              ref={(el) => (inputRefs.current[i] = el)}
              type="text"
              inputMode="numeric"
              maxLength={1}
              value={digit}
              onChange={(e) => handleChange(i, e.target.value)}
              onKeyDown={(e) => handleKeyDown(i, e)}
              disabled={loading || success || !isPermitted}
              className={`w-12 h-14 sm:w-14 sm:h-16 text-center text-2xl font-bold rounded-2xl border-2 transition-all duration-150 focus:outline-none focus:ring-2 focus:ring-primary-400 focus:ring-offset-1 disabled:opacity-60 ${boxColor(i)}`}
              aria-label={`Dígito ${i + 1} do PIN`}
            />
          ))}
        </div>

        {/* Contador */}
        <p className="text-center text-xs text-gray-400 mb-4">
          {pin.length}/6 dígitos preenchidos
        </p>

        {/* Erro */}
        {error && (
          <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-300 text-sm rounded-xl px-4 py-3 mb-4 text-center">
            {error}
          </div>
        )}

        {/* Sucesso */}
        {success && (
          <div className="bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800 text-emerald-700 dark:text-emerald-300 text-sm rounded-xl px-4 py-3 mb-4 text-center font-medium">
            PIN validado com sucesso! Redirecionando...
          </div>
        )}

        {/* Botão */}
        {!success && (
          <Button
            onClick={() => handleSubmit()}
            disabled={loading || pin.length !== 6 || !isPermitted}
            fullWidth
            className="py-3.5 text-base font-bold"
          >
            {loading ? (
              <span className="flex items-center gap-2">
                <FiLoader className="animate-spin" />
                Validando...
              </span>
            ) : (
              `Confirmar ${tituloAcao}`
            )}
          </Button>
        )}

        {/* Dica */}
        <div className="mt-5 p-4 bg-gray-50 dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700">
          <p className="text-xs text-gray-500 dark:text-gray-400 font-semibold mb-2">Onde encontrar o PIN?</p>
          <ul className="space-y-1.5 text-xs text-gray-500 dark:text-gray-400 list-disc list-inside">
            <li>No material impresso do evento</li>
            <li>Na tela de projeção do auditório</li>
            <li>Com os organizadores do evento</li>
          </ul>
        </div>
      </div>

      {/* Shake animation keyframes via style tag */}
      <style>{`
        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          10%, 50%, 90% { transform: translateX(-6px); }
          30%, 70% { transform: translateX(6px); }
        }
      `}</style>
    </Layout>
  );
};

export default PinValidacaoPage;
