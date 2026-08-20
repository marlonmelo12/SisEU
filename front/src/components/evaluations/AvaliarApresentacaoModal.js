// src/components/evaluations/AvaliarApresentacaoModal.js
import React, { useState } from 'react';
import Modal from '../ui/Modal';
import Button from '../ui/Button';
import Input from '../ui/Input';
import Alert from '../ui/Alert';
import { FiStar, FiCheck, FiLoader } from 'react-icons/fi';
import avaliacaoService from '../../services/avaliacaoService';
import { useToast } from '../../hooks/useToast';

/**
 * Modal para o Avaliador atribuir nota e parecer a uma Apresentação
 */
const AvaliarApresentacaoModal = ({ isOpen, onClose, apresentacao, onAvaliacaoSalva }) => {
  const [nota, setNota] = useState(apresentacao?.nota || '');
  const [parecer, setParecer] = useState(apresentacao?.parecer || '');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const { showToast } = useToast();

  if (!apresentacao) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    const notaNum = parseFloat(nota);

    if (isNaN(notaNum) || notaNum < 0 || notaNum > 10) {
      setError('A nota deve ser um número entre 0 e 10.');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      await avaliacaoService.avaliar({
        apresentacaoId: apresentacao.id,
        nota: notaNum,
        parecer: parecer,
      });

      showToast('Avaliação registrada com sucesso!', 'success');
      onAvaliacaoSalva();
      onClose();
    } catch (err) {
      setError(err.message || 'Erro ao registrar avaliação.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`Avaliar: ${apresentacao.titulo}`}
      size="md"
    >
      <form onSubmit={handleSubmit} className="space-y-4 p-2 sm:p-4">
        {error && <Alert type="error" message={error} />}

        <div className="bg-gray-50 dark:bg-gray-700/50 p-3 rounded-xl border border-gray-100 dark:border-gray-600 space-y-1">
          <p className="text-xs text-gray-500 dark:text-gray-400"><strong>Autor:</strong> {apresentacao.autor?.nomeCompleto || apresentacao.autor || 'Não informado'}</p>
          {apresentacao.orientador && (
            <p className="text-xs text-gray-500 dark:text-gray-400"><strong>Orientador:</strong> {apresentacao.orientador?.nomeCompleto || apresentacao.orientador}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1">
            Nota (0 a 10) <span className="text-red-500">*</span>
          </label>
          <div className="relative">
            <Input
              type="number"
              step="0.1"
              min="0"
              max="10"
              value={nota}
              onChange={(e) => setNota(e.target.value)}
              placeholder="Ex: 9.5"
              required
              icon={<FiStar className="text-amber-500" size={18} />}
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1">
            Parecer / Observações (Opcional)
          </label>
          <textarea
            value={parecer}
            onChange={(e) => setParecer(e.target.value)}
            rows={3}
            placeholder="Escreva seus comentários sobre a apresentação..."
            className="w-full px-3 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-xl text-sm focus:ring-2 focus:ring-primary-500 dark:text-white"
          />
        </div>

        <div className="flex justify-end gap-3 pt-3 border-t border-gray-100 dark:border-gray-700">
          <Button variant="outline" onClick={onClose} type="button" disabled={loading}>
            Cancelar
          </Button>
          <Button variant="primary" type="submit" disabled={loading}>
            {loading ? (
              <span className="flex items-center gap-1.5">
                <FiLoader className="animate-spin" /> Salvando...
              </span>
            ) : (
              <span className="flex items-center gap-1.5">
                <FiCheck /> Salvar Avaliação
              </span>
            )}
          </Button>
        </div>
      </form>
    </Modal>
  );
};

export default AvaliarApresentacaoModal;
