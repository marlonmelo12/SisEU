// src/components/checkin/GerenciadorPin.js
import React, { useState, useEffect } from 'react';
import Button from '../ui/Button';
import Alert from '../ui/Alert';
import { FiRefreshCw, FiEye, FiCopy, FiCheck } from 'react-icons/fi';
import checkinService from '../../services/checkinService';

/**
 * Componente para gerenciar PIN de check-in (apenas para administradores)
 */
const GerenciadorPin = ({ eventoId }) => {
  const [pinAtivo, setPinAtivo] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [sucesso, setSucesso] = useState(null);
  const [copiado, setCopiado] = useState(false);

  useEffect(() => {
    carregarPinAtivo();
  }, []);

  const carregarPinAtivo = async () => {
    try {
      const pin = await checkinService.obterPinAtivo();
      setPinAtivo(pin);
    } catch (err) {
      // PIN não encontrado é normal, não mostra erro
      setPinAtivo(null);
    }
  };

  const gerarNovoPin = async () => {
    setLoading(true);
    setError(null);
    setSucesso(null);

    try {
      const novoPin = await checkinService.gerarPin({
        eventoId: eventoId,
        duracaoMinutos: 240 // 4 horas por padrão
      });
      setPinAtivo(novoPin);
      setSucesso('PIN gerado com sucesso!');
    } catch (err) {
      setError(err.message || 'Erro ao gerar PIN');
    } finally {
      setLoading(false);
    }
  };

  const copiarPin = () => {
    if (pinAtivo?.pin) {
      navigator.clipboard.writeText(pinAtivo.pin);
      setCopiado(true);
      setTimeout(() => setCopiado(false), 2000);
    }
  };

  const formatarDataExpiracao = (dataExpiracao) => {
    if (!dataExpiracao) return 'N/A';
    const data = new Date(dataExpiracao);
    return data.toLocaleString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const pinExpirado = () => {
    if (!pinAtivo?.dataExpiracao) return true;
    return new Date(pinAtivo.dataExpiracao) < new Date();
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
          PIN de Check-in
        </h3>
        <Button
          variant="secondary"
          size="sm"
          onClick={carregarPinAtivo}
          disabled={loading}
        >
          <FiRefreshCw className={loading ? 'animate-spin' : ''} />
        </Button>
      </div>

      {/* Mensagens */}
      {error && <Alert type="error" message={error} className="mb-4" />}
      {sucesso && <Alert type="success" message={sucesso} className="mb-4" />}

      {/* PIN Ativo */}
      {pinAtivo && !pinExpirado() ? (
        <div className="space-y-4">
          <div className="bg-gradient-to-r from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-800/20 rounded-lg p-6 border-2 border-green-200 dark:border-green-700">
            <div className="flex items-center justify-between mb-3">
              <span className="text-sm font-medium text-green-800 dark:text-green-300">
                PIN Ativo
              </span>
              <span className="px-3 py-1 bg-green-500 text-white text-xs font-bold rounded-full">
                ATIVO
              </span>
            </div>
            
            <div className="flex items-center justify-between">
              <div className="text-4xl font-mono font-bold text-green-900 dark:text-green-100 tracking-widest">
                {pinAtivo.pin}
              </div>
              <button
                onClick={copiarPin}
                className="p-3 bg-white dark:bg-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors"
                title="Copiar PIN"
              >
                {copiado ? (
                  <FiCheck className="text-green-600" size={20} />
                ) : (
                  <FiCopy className="text-gray-600 dark:text-gray-300" size={20} />
                )}
              </button>
            </div>

            <div className="mt-4 pt-4 border-t border-green-200 dark:border-green-700">
              <div className="flex items-center justify-between text-sm">
                <span className="text-green-700 dark:text-green-300">Expira em:</span>
                <span className="font-medium text-green-900 dark:text-green-100">
                  {formatarDataExpiracao(pinAtivo.dataExpiracao)}
                </span>
              </div>
            </div>
          </div>

          <Button
            variant="primary"
            onClick={gerarNovoPin}
            disabled={loading}
            className="w-full"
          >
            {loading ? 'Gerando...' : 'Gerar Novo PIN'}
          </Button>
        </div>
      ) : (
        <div className="text-center py-8">
          <div className="bg-gray-100 dark:bg-gray-700 rounded-full w-20 h-20 flex items-center justify-center mx-auto mb-4">
            <FiEye className="text-gray-400" size={32} />
          </div>
          <p className="text-gray-600 dark:text-gray-400 mb-4">
            {pinAtivo && pinExpirado() 
              ? 'O PIN expirou. Gere um novo PIN para o evento.'
              : 'Nenhum PIN ativo no momento'}
          </p>
          <Button
            variant="primary"
            onClick={gerarNovoPin}
            disabled={loading}
          >
            {loading ? 'Gerando...' : 'Gerar PIN'}
          </Button>
        </div>
      )}

      {/* Instruções */}
      <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
        <h4 className="text-sm font-semibold text-gray-900 dark:text-white mb-2">
          Como funciona?
        </h4>
        <ul className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
          <li className="flex items-start">
            <span className="mr-2">•</span>
            <span>O PIN é válido por 4 horas após a geração</span>
          </li>
          <li className="flex items-start">
            <span className="mr-2">•</span>
            <span>Compartilhe o PIN com os participantes do evento</span>
          </li>
          <li className="flex items-start">
            <span className="mr-2">•</span>
            <span>Os participantes usarão o PIN para fazer check-in</span>
          </li>
          <li className="flex items-start">
            <span className="mr-2">•</span>
            <span>Você pode gerar um novo PIN a qualquer momento</span>
          </li>
        </ul>
      </div>
    </div>
  );
};

export default GerenciadorPin;
