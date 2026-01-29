// src/pages/GeolocalizacaoValidacaoPage.js
import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import Layout from '../components/layout/Layout';
import Button from '../components/ui/Button';
import Alert from '../components/ui/Alert';
import { FiMapPin, FiCheckCircle, FiXCircle, FiLoader } from 'react-icons/fi';
import { useGeolocation } from '../features/presence/hooks/useGeolocation';
import checkinService from '../services/checkinService';
import { useAuth } from '../hooks/useAuth';

/**
 * Página de validação de geolocalização
 * Etapa final do processo de check-in/check-out
 */
const GeolocalizacaoValidacaoPage = () => {
  const navigate = useNavigate();
  const { tipo } = useParams(); // 'checkin' ou 'checkout'
  const { coords, isPermitted, error: geoError } = useGeolocation(true);
  const { usuario } = useAuth();
  const [validando, setValidando] = useState(false);
  const [resultado, setResultado] = useState(null);
  const [error, setError] = useState(null);

  const isCheckin = tipo === 'checkin';
  const tituloAcao = isCheckin ? 'Check-in' : 'Check-out';

  // Recupera dados da validação anterior
  const pinValidado = localStorage.getItem('pinValidado');
  const qrCodeValidado = localStorage.getItem('qrCodeValidado');
  const eventoId = localStorage.getItem('eventoId');
  const sessaoId = localStorage.getItem('sessaoId');
  const metodoUsado = pinValidado ? 'PIN' : 'QR Code';

  useEffect(() => {
    // Se não há validação prévia, redireciona
    if (!pinValidado && !qrCodeValidado) {
      navigate(`/presenca/${tipo}/metodo`);
    }
  }, [pinValidado, qrCodeValidado, tipo, navigate]);

  const validarPresenca = async () => {
    if (!isPermitted || !coords) {
      setError('Permissão de geolocalização necessária. Por favor, ative o GPS.');
      return;
    }

    if (!eventoId) {
      setError('Dados do evento não encontrados. Por favor, refaça a validação do PIN.');
      return;
    }

    setValidando(true);
    setError(null);

    try {
      const dados = {
        eventoId,
        sessaoId: sessaoId || null,
        pin: pinValidado || qrCodeValidado,
        latitude: coords.latitude,
        longitude: coords.longitude,
        usuarioId: usuario?.id,
      };

      let response;
      if (isCheckin) {
        // Para check-in, pode precisar especificar o tipo de participação
        dados.tipoParticipacao = 'OUVINTE'; // ou 'APRESENTADOR'
        response = await checkinService.registrarCheckin(dados);
      } else {
        // Para check-out, precisa do ID do check-in
        const checkinAtivo = await checkinService.buscarCheckinAtivo(usuario?.id, eventoId);
        if (checkinAtivo) {
          dados.checkinId = checkinAtivo.id;
          response = await checkinService.registrarCheckout(dados);
        } else {
          throw new Error('Nenhum check-in ativo encontrado para realizar o check-out.');
        }
      }

      setResultado({
        sucesso: true,
        mensagem: `${tituloAcao} realizado com sucesso!`,
        dados: response
      });

      // Limpa dados temporários
      localStorage.removeItem('pinValidado');
      localStorage.removeItem('qrCodeValidado');
      localStorage.removeItem('tipoPresenca');
      localStorage.removeItem('eventoId');
      localStorage.removeItem('sessaoId');

      // Redireciona após 3 segundos
      setTimeout(() => {
        navigate('/dashboard');
      }, 3000);

    } catch (err) {
      const mensagemErro = err.response?.data?.message || 
        err.message || 
        'Você não está na área do evento. Aproxime-se do local para confirmar sua presença.';
      
      setResultado({
        sucesso: false,
        mensagem: mensagemErro
      });
      setError(mensagemErro);
    } finally {
      setValidando(false);
    }
  };

  return (
    <Layout>
      <div className="max-w-2xl mx-auto px-4 py-8">
        {/* Cabeçalho */}
        <div className="text-center mb-8">
          <div className="inline-block bg-primary-100 dark:bg-primary-900 rounded-full p-4 mb-4">
            <FiMapPin className="text-primary-600 dark:text-primary-400" size={40} />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            Validação de Localização
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Etapa final do {tituloAcao.toLowerCase()}
          </p>
        </div>

        {/* Status da geolocalização */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 mb-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Status da Geolocalização
          </h3>
          
          <div className="space-y-4">
            {/* Permissão */}
            <div className="flex items-center justify-between">
              <span className="text-gray-700 dark:text-gray-300">Permissão GPS</span>
              {isPermitted ? (
                <span className="flex items-center text-green-600 dark:text-green-400">
                  <FiCheckCircle className="mr-2" />
                  Concedida
                </span>
              ) : (
                <span className="flex items-center text-red-600 dark:text-red-400">
                  <FiXCircle className="mr-2" />
                  Negada
                </span>
              )}
            </div>

            {/* Coordenadas */}
            <div className="flex items-center justify-between">
              <span className="text-gray-700 dark:text-gray-300">Localização detectada</span>
              {coords ? (
                <span className="flex items-center text-green-600 dark:text-green-400">
                  <FiCheckCircle className="mr-2" />
                  Sim
                </span>
              ) : (
                <span className="flex items-center text-yellow-600 dark:text-yellow-400">
                  <FiLoader className="animate-spin mr-2" />
                  Aguardando...
                </span>
              )}
            </div>

            {/* Coordenadas exatas (apenas para debug) */}
            {coords && (
              <div className="mt-4 p-3 bg-gray-50 dark:bg-gray-700 rounded text-sm">
                <p className="text-gray-600 dark:text-gray-400">
                  Lat: {coords.latitude.toFixed(6)}, 
                  Long: {coords.longitude.toFixed(6)}
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Informações da validação anterior */}
        <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-6 mb-6">
          <h3 className="text-sm font-semibold text-blue-900 dark:text-blue-300 mb-2">
            Validação concluída
          </h3>
          <p className="text-sm text-blue-800 dark:text-blue-200">
            Método utilizado: <strong>{metodoUsado}</strong>
          </p>
          <p className="text-sm text-blue-800 dark:text-blue-200 mt-1">
            Código: <strong>{pinValidado || qrCodeValidado}</strong>
          </p>
        </div>

        {/* Resultado */}
        {resultado && (
          <Alert
            type={resultado.sucesso ? 'success' : 'error'}
            message={resultado.mensagem}
            className="mb-6"
          />
        )}

        {/* Erro de geolocalização */}
        {geoError && !isPermitted && (
          <Alert
            type="error"
            message={`Erro ao obter localização: ${geoError}`}
            className="mb-6"
          />
        )}

        {/* Botão de validação */}
        {!resultado && (
          <Button
            variant="primary"
            size="lg"
            onClick={validarPresenca}
            disabled={validando || !isPermitted || !coords}
            className="w-full"
          >
            {validando ? (
              <span className="flex items-center justify-center">
                <FiLoader className="animate-spin mr-2" />
                Validando localização...
              </span>
            ) : !isPermitted ? (
              'Aguardando permissão GPS'
            ) : !coords ? (
              'Obtendo localização...'
            ) : (
              `Confirmar ${tituloAcao}`
            )}
          </Button>
        )}

        {/* Botão de retorno ao dashboard */}
        {resultado?.sucesso && (
          <div className="mt-6 text-center">
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              Redirecionando para o dashboard em 3 segundos...
            </p>
            <button
              onClick={() => navigate('/dashboard')}
              className="text-primary-600 dark:text-primary-400 hover:underline"
            >
              Ir agora
            </button>
          </div>
        )}

        {/* Instruções */}
        <div className="mt-8 bg-gray-50 dark:bg-gray-800 rounded-lg p-6">
          <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-2">
            Por que validamos sua localização?
          </h3>
          <ul className="space-y-2 text-sm text-gray-700 dark:text-gray-300">
            <li className="flex items-start">
              <span className="mr-2">•</span>
              <span>Garante que você está presente no local do evento</span>
            </li>
            <li className="flex items-start">
              <span className="mr-2">•</span>
              <span>Legitima sua marcação de entrada/saída</span>
            </li>
            <li className="flex items-start">
              <span className="mr-2">•</span>
              <span>Permite a creditação correta de horas complementares</span>
            </li>
            <li className="flex items-start">
              <span className="mr-2">•</span>
              <span>Seus dados de localização são usados apenas para esta validação</span>
            </li>
          </ul>
        </div>

        {/* Botão voltar (apenas se não houver resultado) */}
        {!resultado && (
          <div className="mt-6 text-center">
            <button
              onClick={() => navigate(`/presenca/${tipo}/metodo`)}
              className="text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors"
              disabled={validando}
            >
              ← Voltar
            </button>
          </div>
        )}
      </div>
    </Layout>
  );
};

export default GeolocalizacaoValidacaoPage;
