// src/pages/QrCodeValidacaoPage.js
import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import Layout from '../components/layout/Layout';
import Button from '../components/ui/Button';
import Alert from '../components/ui/Alert';
import { FiCamera, FiAlertCircle } from 'react-icons/fi';
import { useCameraPermission } from '../features/presence/hooks/useCameraPermission';

/**
 * Página de validação via QR Code
 * Funciona tanto para check-in quanto check-out
 */
const QrCodeValidacaoPage = () => {
  const navigate = useNavigate();
  const { tipo } = useParams(); // 'checkin' ou 'checkout'
  const { hasPermission, requestPermission } = useCameraPermission();
  const [scanning, setScanning] = useState(false);
  const [error, setError] = useState(null);
  const [qrData, setQrData] = useState(null);

  const isCheckin = tipo === 'checkin';
  const tituloAcao = isCheckin ? 'Check-in' : 'Check-out';

  useEffect(() => {
    // Solicita permissão da câmera ao montar o componente
    requestPermission();
  }, [requestPermission]);

  const handleStartScan = () => {
    if (!hasPermission) {
      setError('Permissão da câmera negada. Por favor, permita o acesso à câmera nas configurações do navegador.');
      return;
    }
    setScanning(true);
    setError(null);
  };

  const handleQrCodeScanned = (data) => {
    setQrData(data);
    setScanning(false);

    // Armazena o código QR validado
    localStorage.setItem('qrCodeValidado', data);
    localStorage.setItem('tipoPresenca', tipo);

    // Redireciona para validação de geolocalização
    navigate(`/presenca/${tipo}/geolocalizacao`);
  };

  const handleError = (err) => {
    setError('Erro ao escanear QR Code. Tente novamente.');
    setScanning(false);
  };

  return (
    <Layout>
      <div className="max-w-2xl mx-auto px-4 py-8">
        {/* Cabeçalho */}
        <div className="text-center mb-8">
          <div className="inline-block bg-primary-100 dark:bg-primary-900 rounded-full p-4 mb-4">
            <FiCamera className="text-primary-600 dark:text-primary-400" size={40} />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            {tituloAcao} via QR Code
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Aponte a câmera para o código QR do evento
          </p>
        </div>

        {/* Status da câmera */}
        {!hasPermission && (
          <div className="mb-6 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4">
            <div className="flex items-start">
              <FiAlertCircle className="text-yellow-600 dark:text-yellow-400 mt-0.5 mr-3" size={20} />
              <div>
                <p className="font-medium text-yellow-900 dark:text-yellow-300">
                  Permissão da câmera necessária
                </p>
                <p className="text-sm text-yellow-700 dark:text-yellow-400 mt-1">
                  Precisamos acessar sua câmera para escanear o QR Code. 
                  Clique no botão abaixo para permitir o acesso.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Área de escaneamento */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-8">
          {!scanning ? (
            <div className="text-center">
              <div className="bg-gray-100 dark:bg-gray-700 rounded-lg h-64 flex items-center justify-center mb-6">
                <FiCamera className="text-gray-400" size={80} />
              </div>
              <Button
                variant="primary"
                size="lg"
                onClick={handleStartScan}
                disabled={!hasPermission}
                className="w-full"
              >
                {hasPermission ? 'Iniciar Escaneamento' : 'Solicitar Permissão da Câmera'}
              </Button>
            </div>
          ) : (
            <div>
              <div className="bg-black rounded-lg h-64 flex items-center justify-center mb-6 relative">
                {/* Aqui seria integrado um componente de leitura de QR Code real */}
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="w-48 h-48 border-4 border-white rounded-lg animate-pulse"></div>
                </div>
                <p className="text-white text-center z-10">
                  Posicione o QR Code dentro do quadrado
                </p>
              </div>
              <Button
                variant="secondary"
                onClick={() => setScanning(false)}
                className="w-full"
              >
                Cancelar
              </Button>
            </div>
          )}

          {/* Mensagens de erro */}
          {error && (
            <div className="mt-4">
              <Alert type="error" message={error} />
            </div>
          )}
        </div>

        {/* Informações adicionais */}
        <div className="mt-8 bg-blue-50 dark:bg-blue-900/20 rounded-lg p-6">
          <h3 className="text-sm font-semibold text-blue-900 dark:text-blue-300 mb-2">
            Dicas para escanear
          </h3>
          <ul className="space-y-2 text-sm text-blue-800 dark:text-blue-200">
            <li className="flex items-start">
              <span className="mr-2">•</span>
              <span>Certifique-se de que há boa iluminação</span>
            </li>
            <li className="flex items-start">
              <span className="mr-2">•</span>
              <span>Mantenha a câmera estável e focada no código</span>
            </li>
            <li className="flex items-start">
              <span className="mr-2">•</span>
              <span>O QR Code deve estar completamente visível</span>
            </li>
            <li className="flex items-start">
              <span className="mr-2">•</span>
              <span>Evite reflexos ou sombras sobre o código</span>
            </li>
          </ul>
        </div>

        {/* Botão voltar */}
        <div className="mt-6 text-center">
          <button
            onClick={() => navigate(`/presenca/${tipo}/metodo`)}
            className="text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors"
            disabled={scanning}
          >
            ← Voltar
          </button>
        </div>
      </div>
    </Layout>
  );
};

export default QrCodeValidacaoPage;
