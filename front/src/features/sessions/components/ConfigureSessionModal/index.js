// src/features/sessions/components/ConfigureSessionModal/index.js
import React, { useState, useEffect } from 'react';
import Modal from '../../../../components/ui/Modal';
import Input from '../../../../components/ui/Input';
import Button from '../../../../components/ui/Button';
import Alert from '../../../../components/ui/Alert';
import eventoService from '../../../../services/eventoService';
import { CAMPUS, CAMPUS_LABELS, TIPO_EVENTO, TIPO_EVENTO_LABELS, MODALIDADE, MODALIDADE_LABELS } from '../../../../constants';
import { unformatCPF } from '../../../../utils/formatters';
import { FiPlus, FiTrash2, FiSave } from 'react-icons/fi';

/**
 * Modal para criar/editar eventos com apresentações
 */
const ConfigureSessionModal = ({ isOpen, onClose, eventoParaEditar = null }) => {
  const [loading, setLoading] = useState(false);
  const [erro, setErro] = useState(null);
  const [sucesso, setSucesso] = useState(false);

  // Estado do formulário
  const [formData, setFormData] = useState({
    titulo: '',
    dataInicio: '',
    dataFim: '',
    local: {
      campus: 0,
      departamento: '',
      bloco: '',
      sala: '',
    },
    eTipoEvento: 0,
    cpfsAvaliadores: [],
    imgUrl: '',
    codigoUnico: '',
    apresentacoes: [],
  });

  // Estado para nova apresentação
  const [novaApresentacao, setNovaApresentacao] = useState({
    titulo: '',
    cpfAutor: '',
    cpfOrientador: '',
    modalidade: 0,
  });

  // Estado para CPF de avaliador
  const [novoCpfAvaliador, setNovoCpfAvaliador] = useState('');

  // Carrega dados do evento se estiver editando
  useEffect(() => {
    if (eventoParaEditar && isOpen) {
      console.log('[MODAL] Carregando evento para editar:', eventoParaEditar);
      
      // 1. Tratamento do Local (De String para Objeto)
      let localObj = { campus: 0, departamento: '', bloco: '', sala: '' };
      
      if (typeof eventoParaEditar.local === 'string') {
        const partes = eventoParaEditar.local.split(',').map(p => p.trim());
        // Inverte a lógica: o log indica [sala, bloco, departamento, campus]
        localObj = {
          sala: partes[0] || '',
          bloco: partes[1] || '',
          departamento: partes[2] || '',
          campus: eventoParaEditar.nomeCampus?.toUpperCase().includes('PICI') ? CAMPUS.PICI : 0
        };
      } else if (eventoParaEditar.local && typeof eventoParaEditar.local === 'object') {
        localObj = {
          campus: eventoParaEditar.local.campus || 0,
          departamento: eventoParaEditar.local.departamento || '',
          bloco: eventoParaEditar.local.bloco || '',
          sala: eventoParaEditar.local.sala || '',
        };
      }
      
      // 2. Avaliadores (Usa professoresAvaliadores conforme o log)
      const avaliadores = eventoParaEditar.professoresAvaliadores || eventoParaEditar.avaliadores || [];
      
      // 3. Apresentações
      const apresentacoes = Array.isArray(eventoParaEditar.apresentacoes)
        ? eventoParaEditar.apresentacoes.map(ap => ({
            id: ap.id || 0,
            eventoId: eventoParaEditar.id,
            titulo: ap.titulo || '',
            cpfAutor: ap.cpfAutor || ap.autor?.cpf || '',
            cpfOrientador: ap.cpfOrientador || ap.orientador?.cpf || '',
            modalidade: ap.modalidade || 0,
          }))
        : [];
      
      // 4. Formatação de Datas (Usa dataInicio e dataFim direto do log)
      const formatarISO = (iso) => {
        if (!iso) return '';
        const d = new Date(iso);
        return isNaN(d.getTime()) ? '' : d.toISOString().slice(0, 16);
      };

      const dataInicioFormatada = formatarISO(eventoParaEditar.dataInicio);
      const dataFimFormatada = formatarISO(eventoParaEditar.dataFim);
      
      setFormData({
        titulo: eventoParaEditar.titulo || '',
        dataInicio: dataInicioFormatada,
        dataFim: dataFimFormatada,
        local: localObj,
        eTipoEvento: eventoParaEditar.eventType || 1, // Log mostra eventType: 1
        cpfsAvaliadores: avaliadores,
        imgUrl: eventoParaEditar.imagemUrl || eventoParaEditar.imgUrl || '',
        codigoUnico: eventoParaEditar.codigoUnico || '',
        apresentacoes: apresentacoes,
      });
    }
  }, [eventoParaEditar, isOpen]);

  // Reseta o formulário ao fechar
  useEffect(() => {
    if (!isOpen) {
      setTimeout(() => {
        resetarFormulario();
      }, 300);
    }
  }, [isOpen]);

  const resetarFormulario = () => {
    setFormData({
      titulo: '',
      dataInicio: '',
      dataFim: '',
      local: {
        campus: 0,
        departamento: '',
        bloco: '',
        sala: '',
      },
      eTipoEvento: 0,
      cpfsAvaliadores: [],
      imgUrl: '',
      codigoUnico: '',
      apresentacoes: [],
    });
    setNovaApresentacao({
      titulo: '',
      cpfAutor: '',
      cpfOrientador: '',
      modalidade: 0,
    });
    setNovoCpfAvaliador('');
    setErro(null);
    setSucesso(false);
  };

  const formatarDataParaInput = (dataISO) => {
    if (!dataISO) return '';
    
    try {
      let data;
      
      // Se for um objeto com propriedades de data (ano, mês, dia, hora, minuto)
      if (typeof dataISO === 'object' && dataISO.year) {
        data = new Date(
          dataISO.year,
          dataISO.month - 1, // JavaScript usa 0-11 para meses
          dataISO.day,
          dataISO.hour || 0,
          dataISO.minute || 0,
          dataISO.second || 0
        );
      } else {
        // Se for uma string ISO ou timestamp
        data = new Date(dataISO);
      }
      
      // Verifica se a data é válida
      if (isNaN(data.getTime())) {
        console.warn('[MODAL] Data inválida recebida:', dataISO);
        return '';
      }
      
      return data.toISOString().slice(0, 16);
    } catch (error) {
      console.error('[MODAL] Erro ao formatar data:', error, dataISO);
      return '';
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    
    if (name.startsWith('local.')) {
      const campo = name.split('.')[1];
      setFormData({
        ...formData,
        local: {
          ...formData.local,
          [campo]: campo === 'campus' ? parseInt(value) : value,
        },
      });
    } else if (name === 'eTipoEvento') {
      setFormData({
        ...formData,
        [name]: parseInt(value),
      });
    } else {
      setFormData({
        ...formData,
        [name]: value,
      });
    }
  };

  const handleApresentacaoChange = (e) => {
    const { name, value } = e.target;
    setNovaApresentacao({
      ...novaApresentacao,
      [name]: name === 'modalidade' ? parseInt(value) : value,
    });
  };

  const adicionarApresentacao = () => {
    if (!novaApresentacao.titulo || !novaApresentacao.cpfAutor) {
      setErro('Preencha pelo menos o título e CPF do autor da apresentação');
      return;
    }

    // Remove eventoId e id ao adicionar nova apresentação
    // Limpa CPFs removendo formatação
    const apresentacaoLimpa = {
      titulo: novaApresentacao.titulo,
      cpfAutor: unformatCPF(novaApresentacao.cpfAutor),
      cpfOrientador: novaApresentacao.cpfOrientador ? unformatCPF(novaApresentacao.cpfOrientador) : '',
      modalidade: parseInt(novaApresentacao.modalidade),
    };

    setFormData({
      ...formData,
      apresentacoes: [...formData.apresentacoes, apresentacaoLimpa],
    });

    setNovaApresentacao({
      titulo: '',
      cpfAutor: '',
      cpfOrientador: '',
      modalidade: 0,
    });
    setErro(null);
  };

  const removerApresentacao = (index) => {
    setFormData({
      ...formData,
      apresentacoes: formData.apresentacoes.filter((_, i) => i !== index),
    });
  };

  const adicionarAvaliador = () => {
    if (!novoCpfAvaliador) {
      setErro('Informe o CPF do avaliador');
      return;
    }

    const cpfLimpo = unformatCPF(novoCpfAvaliador);
    
    if (formData.cpfsAvaliadores.includes(cpfLimpo)) {
      setErro('Este avaliador já foi adicionado');
      return;
    }

    setFormData({
      ...formData,
      cpfsAvaliadores: [...formData.cpfsAvaliadores, cpfLimpo],
    });
    setNovoCpfAvaliador('');
    setErro(null);
  };

  const removerAvaliador = (cpf) => {
    setFormData({
      ...formData,
      cpfsAvaliadores: formData.cpfsAvaliadores.filter((c) => c !== cpf),
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErro(null);
    setSucesso(false);

    console.log('[MODAL] Estado do formData no submit:', formData);
    console.log('[MODAL] Número de apresentações:', formData.apresentacoes.length);

    // Validações básicas
    if (!formData.titulo || !formData.dataInicio || !formData.dataFim) {
      setErro('Preencha todos os campos obrigatórios');
      return;
    }

    if (new Date(formData.dataFim) < new Date(formData.dataInicio)) {
      setErro('A data de fim deve ser posterior à data de início');
      return;
    }

    setLoading(true);

    try {
      // Limpa todos os CPFs (remove formatação) e filtra strings vazias
      const cpfsAvaliadores = formData.cpfsAvaliadores
        .map(cpf => unformatCPF(cpf))
        .filter(cpf => cpf && cpf.trim() !== '');
      const apresentacoesLimpas = formData.apresentacoes.map((ap) => ({
        titulo: ap.titulo,
        cpfAutor: unformatCPF(ap.cpfAutor),
        cpfOrientador: ap.cpfOrientador ? unformatCPF(ap.cpfOrientador) : '',
        modalidade: parseInt(ap.modalidade),
        ...(eventoParaEditar ? { id: ap.id || 0, eventoId: eventoParaEditar.id } : {}),
      }));

      // Monta o payload base (camelCase para POST)
      // Backend não aceita eTipoEvento = 0, usa valor válido (1-4) ou padrão 1 (SEMINARIO)
      const tipoEventoValido = parseInt(formData.eTipoEvento) || 1;
      
      const dadosEvento = {
        titulo: formData.titulo,
        dataInicio: new Date(formData.dataInicio).toISOString(),
        dataFim: new Date(formData.dataFim).toISOString(),
        local: {
          campus: parseInt(formData.local.campus) || 0,
          departamento: formData.local.departamento || '',
          bloco: formData.local.bloco || '',
          sala: formData.local.sala || '',
        },
        eTipoEvento: tipoEventoValido === 0 ? 1 : tipoEventoValido, // Garante que nunca seja 0
        cpfsAvaliadores: cpfsAvaliadores, // Usa os CPFs coletados
        imgUrl: formData.imgUrl || '',
        codigoUnico: formData.codigoUnico || '',
        apresentacoes: apresentacoesLimpas, // Usa as apresentações coletadas
      };

      // PUT precisa PascalCase e wrapper "request", POST usa camelCase direto
      let payload;
      if (eventoParaEditar) {
        const apresentacoesPascalCase = apresentacoesLimpas.map(ap => ({
          Id: ap.id || 0,
          EventoId: eventoParaEditar.id,
          Titulo: ap.titulo,
          CpfAutor: ap.cpfAutor,
          CpfOrientador: ap.cpfOrientador || '',
          Modalidade: ap.modalidade,
        }));

        // PATCH usa PascalCase mas SEM wrapper request
        // Backend não aceita ETipoEvento = 0, usa valor válido (1-4) ou padrão 1 (SEMINARIO)
        const tipoEvento = parseInt(formData.eTipoEvento) || 1; // Padrão: SEMINARIO
        
        payload = {
          Id: eventoParaEditar.id,
          Titulo: formData.titulo,
          DataInicio: new Date(formData.dataInicio).toISOString(),
          DataFim: new Date(formData.dataFim).toISOString(),
          Local: {
            Campus: parseInt(formData.local.campus) || 0,
            Departamento: formData.local.departamento || '',
            Bloco: formData.local.bloco || '',
            Sala: formData.local.sala || '',
          },
          ETipoEvento: tipoEvento === 0 ? 1 : tipoEvento, // Garante que nunca seja 0
          CpfsAvaliadores: cpfsAvaliadores, // Usa os CPFs coletados
          ImgUrl: formData.imgUrl || '',
          CodigoUnico: formData.codigoUnico || '',
          Apresentacoes: apresentacoesPascalCase,
        };
      } else {
        payload = dadosEvento;
      }

      console.log('[MODAL] Payload a ser enviado:', JSON.stringify(payload, null, 2));

      let result;
      if (eventoParaEditar) {
        result = await eventoService.atualizar(eventoParaEditar.id, payload);
      } else {
        result = await eventoService.criar(payload);
      }

      if (result.success) {
        setSucesso(true);
        setTimeout(() => {
          onClose(true); // true indica que houve alteração
        }, 1500);
      } else {
        console.error('[MODAL] Erro retornado pelo serviço:', result.error);
        setErro(result.error || 'Erro ao salvar evento. Verifique os dados e tente novamente.');
      }
    } catch (error) {
      console.error('[MODAL] Erro na captura:', error);
      setErro('Erro ao salvar evento. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal 
      isOpen={isOpen} 
      onClose={() => onClose(false)} 
      title={eventoParaEditar ? '✏️ Editar Evento' : '➕ Criar Novo Evento'}
      size="xl"
    >
      <form onSubmit={handleSubmit} className="space-y-6 max-h-[calc(100vh-200px)] overflow-y-auto px-1">
        {/* Alertas */}
        {erro && (
          <Alert type="error" message={erro} onClose={() => setErro(null)} />
        )}
        {sucesso && (
          <Alert type="success" message="Evento salvo com sucesso!" />
        )}

        {/* Informações Básicas */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
            <span className="w-1 h-6 bg-primary-500 rounded"></span>
            Informações Básicas
          </h3>

          <Input
            label="Título *"
            name="titulo"
            value={formData.titulo}
            onChange={handleChange}
            placeholder="Nome do evento"
            required
          />

          {/* Data e Hora - Layout melhorado */}
          <div className="space-y-3">
            <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-4 bg-gray-50 dark:bg-gray-700/50">
              <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3 flex items-center gap-2">
                <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                Data e Hora de Início *
              </h4>
              <Input
                name="dataInicio"
                type="datetime-local"
                value={formData.dataInicio}
                onChange={handleChange}
                required
                className="text-lg"
              />
            </div>
            
            <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-4 bg-gray-50 dark:bg-gray-700/50">
              <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3 flex items-center gap-2">
                <span className="w-2 h-2 bg-red-500 rounded-full"></span>
                Data e Hora de Término *
              </h4>
              <Input
                name="dataFim"
                type="datetime-local"
                value={formData.dataFim}
                onChange={handleChange}
                required
                className="text-lg"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Tipo de Evento
              </label>
              <select
                name="eTipoEvento"
                value={formData.eTipoEvento}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 dark:bg-gray-700 dark:text-white"
              >
                {Object.entries(TIPO_EVENTO).map(([key, value]) => (
                  <option key={value} value={value}>
                    {TIPO_EVENTO_LABELS[value]}
                  </option>
                ))}
              </select>
            </div>
            <Input
              label="Código Único"
              name="codigoUnico"
              value={formData.codigoUnico}
              onChange={handleChange}
              placeholder="Código identificador"
            />
          </div>

          <Input
            label="URL da Imagem"
            name="imgUrl"
            value={formData.imgUrl}
            onChange={handleChange}
            placeholder="https://exemplo.com/imagem.jpg"
          />
        </div>

        {/* Local */}
        <div className="space-y-4 pt-4 border-t border-gray-200 dark:border-gray-700">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
            <span className="w-1 h-6 bg-blue-500 rounded"></span>
            Local do Evento
          </h3>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Campus
            </label>
            <select
              name="local.campus"
              value={formData.local.campus}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 dark:bg-gray-700 dark:text-white"
            >
              {Object.entries(CAMPUS).map(([key, value]) => (
                <option key={value} value={value}>
                  {CAMPUS_LABELS[value]}
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-3 gap-4">
            <Input
              label="Departamento"
              name="local.departamento"
              value={formData.local.departamento}
              onChange={handleChange}
              placeholder="Ex: Ciência da Computação"
            />
            <Input
              label="Bloco"
              name="local.bloco"
              value={formData.local.bloco}
              onChange={handleChange}
              placeholder="Ex: 942"
            />
            <Input
              label="Sala"
              name="local.sala"
              value={formData.local.sala}
              onChange={handleChange}
              placeholder="Ex: 101"
            />
          </div>
        </div>

        {/* Avaliadores */}
        <div className="space-y-4 pt-4 border-t border-gray-200 dark:border-gray-700">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
            <span className="w-1 h-6 bg-yellow-500 rounded"></span>
            Avaliadores
          </h3>

          <div className="flex gap-2">
            <Input
              label="CPF do Avaliador"
              value={novoCpfAvaliador}
              onChange={(e) => setNovoCpfAvaliador(e.target.value)}
              placeholder="000.000.000-00"
              className="flex-1"
            />
            <Button
              type="button"
              variant="outline"
              onClick={adicionarAvaliador}
              className="mt-6"
            >
              <FiPlus />
            </Button>
          </div>

          {formData.cpfsAvaliadores.length > 0 && (
            <div className="space-y-2">
              <p className="text-xs font-medium text-gray-600 dark:text-gray-400 mb-2">
                Avaliadores adicionados:
              </p>
              {formData.cpfsAvaliadores.map((cpf, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 p-3 rounded-lg hover:shadow-sm transition-shadow"
                >
                  <div className="flex items-center gap-3">
                    <span className="flex items-center justify-center w-8 h-8 bg-yellow-500 text-white rounded-full text-sm font-bold">
                      {index + 1}
                    </span>
                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                      CPF: {cpf}
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() => removerAvaliador(cpf)}
                    className="p-2 text-red-500 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                    title="Remover avaliador"
                  >
                    <FiTrash2 size={16} />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Apresentações */}
        <div className="space-y-4 pt-4 border-t border-gray-200 dark:border-gray-700">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
            <span className="w-1 h-6 bg-purple-500 rounded"></span>
            Apresentações
          </h3>

          {/* Formulário para nova apresentação */}
          <div className="bg-gradient-to-br from-purple-50 to-blue-50 dark:from-gray-700 dark:to-gray-800 p-5 rounded-lg border-2 border-purple-200 dark:border-purple-900 space-y-4">
            <p className="text-sm font-medium text-purple-700 dark:text-purple-300 mb-3">
              ➕ Adicionar Nova Apresentação
            </p>
            
            <Input
              label="Título da Apresentação"
              name="titulo"
              value={novaApresentacao.titulo}
              onChange={handleApresentacaoChange}
              placeholder="Nome do trabalho"
            />

            <div className="grid grid-cols-2 gap-4">
              <Input
                label="CPF do Autor"
                name="cpfAutor"
                value={novaApresentacao.cpfAutor}
                onChange={handleApresentacaoChange}
                placeholder="000.000.000-00"
              />
              <Input
                label="CPF do Orientador"
                name="cpfOrientador"
                value={novaApresentacao.cpfOrientador}
                onChange={handleApresentacaoChange}
                placeholder="000.000.000-00"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Modalidade
              </label>
              <select
                name="modalidade"
                value={novaApresentacao.modalidade}
                onChange={handleApresentacaoChange}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 dark:bg-gray-700 dark:text-white"
              >
                {Object.entries(MODALIDADE).map(([key, value]) => (
                  <option key={value} value={value}>
                    {MODALIDADE_LABELS[value]}
                  </option>
                ))}
              </select>
            </div>

            <Button
              type="button"
              variant="primary"
              onClick={adicionarApresentacao}
              className="w-full bg-purple-600 hover:bg-purple-700 border-purple-600 flex items-center justify-center"
            >
              <FiPlus className="mr-2" size={18} />
              Adicionar Apresentação
            </Button>
          </div>

          {/* Lista de apresentações adicionadas */}
          {formData.apresentacoes.length > 0 && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  📋 Apresentações Cadastradas
                </p>
                <span className="px-3 py-1 bg-purple-100 dark:bg-purple-900 text-purple-700 dark:text-purple-300 rounded-full text-xs font-semibold">
                  {formData.apresentacoes.length} {formData.apresentacoes.length === 1 ? 'apresentação' : 'apresentações'}
                </span>
              </div>
              {formData.apresentacoes.map((ap, index) => (
                <div
                  key={index}
                  className="flex items-start justify-between bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-600 p-3 rounded-lg"
                >
                  <div className="flex-1">
                    <p className="font-medium text-gray-900 dark:text-white">
                      {ap.titulo}
                    </p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      Autor: {ap.cpfAutor}
                      {ap.cpfOrientador && ` | Orientador: ${ap.cpfOrientador}`}
                    </p>
                    <p className="text-xs text-gray-500">
                      Modalidade: {MODALIDADE_LABELS[ap.modalidade]}
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => removerApresentacao(index)}
                    className="text-red-500 hover:text-red-700 ml-4"
                  >
                    <FiTrash2 size={16} />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Botões de ação */}
        <div className="flex justify-end gap-3 pt-6 border-t-2 border-gray-200 dark:border-gray-700 sticky bottom-0 bg-white dark:bg-gray-800 pb-2">
          <Button
            type="button"
            variant="outline"
            onClick={() => onClose(false)}
            disabled={loading}
            className="px-6"
          >
            Cancelar
          </Button>
          <Button
            type="submit"
            variant="primary"
            disabled={loading}
            className="flex items-center gap-2 px-6 bg-gradient-to-r from-primary-500 to-primary-600 hover:from-primary-600 hover:to-primary-700"
          >
            <FiSave />
            {loading ? 'Salvando...' : eventoParaEditar ? 'Atualizar Evento' : 'Criar Evento'}
          </Button>
        </div>
      </form>
    </Modal>
  );
};

export default ConfigureSessionModal;
