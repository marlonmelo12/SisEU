// src/features/sessions/components/ConfigureSessionModal/index.js
import React, { useState, useEffect } from 'react';
import Modal from '../../../../components/ui/Modal';
import Input from '../../../../components/ui/Input';
import Button from '../../../../components/ui/Button';
import Alert from '../../../../components/ui/Alert';
import eventoService from '../../../../services/eventoService';
import { CAMPUS, CAMPUS_LABELS, TIPO_EVENTO, TIPO_EVENTO_LABELS } from '../../../../constants';
import { unformatCPF } from '../../../../utils/formatters';
import { FiPlus, FiTrash2, FiSave, FiCalendar, FiClock } from 'react-icons/fi';

/**
 * Modal para criar/editar eventos com apresentações
 * Refatorado com opções atualizadas (Apresentação Oral, Pitch, Banner),
 * Seletor de datas aprimorado e remoção de campos redundantes.
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

  // Estado para nova apresentação (sem modalidade)
  const [novaApresentacao, setNovaApresentacao] = useState({
    titulo: '',
    cpfAutor: '',
    cpfOrientador: '',
  });

  // Estado para CPF de avaliador
  const [novoCpfAvaliador, setNovoCpfAvaliador] = useState('');

  // Carrega dados do evento se estiver editando
  useEffect(() => {
    if (eventoParaEditar && isOpen) {
      let localObj = { campus: 0, departamento: '', bloco: '', sala: '' };
      
      if (typeof eventoParaEditar.local === 'string') {
        const partes = eventoParaEditar.local.split(',').map(p => p.trim());
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
      
      const avaliadores = eventoParaEditar.professoresAvaliadores || eventoParaEditar.avaliadores || [];
      
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
        eTipoEvento: eventoParaEditar.eventType ?? 0,
        cpfsAvaliadores: avaliadores,
        imgUrl: eventoParaEditar.imagemUrl || eventoParaEditar.imgUrl || '',
        codigoUnico: eventoParaEditar.codigoUnico || Math.floor(100000 + Math.random() * 900000).toString(),
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
    const pinGerado = Math.floor(100000 + Math.random() * 900000).toString();
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
      codigoUnico: pinGerado,
      apresentacoes: [],
    });
    setNovaApresentacao({
      titulo: '',
      cpfAutor: '',
      cpfOrientador: '',
    });
    setNovoCpfAvaliador('');
    setErro(null);
    setSucesso(false);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    
    if (name.startsWith('local.')) {
      const field = name.split('.')[1];
      setFormData({
        ...formData,
        local: {
          ...formData.local,
          [field]: field === 'campus' ? parseInt(value) : value,
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
      [name]: value,
    });
  };

  const adicionarApresentacao = () => {
    if (!novaApresentacao.titulo || !novaApresentacao.cpfAutor) {
      setErro('Preencha pelo menos o título e CPF do autor da apresentação');
      return;
    }

    const apresentacaoLimpa = {
      titulo: novaApresentacao.titulo,
      cpfAutor: unformatCPF(novaApresentacao.cpfAutor),
      cpfOrientador: novaApresentacao.cpfOrientador ? unformatCPF(novaApresentacao.cpfOrientador) : '',
      modalidade: 0, // Padrão
    };

    setFormData({
      ...formData,
      apresentacoes: [...formData.apresentacoes, apresentacaoLimpa],
    });

    setNovaApresentacao({
      titulo: '',
      cpfAutor: '',
      cpfOrientador: '',
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

    if (!formData.titulo || !formData.dataInicio || !formData.dataFim) {
      setErro('Preencha todos os campos obrigatórios');
      return;
    }

    if (new Date(formData.dataFim) < new Date(formData.dataInicio)) {
      setErro('A data de término deve ser posterior à data de início');
      return;
    }

    setLoading(true);

    try {
      const cpfsAvaliadores = formData.cpfsAvaliadores
        .map(cpf => unformatCPF(cpf))
        .filter(cpf => cpf && cpf.trim() !== '');

      const apresentacoesLimpas = formData.apresentacoes.map((ap) => ({
        titulo: ap.titulo,
        cpfAutor: unformatCPF(ap.cpfAutor),
        cpfOrientador: ap.cpfOrientador ? unformatCPF(ap.cpfOrientador) : '',
        modalidade: ap.modalidade ?? 0,
        ...(eventoParaEditar ? { id: ap.id || 0, eventoId: eventoParaEditar.id } : {}),
      }));

      const tipoEventoValido = parseInt(formData.eTipoEvento);
      
      const payload = {
        titulo: formData.titulo,
        dataInicio: new Date(formData.dataInicio).toISOString(),
        dataFim: new Date(formData.dataFim).toISOString(),
        local: {
          campus: parseInt(formData.local.campus) || 0,
          departamento: formData.local.departamento || '',
          bloco: formData.local.bloco || '',
          sala: formData.local.sala || '',
        },
        eTipoEvento: tipoEventoValido,
        cpfsAvaliadores: cpfsAvaliadores,
        imgUrl: '',
        codigoUnico: formData.codigoUnico || Math.floor(100000 + Math.random() * 900000).toString(),
        apresentacoes: apresentacoesLimpas,
      };

      let result;
      if (eventoParaEditar) {
        result = await eventoService.atualizar(eventoParaEditar.id, payload);
      } else {
        result = await eventoService.criar(payload);
      }

      if (result.success) {
        setSucesso(true);
        setTimeout(() => {
          onClose(true);
        }, 1200);
      } else {
        setErro(result.error || 'Erro ao salvar evento. Verifique os dados e tente novamente.');
      }
    } catch (error) {
      setErro('Erro ao salvar evento. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={() => onClose(false)}
      title={eventoParaEditar ? 'Editar Evento' : 'Criar Novo Evento'}
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
            <span className="w-1.5 h-6 bg-primary-500 rounded-full"></span>
            Informações do Evento
          </h3>

          <Input
            label="Título do Evento *"
            name="titulo"
            value={formData.titulo}
            onChange={handleChange}
            placeholder="Ex: Mostra Científica de Tecnologia"
            required
          />

          {/* Seleção do Tipo de Evento */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Tipo de Evento *
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 sm:gap-3">
              {Object.entries(TIPO_EVENTO).map(([key, value]) => {
                const selected = formData.eTipoEvento === value;
                return (
                  <button
                    key={value}
                    type="button"
                    onClick={() => setFormData({ ...formData, eTipoEvento: value })}
                    className={`py-2.5 px-3 sm:py-3 sm:px-4 rounded-xl border text-xs sm:text-sm font-semibold transition-all flex items-center justify-center gap-1 ${
                      selected
                        ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/30 text-primary-700 dark:text-primary-300 ring-2 ring-primary-500/20 shadow-sm'
                        : 'border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-300 hover:border-gray-300'
                    }`}
                  >
                    <span>{TIPO_EVENTO_LABELS[value]}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Seletor Moderno de Data e Hora */}
          <div className="space-y-2 pt-2">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 flex items-center gap-2">
              <FiCalendar className="text-primary-500" /> Período da Sessão (Início e Término) *
            </label>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-gray-50 dark:bg-gray-700/40 border border-gray-200 dark:border-gray-600 rounded-xl p-4 space-y-2">
                <span className="text-xs font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400 flex items-center gap-1.5">
                  <FiClock size={14} /> Horário de Início
                </span>
                <input
                  name="dataInicio"
                  type="datetime-local"
                  value={formData.dataInicio}
                  onChange={handleChange}
                  required
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-sm font-medium bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500"
                />
              </div>

              <div className="bg-gray-50 dark:bg-gray-700/40 border border-gray-200 dark:border-gray-600 rounded-xl p-4 space-y-2">
                <span className="text-xs font-bold uppercase tracking-wider text-rose-600 dark:text-rose-400 flex items-center gap-1.5">
                  <FiClock size={14} /> Horário de Término
                </span>
                <input
                  name="dataFim"
                  type="datetime-local"
                  value={formData.dataFim}
                  onChange={handleChange}
                  required
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-sm font-medium bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Local */}
        <div className="space-y-4 pt-4 border-t border-gray-200 dark:border-gray-700">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
            <span className="w-1.5 h-6 bg-blue-500 rounded-full"></span>
            Localização no Campus
          </h3>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Campus
            </label>
            <select
              name="local.campus"
              value={formData.local.campus}
              onChange={handleChange}
              className="w-full px-3.5 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 dark:bg-gray-700 dark:text-white text-sm"
            >
              {Object.entries(CAMPUS).map(([key, value]) => (
                <option key={value} value={value}>
                  Campus {CAMPUS_LABELS[value]}
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <Input
              label="Departamento"
              name="local.departamento"
              value={formData.local.departamento}
              onChange={handleChange}
              placeholder="Ex: Computação"
            />
            <Input
              label="Bloco"
              name="local.bloco"
              value={formData.local.bloco}
              onChange={handleChange}
              placeholder="Ex: Bloco 910"
            />
            <Input
              label="Sala"
              name="local.sala"
              value={formData.local.sala}
              onChange={handleChange}
              placeholder="Ex: Sala 02"
            />
          </div>
        </div>

        {/* Avaliadores */}
        <div className="space-y-4 pt-4 border-t border-gray-200 dark:border-gray-700">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
            <span className="w-1.5 h-6 bg-emerald-500 rounded-full"></span>
            Professores Avaliadores
          </h3>

          <div className="flex gap-2">
            <div className="flex-1">
              <Input
                name="novoCpfAvaliador"
                value={novoCpfAvaliador}
                onChange={(e) => setNovoCpfAvaliador(e.target.value)}
                placeholder="CPF do Avaliador (000.000.000-00)"
              />
            </div>
            <Button
              type="button"
              variant="secondary"
              onClick={adicionarAvaliador}
              className="mt-1 px-4 flex items-center justify-center"
              title="Adicionar Avaliador"
            >
              <FiPlus size={20} />
            </Button>
          </div>

          {formData.cpfsAvaliadores.length > 0 && (
            <div className="flex flex-wrap gap-2 pt-2">
              {formData.cpfsAvaliadores.map((cpf, index) => (
                <div
                  key={index}
                  className="inline-flex items-center gap-2 px-3 py-1.5 bg-emerald-50 dark:bg-emerald-900/30 border border-emerald-200 dark:border-emerald-800 rounded-lg text-xs font-semibold text-emerald-800 dark:text-emerald-200"
                >
                  <span>CPF: {cpf}</span>
                  <button
                    type="button"
                    onClick={() => removerAvaliador(cpf)}
                    className="text-emerald-600 hover:text-emerald-800 dark:hover:text-emerald-100"
                  >
                    <FiTrash2 size={14} />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Apresentações */}
        <div className="space-y-4 pt-4 border-t border-gray-200 dark:border-gray-700">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
            <span className="w-1.5 h-6 bg-purple-500 rounded-full"></span>
            Apresentações Cadastradas
          </h3>

          {/* Formulário para nova apresentação */}
          <div className="bg-purple-50/50 dark:bg-purple-950/20 p-4 sm:p-5 rounded-xl border border-purple-200 dark:border-purple-800/50 space-y-4">
            <p className="text-sm font-bold text-purple-800 dark:text-purple-300">
              Adicionar Apresentação
            </p>
            
            <Input
              label="Título do Trabalho *"
              name="titulo"
              value={novaApresentacao.titulo}
              onChange={handleApresentacaoChange}
              placeholder="Nome da pesquisa ou trabalho"
            />

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <Input
                label="CPF do Autor *"
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

            <Button
              type="button"
              variant="primary"
              onClick={adicionarApresentacao}
              className="w-full bg-purple-600 hover:bg-purple-700 border-purple-600 flex items-center justify-center font-bold text-sm py-2.5"
            >
              <FiPlus className="mr-2" size={18} />
              Adicionar Apresentação
            </Button>
          </div>

          {/* Lista de apresentações adicionadas */}
          {formData.apresentacoes.length > 0 && (
            <div className="space-y-3">
              {formData.apresentacoes.map((ap, index) => (
                <div
                  key={index}
                  className="flex items-start justify-between bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 p-3.5 rounded-xl gap-2"
                >
                  <div className="flex-1 min-w-0">
                    <p className="font-bold text-gray-900 dark:text-white text-sm truncate">
                      {ap.titulo}
                    </p>
                    <p className="text-xs text-gray-600 dark:text-gray-400 mt-0.5 truncate">
                      Autor: {ap.cpfAutor}
                      {ap.cpfOrientador && ` | Orientador: ${ap.cpfOrientador}`}
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => removerApresentacao(index)}
                    className="text-gray-400 hover:text-rose-500 p-1 transition-colors flex-shrink-0"
                  >
                    <FiTrash2 size={16} />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Botões de ação */}
        <div className="flex flex-col-reverse sm:flex-row justify-end gap-2.5 sm:gap-3 pt-6 border-t border-gray-200 dark:border-gray-700 sticky bottom-0 bg-white dark:bg-gray-800 pb-2">
          <Button
            type="button"
            variant="outline"
            onClick={() => onClose(false)}
            disabled={loading}
            className="w-full sm:w-auto px-6 justify-center"
          >
            Cancelar
          </Button>
          <Button
            type="submit"
            variant="primary"
            disabled={loading}
            className="w-full sm:w-auto flex items-center justify-center gap-2 px-6 bg-gradient-to-r from-primary-500 to-primary-600 hover:from-primary-600 hover:to-primary-700 font-bold"
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
