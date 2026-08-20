// src/components/sessions/SessionQRCodeModal.js
import React, { useState, useRef } from 'react';
import QRCode from 'react-qr-code';
import Modal from '../ui/Modal';
import Button from '../ui/Button';
import { FiCopy, FiCheck, FiMaximize2, FiMinimize2, FiKey, FiDownload, FiLogIn, FiLogOut } from 'react-icons/fi';
import { useToast } from '../../hooks/useToast';

/**
 * Modal para exibição do QR Code e PIN da Sessão (Administrador)
 * - Alternância entre Check-in (Entrada) e Check-out (Saída)
 * - Botão Modo Projeção posicionado no rodapé à esquerda
 * - Layout refinado e limpo
 */
const SessionQRCodeModal = ({ isOpen, onClose, sessao }) => {
  const [tipoPresenca, setTipoPresenca] = useState('checkin'); // 'checkin' ou 'checkout'
  const [copiado, setCopiado] = useState(false);
  const [fullScreen, setFullScreen] = useState(false);
  const qrRef = useRef(null);
  const { showToast } = useToast();

  if (!sessao) return null;

  // PINs separados para Check-in e Check-out
  const pinCheckin = sessao.pinCheckin || sessao.pin || sessao.codigoPin || '123456';
  const pinCheckout = sessao.pinCheckout || (Number(pinCheckin) + 1).toString() || '654321';

  const isCheckin = tipoPresenca === 'checkin';
  const pinAtual = isCheckin ? pinCheckin : pinCheckout;

  const qrPayload = JSON.stringify({
    pin: pinAtual,
    tipo: tipoPresenca,
    eventoId: sessao.eventoId || sessao.id,
    sessaoId: sessao.id,
    titulo: sessao.titulo || sessao.nome,
  });

  const handleCopiarPin = () => {
    navigator.clipboard.writeText(pinAtual);
    setCopiado(true);
    showToast(`PIN de ${isCheckin ? 'Check-in' : 'Check-out'} (${pinAtual}) copiado!`, 'success');
    setTimeout(() => setCopiado(false), 2000);
  };

  const handleExportarQRCode = () => {
    try {
      const svgElement = qrRef.current ? qrRef.current.querySelector('svg') : null;
      if (!svgElement) {
        showToast('Não foi possível capturar o QR Code para exportação.', 'error');
        return;
      }

      const svgData = new XMLSerializer().serializeToString(svgElement);
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      const img = new Image();

      img.onload = () => {
        const padding = 40;
        canvas.width = img.width + padding * 2;
        canvas.height = img.height + padding * 2 + 60;

        ctx.fillStyle = '#FFFFFF';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.drawImage(img, padding, padding);

        ctx.fillStyle = '#1E293B';
        ctx.font = 'bold 16px sans-serif';
        ctx.textAlign = 'center';
        const tituloTruncado = sessao.titulo && sessao.titulo.length > 25 
          ? sessao.titulo.substring(0, 25) + '...' 
          : sessao.titulo || 'Sessão SisEU';
        ctx.fillText(`${tituloTruncado} (${isCheckin ? 'Entrada' : 'Saída'})`, canvas.width / 2, canvas.height - 45);

        ctx.fillStyle = isCheckin ? '#059669' : '#DC2626';
        ctx.font = 'bold 20px monospace';
        ctx.fillText(`PIN ${isCheckin ? 'CHECK-IN' : 'CHECK-OUT'}: ${pinAtual}`, canvas.width / 2, canvas.height - 20);

        const pngUrl = canvas.toDataURL('image/png');
        const downloadLink = document.createElement('a');
        downloadLink.href = pngUrl;
        downloadLink.download = `QRCode_${isCheckin ? 'Checkin' : 'Checkout'}_Sessao_${sessao.id || 'SisEU'}_PIN_${pinAtual}.png`;
        document.body.appendChild(downloadLink);
        downloadLink.click();
        document.body.removeChild(downloadLink);

        showToast('QR Code exportado com sucesso!', 'success');
      };

      img.src = 'data:image/svg+xml;base64,' + btoa(unescape(encodeURIComponent(svgData)));
    } catch (err) {
      console.error('Erro ao exportar QR Code:', err);
      showToast('Erro ao gerar imagem do QR Code.', 'error');
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`Projeção de Presença: ${sessao.titulo || 'Sessão'}`}
      size={fullScreen ? 'full' : 'lg'}
    >
      <div className={`flex flex-col items-center justify-between p-1 sm:p-4 space-y-5 ${
        fullScreen ? 'min-h-[85vh]' : ''
      }`}>
        
        {/* 1. Alternador de Modo (Check-in vs Check-out) */}
        <div className="w-full max-w-sm bg-gray-100 dark:bg-gray-800/80 p-1.5 rounded-2xl flex gap-1.5 border border-gray-200/60 dark:border-gray-700/60 shadow-inner">
          <button
            onClick={() => setTipoPresenca('checkin')}
            className={`flex-1 flex items-center justify-center gap-2 py-2 px-3 rounded-xl text-xs font-bold transition-all duration-200 ${
              isCheckin
                ? 'bg-emerald-500 text-white shadow-sm'
                : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
            }`}
          >
            <FiLogIn size={15} />
            <span>Check-in (Entrada)</span>
          </button>

          <button
            onClick={() => setTipoPresenca('checkout')}
            className={`flex-1 flex items-center justify-center gap-2 py-2 px-3 rounded-xl text-xs font-bold transition-all duration-200 ${
              !isCheckin
                ? 'bg-red-500 text-white shadow-sm'
                : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
            }`}
          >
            <FiLogOut size={15} />
            <span>Check-out (Saída)</span>
          </button>
        </div>

        {/* 2. Container do QR Code */}
        <div 
          ref={qrRef}
          className={`bg-white p-5 sm:p-7 rounded-3xl shadow-lg border transition-all flex flex-col items-center max-w-full ${
            isCheckin 
              ? 'border-emerald-200 dark:border-emerald-800/50 shadow-emerald-500/5' 
              : 'border-red-200 dark:border-red-800/50 shadow-red-500/5'
          }`}
        >
          <div className="p-2 bg-white rounded-2xl flex justify-center items-center">
            <QRCode
              value={qrPayload}
              size={fullScreen ? 340 : 210}
              style={{ height: 'auto', maxWidth: '100%', width: '100%' }}
              level="H"
              aria-label={`QR Code de ${isCheckin ? 'Check-in' : 'Check-out'}`}
            />
          </div>
          <p className="mt-3 text-xs text-gray-500 font-medium text-center max-w-[280px]">
            Aponte a câmera do celular para registrar presença nesta sessão
          </p>
        </div>

        {/* 3. Card do PIN da Sessão */}
        <div className={`w-full max-w-md rounded-2xl p-4 flex items-center justify-between border transition-all ${
          isCheckin
            ? 'bg-emerald-50/80 dark:bg-emerald-950/20 border-emerald-200 dark:border-emerald-800/60'
            : 'bg-red-50/80 dark:bg-red-950/20 border-red-200 dark:border-red-800/60'
        }`}>
          <div>
            <span className={`text-[11px] font-bold uppercase tracking-wider flex items-center gap-1.5 ${
              isCheckin ? 'text-emerald-700 dark:text-emerald-300' : 'text-red-700 dark:text-red-300'
            }`}>
              <FiKey size={13} /> PIN DE {isCheckin ? 'CHECK-IN' : 'CHECK-OUT'}
            </span>
            <p className={`text-2xl sm:text-3xl font-mono font-extrabold tracking-[0.2em] mt-0.5 ${
              isCheckin ? 'text-emerald-600 dark:text-emerald-400' : 'text-red-600 dark:text-red-400'
            }`}>
              {pinAtual}
            </p>
          </div>

          <Button
            variant="secondary"
            size="sm"
            onClick={handleCopiarPin}
            className="flex items-center gap-1.5 text-xs font-semibold py-2 px-3.5 bg-white dark:bg-gray-800 shadow-sm border border-gray-200 dark:border-gray-700"
          >
            {copiado ? <FiCheck className="text-emerald-500" size={15} /> : <FiCopy size={15} />}
            <span>{copiado ? 'Copiado' : 'Copiar'}</span>
          </Button>
        </div>

        {/* 4. Barra Inferior de Ações: Projeção à esquerda, Exportar à direita */}
        <div className="w-full max-w-md pt-2 border-t border-gray-100 dark:border-gray-700/60 flex items-center justify-between gap-3">
          {/* Botão Modo Projeção — À Esquerda Abaixo */}
          <button
            onClick={() => setFullScreen(!fullScreen)}
            className="flex items-center gap-2 text-xs font-bold py-2.5 px-4 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 transition-all shadow-sm"
          >
            {fullScreen ? <FiMinimize2 size={16} /> : <FiMaximize2 size={16} />}
            <span>{fullScreen ? 'Sair da Projeção' : 'Modo Projeção'}</span>
          </button>

          {/* Botão Exportar QR Code — À Direita */}
          <Button
            variant="secondary"
            onClick={handleExportarQRCode}
            className="flex items-center gap-2 text-xs font-bold py-2.5 px-4 shadow-sm"
          >
            <FiDownload className={isCheckin ? 'text-emerald-600' : 'text-red-600'} size={15} />
            <span>Exportar PNG</span>
          </Button>
        </div>

      </div>
    </Modal>
  );
};

export default SessionQRCodeModal;
