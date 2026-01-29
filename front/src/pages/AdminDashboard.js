// src/pages/AdminDashboard.js
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Layout from '../components/layout/Layout';
import SessionCard from '../components/sessions/SessionCard';
import Button from '../components/ui/Button';
import Alert from '../components/ui/Alert';
import ConfigureSessionModal from '../features/sessions/components/ConfigureSessionModal';
import eventoService from '../services/eventoService';
import sessaoService from '../services/sessaoService';
import relatorioService from '../services/relatorioService';
import checkinService from '../services/checkinService';
import { useSessoes } from '../hooks/useSessoes';
import { useRelatorios } from '../hooks/useRelatorios';
import { FiPlus, FiDownload, FiUpload, FiFileText, FiKey, FiCopy, FiCheck } from 'react-icons/fi';

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
  
  const [showModal, setShowModal] = useState(false);
  const [showAlert, setShowAlert] = useState(false);
  const [alertData, setAlertData] = useState({ type: 'info', message: '' });
  const [eventoParaEditar, setEventoParaEditar] = useState(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [eventoParaExcluir, setEventoParaExcluir] = useState(null);
  const [pinGerado, setPinGerado] = useState(null);
  const [showPinModal, setShowPinModal] = useState(false);
  const [copiado, setCopiado] = useState(false);

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
        const csvContent = convertToCSV(relatorio);
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

  // Função auxiliar para converter JSON em CSV
  const convertToCSV = (data) => {
    if (!data || data.length === 0) return '';

    const headers = [
      'ID Presença',
      'Usuário ID',
      'Nome Usuário',
      'CPF',
      'Email',
      'Evento ID',
      'Título Evento',
      'Campus',
      'Local',
      'Data Início',
      'Data Fim',
      'Check-in',
      'Check-out',
      'Latitude Check-in',
      'Longitude Check-in'
    ];

    const rows = data.map(item => [
      item.id,
      item.usuario?.id || '',
      item.usuario?.nomeCompleto || '',
      item.usuario?.cpf || '',
      item.usuario?.email || '',
      item.evento?.id || '',
      item.evento?.titulo || '',
      item.evento?.nomeCampus || '',
      `${item.evento?.local?.campus || ''} - ${item.evento?.local?.bloco || ''} - ${item.evento?.local?.sala || ''}`,
      item.evento?.dataInicio?.dataPorExtenso || '',
      item.evento?.dataFim?.dataPorExtenso || '',
      item.dataCheckIn || '',
      item.dataCheckOut || '',
      item.localizacao?.latitude || '',
      item.localizacao?.longitude || ''
    ]);

    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.map(cell => `"${cell}"`).join(','))
    ].join('\n');

    return csvContent;
  };

  // Função auxiliar para download do CSV
  const downloadCSVFile = (content, filename) => {
    const blob = new Blob(['\ufeff' + content], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    
    link.setAttribute('href', url);
    link.setAttribute('download', filename);
    link.style.visibility = 'hidden';
    
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
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

        {/* Botões de ação coloridos */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          <Button
            variant="primary"
            onClick={handleAddSession}
            className="flex items-center justify-center gap-2"
          >
            <FiPlus size={20} />
            <span className="hidden sm:inline">Adicionar Sessão</span>
          </Button>

          <Button
            variant="success"
            onClick={handleImport}
            className="flex items-center justify-center gap-2"
          >
            <FiUpload size={20} />
            <span className="hidden sm:inline">Importar</span>
          </Button>

          <Button
            variant="warning"
            onClick={handleExport}
            className="flex items-center justify-center gap-2"
          >
            <FiDownload size={20} />
            <span className="hidden sm:inline">Exportar</span>
          </Button>

          <Button
            variant="secondary"
            onClick={handleRelatorios}
            className="flex items-center justify-center gap-2"
          >
            <FiFileText size={20} />
            <span className="hidden sm:inline">Relatórios</span>
          </Button>

          <Button
            variant="info"
            onClick={handleGerarPin}
            className="flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700"
          >
            <FiKey size={20} />
            <span className="hidden sm:inline">Gerar Novo PIN</span>
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
              <span className="text-green-500 text-2xl">●</span>
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
              <span className="text-yellow-500 text-2xl">⏱</span>
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
                  isEventoPassado={eventoPassado}
                />
              );
            })}
          </div>
        </>
      )}

      {/* Modal de Configuração de Sessão */}
      {/* Modal de Configuração de Sessão */}
      <ConfigureSessionModal
        isOpen={showModal}
        onClose={handleCloseModal}
        eventoParaEditar={eventoParaEditar}
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
