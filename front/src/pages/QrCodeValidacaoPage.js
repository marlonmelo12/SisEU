// src/pages/QrCodeValidacaoPage.js
import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import Layout from '../components/layout/Layout';
import Button from '../components/ui/Button';
import { FiCamera, FiLoader, FiAlertCircle, FiArrowLeft, FiRefreshCw } from 'react-icons/fi';

/**
 * Validação via QR Code — Mobile-first com scanner real (html5-qrcode)
 * RF003/RF004: integração real de câmera corrigindo o placeholder anterior.
 */
const QrCodeValidacaoPage = () => {
  const navigate = useNavigate();
  const { tipo } = useParams();
  const [scanning, setScanning] = useState(false);
  const [error, setError] = useState(null);
  const [permissionDenied, setPermissionDenied] = useState(false);
  const [scannerReady, setScannerReady] = useState(false);
  const scannerInstanceRef = useRef(null);

  const isCheckin = tipo === 'checkin';
  const tituloAcao = isCheckin ? 'Check-in' : 'Check-out';

  // Limpeza do scanner ao desmontar
  useEffect(() => {
    return () => {
      stopScanner();
    };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const stopScanner = async () => {
    if (scannerInstanceRef.current) {
      try {
        await scannerInstanceRef.current.stop();
        scannerInstanceRef.current.clear();
      } catch (e) {
        // Ignorar erros de parada
      }
      scannerInstanceRef.current = null;
    }
    setScannerReady(false);
    setScanning(false);
  };

  const handleQrCodeScanned = (data) => {
    stopScanner();
    setError(null);

    let pinExtraido = data;
    let eventoIdExtraido = null;
    let sessaoIdExtraido = null;

    try {
      if (typeof data === 'string' && (data.startsWith('{') || data.startsWith('['))) {
        const parsed = JSON.parse(data);
        pinExtraido = parsed.pin || data;
        eventoIdExtraido = parsed.eventoId;
        sessaoIdExtraido = parsed.sessaoId;
      }
    } catch (e) {
      pinExtraido = data;
    }

    localStorage.setItem('qrCodeValidado', pinExtraido);
    if (eventoIdExtraido) localStorage.setItem('eventoId', eventoIdExtraido);
    if (sessaoIdExtraido) localStorage.setItem('sessaoId', sessaoIdExtraido);
    localStorage.setItem('tipoPresenca', tipo);

    navigate(`/presenca/${tipo}/geolocalizacao`);
  };

  const startScanner = async () => {
    setError(null);
    setScanning(true);
    setScannerReady(false);

    try {
      // Carregamento dinâmico para evitar SSR issues
      const { Html5Qrcode } = await import('html5-qrcode');
      const scanner = new Html5Qrcode('qr-reader');
      scannerInstanceRef.current = scanner;

      await scanner.start(
        { facingMode: 'environment' }, // câmera traseira no mobile
        {
          fps: 10,
          qrbox: { width: 250, height: 250 },
          aspectRatio: 1.0,
        },
        handleQrCodeScanned,
        (errorMsg) => {
          // Erros de decodificação são esperados (frames sem QR) — não exibir
        }
      );
      setScannerReady(true);
    } catch (err) {
      setScanning(false);
      setScannerReady(false);
      if (
        err.toString().includes('Permission') ||
        err.toString().includes('NotAllowedError')
      ) {
        setPermissionDenied(true);
        setError('Permissão da câmera negada. Verifique as configurações do navegador.');
      } else {
        setError('Não foi possível iniciar a câmera. Tente novamente.');
      }
    }
  };

  return (
    <Layout>
      <div className="max-w-sm mx-auto">
        {/* Voltar */}
        <button
          onClick={async () => { await stopScanner(); navigate(`/presenca/${tipo}/metodo`); }}
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
            <span className="text-xs font-semibold text-primary-600 dark:text-primary-400">QR Code</span>
          </div>
        </div>

        {/* Título */}
        <div className="text-center mb-5">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-primary-100 dark:bg-primary-900/30 rounded-2xl mb-4">
            <FiCamera size={30} className="text-primary-600 dark:text-primary-400" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">{tituloAcao} via QR Code</h1>
          <p className="text-gray-500 dark:text-gray-400 text-sm mt-1.5">
            Aponte a câmera para o QR Code do evento
          </p>
        </div>

        {/* Aviso de permissão negada */}
        {permissionDenied && (
          <div className="flex items-start gap-3 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-2xl mb-4">
            <FiAlertCircle className="text-red-500 flex-shrink-0 mt-0.5" size={18} />
            <div>
              <p className="text-sm font-semibold text-red-700 dark:text-red-300">Câmera bloqueada</p>
              <p className="text-xs text-red-600 dark:text-red-400 mt-1 leading-snug">
                Permita o acesso à câmera nas configurações do seu navegador e tente novamente.
              </p>
            </div>
          </div>
        )}

        {/* Área do scanner */}
        <div className="bg-black rounded-2xl overflow-hidden mb-4 relative" style={{ minHeight: 280 }}>
          {/* Container do html5-qrcode */}
          <div id="qr-reader" className="w-full" />

          {/* Estado: não iniciado */}
          {!scanning && !scannerReady && (
            <div className="absolute inset-0 flex flex-col items-center justify-center gap-3">
              <FiCamera className="text-gray-500" size={48} />
              <p className="text-gray-400 text-sm">Câmera desativada</p>
            </div>
          )}

          {/* Estado: iniciando */}
          {scanning && !scannerReady && (
            <div className="absolute inset-0 flex flex-col items-center justify-center gap-3">
              <FiLoader className="text-white animate-spin" size={36} />
              <p className="text-white text-sm">Iniciando câmera...</p>
            </div>
          )}

          {/* Overlay de mira ao escanear */}
          {scannerReady && (
            <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
              <div className="w-52 h-52 relative">
                {/* Cantos */}
                <div className="absolute top-0 left-0 w-8 h-8 border-t-3 border-l-3 border-white rounded-tl-lg" />
                <div className="absolute top-0 right-0 w-8 h-8 border-t-3 border-r-3 border-white rounded-tr-lg" />
                <div className="absolute bottom-0 left-0 w-8 h-8 border-b-3 border-l-3 border-white rounded-bl-lg" />
                <div className="absolute bottom-0 right-0 w-8 h-8 border-b-3 border-r-3 border-white rounded-br-lg" />
                {/* Linha de scan animada */}
                <div className="absolute left-0 right-0 h-0.5 bg-primary-400 opacity-80 animate-[scanline_2s_ease-in-out_infinite]" />
              </div>
            </div>
          )}
        </div>

        {/* Erro */}
        {error && (
          <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-300 text-sm rounded-xl px-4 py-3 mb-4">
            {error}
          </div>
        )}

        {/* Botões */}
        {!scanning ? (
          <Button onClick={startScanner} fullWidth className="py-3.5 text-base font-bold">
            <FiCamera size={18} />
            Iniciar Câmera
          </Button>
        ) : (
          <Button
            variant="secondary"
            onClick={stopScanner}
            fullWidth
            className="py-3.5 text-base font-semibold"
          >
            <FiRefreshCw size={16} />
            Cancelar
          </Button>
        )}

        {/* Dicas compactas */}
        <div className="mt-4 p-4 bg-gray-50 dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700">
          <p className="text-xs text-gray-500 dark:text-gray-400 font-semibold mb-2">Dicas:</p>
          <ul className="space-y-1 text-xs text-gray-500 dark:text-gray-400">
            <li>• Garanta boa iluminação no ambiente</li>
            <li>• Mantenha o QR Code completamente dentro do quadro</li>
            <li>• Segure o celular firme e aguarde a leitura automática</li>
          </ul>
        </div>
      </div>

      <style>{`
        @keyframes scanline {
          0% { top: 0; }
          50% { top: calc(100% - 2px); }
          100% { top: 0; }
        }
        #qr-reader video {
          width: 100% !important;
          border-radius: 0 !important;
        }
        #qr-reader img { display: none !important; }
        #qr-reader__dashboard { display: none !important; }
      `}</style>
    </Layout>
  );
};

export default QrCodeValidacaoPage;
