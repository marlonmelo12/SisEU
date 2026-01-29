// src/components/avaliacoes/VisualizacaoAvaliacao.js
import React from 'react';
import Badge from '../ui/Badge';

const VisualizacaoAvaliacao = ({ avaliacao, comentarios }) => {
  const getModalidadeNome = (modalidade) => {
    const modalidades = {
      0: 'Pôster/Banner',
      1: 'Pitch',
      2: 'Oral'
    };
    return modalidades[modalidade] || 'Desconhecida';
  };

  const getCamposPorModalidade = (modalidade) => {
    const campos = {
      0: [
        { label: 'Qualidade Visual', key: 'qualidadeVisual' },
        { label: 'Domínio do Tema', key: 'dominioTema' },
        { label: 'Metodologia', key: 'metodologia' }
      ],
      1: [
        { label: 'Poder de Síntese', key: 'poderSintese' },
        { label: 'Qualidade do Slide', key: 'qualidadeSlide' },
        { label: 'Impacto/Inovação', key: 'impactoInovacao' }
      ],
      2: [
        { label: 'Qualidade Técnica', key: 'qualidadeTecnica' },
        { label: 'Apresentação Oral', key: 'apresentacaoOral' },
        { label: 'Arguição', key: 'arguicao' }
      ]
    };
    return campos[modalidade] || [];
  };

  return (
    <div className="space-y-4">
      <div className="mb-4 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
        <div className="flex items-center justify-between">
          <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
            Tipo de Apresentação: <span className="font-bold">{getModalidadeNome(avaliacao.modalidade)}</span>
          </p>
          <Badge variant="success">Avaliação Concluída</Badge>
        </div>
      </div>

      <div className="mb-4 p-4 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-800">
        <p className="text-lg font-semibold text-green-700 dark:text-green-400">
          Nota Final: {avaliacao.nota?.toFixed(1)}
        </p>
      </div>

      {comentarios && (
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Comentários
          </label>
          <div className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg 
                       bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-white min-h-[100px]">
            {comentarios}
          </div>
        </div>
      )}

      <div className="mt-4 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
        <p className="text-xs text-gray-500 dark:text-gray-400 text-center">
          Esta avaliação já foi concluída e não pode ser editada.
        </p>
      </div>
    </div>
  );
};

export default VisualizacaoAvaliacao;
