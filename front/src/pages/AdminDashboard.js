// src/pages/AdminDashboard.js
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Layout from '../components/layout/Layout';
import SessionCard from '../components/sessions/SessionCard';
import Button from '../components/ui/Button';
import Alert from '../components/ui/Alert';
import ConfigureSessionModal from '../features/sessions/components/ConfigureSessionModal';
import SessionQRCodeModal from '../components/sessions/SessionQRCodeModal';
import eventoService from '../services/eventoService';
import sessaoService from '../services/sessaoService';
import relatorioService from '../services/relatorioService';
import checkinService from '../services/checkinService';
import { useSessoes } from '../hooks/useSessoes';
import { useRelatorios } from '../hooks/useRelatorios';
import { useToast } from '../hooks/useToast';
import { convertPresencasToCSV, downloadCSVFile } from '../utils/csvUtils';
import { FiPlus, FiDownload, FiUpload, FiFileText, FiKey, FiCopy, FiCheck, FiCheckCircle, FiClock } from 'react-icons/fi';

/**
 * Dashboard Administrativo (RF006)
 * - Gerenciamento de sessões
 * - Importação e exportação
 * - Acesso a relatórios
 */
const AdminDashboard = () => {
  const navigate = useNavigate();
  const { sessoes, loading, error, listarTodas, criar, deletar } = useSessoes();
  const { exportarCSV } = useRelatorios();
  const { showToast } = useToast();
  
  const [showModal, setShowModal] = useState(false);
  const [showAlert, setShowAlert] = useState(false);
  const [alertData, setAlertData] = useState({ type: 'info', message: '' });
  const [eventoParaEditar, setEventoParaEditar] = useState(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [eventoParaExcluir, setEventoParaExcluir] = useState(null);
  const [pinGerado, setPinGerado] = useState(null);
  const [showPinModal, setShowPinModal] = useState(false);
  const [copiado, setCopiado] = useState(false);
  const [sessaoParaQrCode, setSessaoParaQrCode] = useState(null);
  const [showQrCodeModal, setShowQrCodeModal] = useState(false);

  useEffect(() => {
    listarTodas();
  }, []);

  const handleAddSession = () => {
    setEventoParaEditar(null);
    setShowModal(true);
  };

  const handleEditSession = (evento) => {
    setEventoParaEditar(evento);
    setShowModal(true);
  };

  const handleDeleteSession = (evento) => {
    setEventoParaExcluir(evento);
    setShowDeleteConfirm(true);
  };

  const confirmDelete = async () => {
    if (!eventoParaExcluir) return;

    const result = await eventoService.deletar(eventoParaExcluir.id);
    
    if (result.success) {
      setAlertData({ 
        type: 'success', 
        message: 'Evento excluído com sucesso!' 
      });
      listarTodas(); // Recarrega a lista
    } else {
      setAlertData({ 
        type: 'error', 
        message: result.error || 'Erro ao excluir evento' 
      });
    }
    
    setShowAlert(true);
    setShowDeleteConfirm(false);
    setEventoParaExcluir(null);
  };

  const cancelDelete = () => {
    setShowDeleteConfirm(false);
    setEventoParaExcluir(null);
  };

  const handleCloseModal = (deveRecarregar) => {
    setShowModal(false);
    setEventoParaEditar(null);
    
    if (deveRecarregar) {
      // Recarrega a lista de sessões após criar/editar
      listarTodas();
      setAlertData({ 
        type: 'success', 
        message: eventoParaEditar ? 'Evento atualizado com sucesso!' : 'Evento criado com sucesso!' 
      });
      setShowAlert(true);
    }
  };

  const handleImport = () => {
    // Implementar lógica de importação
    setAlertData({ type: 'info', message: 'Funcionalidade de importação em desenvolvimento' });
    setShowAlert(true);
  };

  const handleExport = async () => {
    const result = await exportarCSV({}, 'sessoes-export.csv');
    if (result.success) {
      setAlertData({ type: 'success', message: 'Relatório exportado com sucesso!' });
    } else {
      setAlertData({ type: 'error', message: result.error });
    }
    setShowAlert(true);
  };

  const handleGerarPin = async () => {
    try {
      setAlertData({ type: 'info', message: 'Gerando novo PIN...' });
      setShowAlert(true);

      const resultado = await checkinService.gerarPin({});
      
      console.log('[ADMIN] PIN gerado:', resultado);
      
      setPinGerado(resultado);
      setShowPinModal(true);
      setCopiado(false);
      
      setAlertData({ 
        type: 'success', 
        message: 'PIN gerado com sucesso!' 
      });
    } catch (error) {
      console.error('[ADMIN] Erro ao gerar PIN:', error);
      setAlertData({ 
        type: 'error', 
        message: error.message || 'Erro ao gerar PIN' 
      });
    }
    setShowAlert(true);
  };

  const handleCopiarPin = () => {
    if (pinGerado?.pin) {
      navigator.clipboard.writeText(pinGerado.pin);
      setCopiado(true);
      setTimeout(() => setCopiado(false), 2000);
    }
  };

  const handleRelatorios = async () => {
    try {
      setAlertData({ type: 'info', message: 'Gerando relatório de presenças...' });
      setShowAlert(true);

      const relatorio = await relatorioService.buscarRelatorioPresencas();
      
      console.log('[ADMIN] Relatório de presenças:', relatorio);
      
      // Converte para CSV e faz download
      if (relatorio && relatorio.length > 0) {
        const csvContent = convertPresencasToCSV(relatorio);
        downloadCSVFile(csvContent, `relatorio-presencas-${new Date().toISOString().split('T')[0]}.csv`);
        
        setAlertData({ 
          type: 'success', 
          message: `Relatório gerado com ${relatorio.length} registros!` 
        });
      } else {
        setAlertData({ 
          type: 'warning', 
          message: 'Nenhum registro de presença encontrado.' 
        });
      }
    } catch (error) {
      console.error('[ADMIN] Erro ao buscar relatório:', error);
      setAlertData({ 
        type: 'error', 
        message: error.message || 'Erro ao gerar relatório de presenças' 
      });
    }
    setShowAlert(true);
  };

  const handleSessionClick = (sessaoId) => {
    navigate(`/sessao/${sessaoId}`);
  };

  return (
    <Layout>
      {/* Cabeçalho com título e ações */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-6">
          Painel Administrativo
        </h1>

        {/* Botões de ação coloridos e totalmente responsivos */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-2.5 sm:gap-4">
          <Button
            variant="primary"
            onClick={handleAddSession}
            className="flex items-center justify-center gap-1.5 py-2.5 px-3"
          >
            <FiPlus size={18} />
            <span className="text-xs sm:text-sm font-semibold">Adicionar Sessão</span>
          </Button>

          <Button
            variant="success"
            onClick={handleImport}
            className="flex items-center justify-center gap-1.5 py-2.5 px-3"
          >
            <FiUpload size={18} />
            <span className="text-xs sm:text-sm font-semibold">Importar</span>
          </Button>

          <Button
            variant="warning"
            onClick={handleExport}
            className="flex items-center justify-center gap-1.5 py-2.5 px-3"
          >
            <FiDownload size={18} />
            <span className="text-xs sm:text-sm font-semibold">Exportar</span>
          </Button>

          <Button
            variant="secondary"
            onClick={handleRelatorios}
            className="flex items-center justify-center gap-1.5 py-2.5 px-3"
          >
            <FiFileText size={18} />
            <span className="text-xs sm:text-sm font-semibold">Relatórios</span>
          </Button>

          <Button
            variant="info"
            onClick={handleGerarPin}
            className="flex items-center justify-center gap-1.5 py-2.5 px-3 bg-blue-600 hover:bg-blue-700 text-white col-span-2 sm:col-span-1"
          >
            <FiKey size={18} />
            <span className="text-xs sm:text-sm font-semibold">Gerar PIN</span>
          </Button>
        </div>
      </div>

      {/* Alertas */}
      {showAlert && (
        <Alert
          type={alertData.type}
          message={alertData.message}
          onClose={() => setShowAlert(false)}
          className="mb-6"
        />
      )}

      {error && (
        <Alert type="error" message={error} className="mb-6" />
      )}

      {/* Estatísticas rápidas */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Total de Sessões</p>
              <p className="text-3xl font-bold text-gray-900 dark:text-white">
                {sessoes.length}
              </p>
            </div>
            <div className="w-12 h-12 bg-primary-100 dark:bg-primary-900 rounded-full flex items-center justify-center">
              <FiFileText className="text-primary-500" size={24} />
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Sessões Ativas</p>
              <p className="text-3xl font-bold text-gray-900 dark:text-white">
                {sessoes.filter(s => s.status === 'ATIVA').length}
              </p>
            </div>
            <div className="w-12 h-12 bg-green-100 dark:bg-green-900 rounded-full flex items-center justify-center">
              <FiCheckCircle className="text-green-500 text-xl" />
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Aguardando</p>
              <p className="text-3xl font-bold text-gray-900 dark:text-white">
                {sessoes.filter(s => s.status === 'AGUARDANDO').length}
              </p>
            </div>
            <div className="w-12 h-12 bg-yellow-100 dark:bg-yellow-900 rounded-full flex items-center justify-center">
              <FiClock className="text-yellow-500 text-xl" />
            </div>
          </div>
        </div>
      </div>

      {/* Loading */}
      {loading && (
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500 mx-auto"></div>
          <p className="mt-4 text-gray-600 dark:text-gray-400">Carregando sessões...</p>
        </div>
      )}

      {/* Lista de Sessões */}
      {!loading && sessoes.length === 0 && (
        <div className="text-center py-12">
          <p className="text-gray-600 dark:text-gray-400 text-lg mb-4">
            Nenhuma sessão cadastrada
          </p>
          <Button variant="primary" onClick={handleAddSession}>
            Adicionar primeira sessão
          </Button>
        </div>
      )}

      {!loading && sessoes.length > 0 && (
        <>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
            Todas as Sessões
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {sessoes.map((sessao) => {
              // Converte as datas para Date objects
              const dataFim = sessao.dataFim ? new Date(sessao.dataFim) : null;
              const dataInicio = sessao.dataInicio ? new Date(sessao.dataInicio) : null;
              
              const eventoPassado = sessaoService.eventoJaAconteceu(dataFim, dataInicio);
              
              return (
                <SessionCard
                  key={sessao.id}
                  sessao={sessao}
                  onClick={() => handleSessionClick(sessao.id)}
                  onDelete={() => handleDeleteSession(sessao)}
                  onEdit={() => handleEditSession(sessao)}
                  onShowQRCode={(s) => {
                    setSessaoParaQrCode(s);
                    setShowQrCodeModal(true);
                  }}
                  isEventoPassado={eventoPassado}
                />
              );
            })}
          </div>
        </>
      )}

      {/* Modal de Configuração de Sessão */}
      <ConfigureSessionModal
        isOpen={showModal}
        onClose={handleCloseModal}
        eventoParaEditar={eventoParaEditar}
      />

      {/* Modal de QR Code da Sessão */}
      <SessionQRCodeModal
        isOpen={showQrCodeModal}
        onClose={() => {
          setShowQrCodeModal(false);
          setSessaoParaQrCode(null);
        }}
        sessao={sessaoParaQrCode}
      />

      {/* Modal de Confirmação de Exclusão */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-md w-full p-6">
            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
              Confirmar Exclusão
            </h3>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              Tem certeza que deseja excluir o evento <strong>"{eventoParaExcluir?.titulo}"</strong>? 
              Esta ação não pode ser desfeita.
            </p>
            <div className="flex justify-end gap-3">
              <Button
                variant="outline"
                onClick={cancelDelete}
              >
                Cancelar
              </Button>
              <Button
                variant="danger"
                onClick={confirmDelete}
              >
                Excluir
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Modal de Exibição do PIN */}
      {showPinModal && pinGerado && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-md w-full p-6">
            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
              PIN Gerado com Sucesso!
            </h3>
            
            <div className="bg-gray-100 dark:bg-gray-700 rounded-lg p-6 mb-4 text-center">
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                PIN de Check-in
              </p>
              <p className="text-4xl font-bold text-blue-600 dark:text-blue-400 mb-4 tracking-wider">
                {pinGerado.pin}
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                ID: {pinGerado.id} | Gerado em: {new Date(pinGerado.dataGeracao).toLocaleString('pt-BR')}
              </p>
            </div>

            <div className="flex gap-3">
              <Button
                variant="primary"
                onClick={handleCopiarPin}
                className="flex-1 flex items-center justify-center gap-2"
              >
                {copiado ? (
                  <>
                    <FiCheck size={20} />
                    <span>Copiado!</span>
                  </>
                ) : (
                  <>
                    <FiCopy size={20} />
                    <span>Copiar PIN</span>
                  </>
                )}
              </Button>
              <Button
                variant="outline"
                onClick={() => setShowPinModal(false)}
                className="flex-1"
              >
                Fechar
              </Button>
            </div>
          </div>
        </div>
      )}
    </Layout>
  );
};

export default AdminDashboard;
