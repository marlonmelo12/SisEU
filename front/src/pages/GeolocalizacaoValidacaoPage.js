// src/pages/GeolocalizacaoValidacaoPage.js
import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import Layout from '../components/layout/Layout';
import Button from '../components/ui/Button';
import Alert from '../components/ui/Alert';
import Badge from '../components/ui/Badge';
import Card from '../components/ui/Card';
import { 
  FiMapPin, 
  FiCheckCircle, 
  FiXCircle, 
  FiLoader, 
  FiCompass, 
  FiTarget, 
  FiRefreshCw, 
  FiNavigation 
} from 'react-icons/fi';
import { useGeolocation } from '../features/presence/hooks/useGeolocation';
import checkinService from '../services/checkinService';
import eventoService from '../services/eventoService';
import geolocationService from '../services/geolocationService';
import { useAuth } from '../hooks/useAuth';

/**
 * Tela de Validação de Geolocalização por Raio
 * Apresenta diagnóstico em tempo real de distância e precisão GPS
 */
const GeolocalizacaoValidacaoPage = () => {
  const navigate = useNavigate();
  const { tipo } = useParams(); // 'checkin' ou 'checkout'
  const { coords, isPermitted, error: geoError } = useGeolocation(true);
  const { usuario } = useAuth();
  
  const [validando, setValidando] = useState(false);
  const [resultado, setResultado] = useState(null);
  const [error, setError] = useState(null);
  const [eventoDetails, setEventoDetails] = useState(null);
  const [loadingEvento, setLoadingEvento] = useState(false);
  const [retryKey, setRetryKey] = useState(0);

  const isCheckin = tipo === 'checkin';
  const tituloAcao = isCheckin ? 'Check-in' : 'Check-out';

  // Recupera dados temporários do fluxo
  const pinValidado = localStorage.getItem('pinValidado');
  const qrCodeValidado = localStorage.getItem('qrCodeValidado');
  const eventoId = localStorage.getItem('eventoId');
  const sessaoId = localStorage.getItem('sessaoId');
  const metodoUsado = pinValidado ? 'PIN' : 'QR Code';

  useEffect(() => {
    if (!pinValidado && !qrCodeValidado) {
      navigate(`/presenca/${tipo}/metodo`);
    }
  }, [pinValidado, qrCodeValidado, tipo, navigate]);

  // Carrega informações do evento para obter coordenadas de referência
  useEffect(() => {
    if (eventoId) {
      setLoadingEvento(true);
      eventoService.buscarPorId(eventoId)
        .then((res) => {
          if (res.success && res.data) {
            setEventoDetails(res.data);
          }
        })
        .catch((err) => console.error('Erro ao buscar detalhes do evento:', err))
        .finally(() => setLoadingEvento(false));
    }
  }, [eventoId]);

  // Cálculo em tempo real da distância e diagnóstico do raio
  let diagnosticoRaio = null;
  let nivelPrecisao = null;

  if (coords) {
    nivelPrecisao = geolocationService.getNivelPrecisao(coords.accuracy);

    if (eventoDetails?.latitude && eventoDetails?.longitude) {
      diagnosticoRaio = geolocationService.validarRaio(
        {
          latitude: Number(eventoDetails.latitude),
          longitude: Number(eventoDetails.longitude),
          raioMetros: Number(eventoDetails.raioMetros || 100),
        },
        {
          latitude: coords.latitude,
          longitude: coords.longitude,
        }
      );
    }
  }

  const validarPresenca = async () => {
    if (!isPermitted || !coords) {
      setError('Permissão de geolocalização necessária. Por favor, ative o GPS do seu dispositivo.');
      return;
    }

    if (diagnosticoRaio && !diagnosticoRaio.estaDentro) {
      setError('Você está fora da área permitida do evento. Aproxime-se do local para confirmar.');
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
        dados.tipoParticipacao = 'OUVINTE';
        response = await checkinService.registrarCheckin(dados);
      } else {
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

      setTimeout(() => {
        navigate('/dashboard');
      }, 3000);

    } catch (err) {
      const mensagemErro = err.response?.data?.message || 
        err.message || 
        'Você está fora da área permitida do evento. Aproxime-se do local para confirmar.';
      
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
      <div className="max-w-2xl mx-auto px-4 py-8 space-y-6">
        {/* Cabeçalho */}
        <div className="text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-primary-100 dark:bg-primary-900/50 text-primary-600 dark:text-primary-400 rounded-full mb-3 shadow-sm">
            <FiMapPin size={32} />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            Validação de Geolocalização
          </h1>
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
            Verificação de presença por raio de proximidade ({tituloAcao})
          </p>
        </div>

        {/* Resumo da Etapa Anterior */}
        <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4 flex items-center justify-between">
          <div>
            <span className="text-xs font-semibold uppercase tracking-wider text-blue-600 dark:text-blue-400">
              Validação por {metodoUsado} Aprovada
            </span>
            <p className="text-sm text-blue-900 dark:text-blue-200 font-mono mt-0.5">
              Código: <strong>{pinValidado || qrCodeValidado}</strong>
            </p>
          </div>
          <Badge variant="info">Etapa 2 de 2</Badge>
        </div>

        {/* Card de Diagnóstico do Raio e GPS */}
        <Card className="p-6 space-y-6">
          <div className="flex items-center justify-between border-b border-gray-200 dark:border-gray-700 pb-4">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
              <FiCompass className="text-primary-500" /> Diagnóstico de Proximidade
            </h3>
            {coords && (
              <button
                onClick={() => setRetryKey(prev => prev + 1)}
                className="text-xs flex items-center gap-1 text-gray-500 hover:text-primary-500 transition-colors"
                title="Recarregar GPS"
              >
                <FiRefreshCw size={12} /> Atualizar GPS
              </button>
            )}
          </div>

          {/* Status do Sinal do GPS */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 rounded-lg bg-gray-50 dark:bg-gray-700/50 flex items-center justify-between">
              <span className="text-sm text-gray-600 dark:text-gray-300">Status do GPS</span>
              {isPermitted ? (
                <span className="text-sm font-medium text-green-600 dark:text-green-400 flex items-center gap-1">
                  <FiCheckCircle /> Conectado
                </span>
              ) : (
                <span className="text-sm font-medium text-red-600 dark:text-red-400 flex items-center gap-1">
                  <FiXCircle /> Sem Permissão
                </span>
              )}
            </div>

            <div className="p-4 rounded-lg bg-gray-50 dark:bg-gray-700/50 flex items-center justify-between">
              <span className="text-sm text-gray-600 dark:text-gray-300">Precisão do GPS</span>
              {coords && nivelPrecisao ? (
                <span className={`text-xs px-2.5 py-1 rounded-full font-semibold ${nivelPrecisao.colorClass}`}>
                  ±{Math.round(coords.accuracy)}m ({nivelPrecisao.label})
                </span>
              ) : (
                <span className="text-sm text-gray-400 flex items-center gap-1">
                  <FiLoader className="animate-spin" /> Lendo...
                </span>
              )}
            </div>
          </div>

          {/* Painel do Raio Calculado */}
          {diagnosticoRaio && (
            <div className={`p-5 rounded-xl border ${
              diagnosticoRaio.estaDentro 
                ? 'bg-emerald-50 dark:bg-emerald-950/30 border-emerald-300 dark:border-emerald-700' 
                : 'bg-amber-50 dark:bg-amber-950/30 border-amber-300 dark:border-amber-700'
            }`}>
              <div className="flex items-start gap-4">
                <div className={`p-3 rounded-full ${
                  diagnosticoRaio.estaDentro 
                    ? 'bg-emerald-500 text-white' 
                    : 'bg-amber-500 text-white'
                }`}>
                  <FiTarget size={28} />
                </div>

                <div className="flex-1 space-y-1">
                  <div className="flex items-center justify-between">
                    <h4 className="font-bold text-base text-gray-900 dark:text-white">
                      {diagnosticoRaio.estaDentro 
                        ? 'Você está dentro da área do evento!' 
                        : 'Você está fora do raio permitido'}
                    </h4>
                    <span className={`text-xs font-bold px-2 py-0.5 rounded ${
                      diagnosticoRaio.estaDentro 
                        ? 'bg-emerald-200 dark:bg-emerald-800 text-emerald-900 dark:text-emerald-100' 
                        : 'bg-amber-200 dark:bg-amber-800 text-amber-900 dark:text-amber-100'
                    }`}>
                      {diagnosticoRaio.estaDentro ? 'Localização Válida' : 'Aproxime-se'}
                    </span>
                  </div>

                  <p className="text-sm text-gray-700 dark:text-gray-300">
                    Distância estimada: <strong>{geolocationService.formatarDistancia(diagnosticoRaio.distancia)}</strong>
                    <span className="mx-2">|</span>
                    Raio máximo permitido: <strong>{geolocationService.formatarDistancia(diagnosticoRaio.raioPermitido)}</strong>
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Coordenadas detalhadas (Debug amigável) */}
          {coords && (
            <div className="p-3 rounded bg-gray-100 dark:bg-gray-700/40 text-xs text-gray-500 dark:text-gray-400 flex items-center justify-between">
              <span>Coordenadas detectadas: {coords.latitude.toFixed(6)}, {coords.longitude.toFixed(6)}</span>
              <span className="flex items-center gap-1"><FiNavigation /> GPS Ativo</span>
            </div>
          )}
        </Card>

        {/* Alertas */}
        {resultado && (
          <Alert
            type={resultado.sucesso ? 'success' : 'error'}
            message={resultado.mensagem}
            className="shadow-md"
          />
        )}

        {geoError && !isPermitted && (
          <Alert
            type="error"
            message={`Erro de GPS: ${geoError}`}
            className="shadow-md"
          />
        )}

        {/* Botão de confirmação de presença */}
        {!resultado && (
          <Button
            variant={diagnosticoRaio && !diagnosticoRaio.estaDentro ? 'secondary' : 'primary'}
            size="lg"
            onClick={validarPresenca}
            disabled={validando || !isPermitted || !coords || (diagnosticoRaio && !diagnosticoRaio.estaDentro)}
            className="w-full py-4 text-base font-bold shadow-lg transition-transform active:scale-[0.99]"
          >
            {validando ? (
              <span className="flex items-center justify-center">
                <FiLoader className="animate-spin mr-2" />
                Processando {tituloAcao}...
              </span>
            ) : !isPermitted ? (
              'Aguardando permissão de GPS'
            ) : !coords ? (
              'Obtendo coordenadas do dispositivo...'
            ) : diagnosticoRaio && !diagnosticoRaio.estaDentro ? (
              'Fora da área permitida do evento'
            ) : (
              `Confirmar ${tituloAcao} por Geolocalização`
            )}
          </Button>
        )}

        {/* Redirecionamento após sucesso */}
        {resultado?.sucesso && (
          <div className="text-center space-y-2">
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Redirecionando para o dashboard em 3 segundos...
            </p>
            <button
              onClick={() => navigate('/dashboard')}
              className="text-primary-600 dark:text-primary-400 font-semibold hover:underline"
            >
              Ir para o Dashboard agora
            </button>
          </div>
        )}

        {/* Voltar */}
        {!resultado && (
          <div className="text-center pt-2">
            <button
              onClick={() => navigate(`/presenca/${tipo}/metodo`)}
              className="text-sm text-gray-500 hover:text-gray-800 dark:hover:text-gray-200 transition-colors"
              disabled={validando}
            >
              Voltar para seleção de método
            </button>
          </div>
        )}
      </div>
    </Layout>
  );
};

export default GeolocalizacaoValidacaoPage;
