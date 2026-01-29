// src/components/avaliacoes/FormularioBanner.js
import React from 'react';

const FormularioBanner = ({ notas, setNotas, comentarios, setComentarios }) => {
  const campos = [
    {
      id: 'qualidadeVisual',
      label: 'Qualidade Visual',
      descricao: 'Organização, brasão da UFC e dados obrigatórios'
    },
    {
      id: 'dominioTema',
      label: 'Domínio do Tema',
      descricao: 'Capacidade de explicar o resumo de forma clara'
    },
    {
      id: 'metodologia',
      label: 'Metodologia',
      descricao: 'Clareza na descrição dos procedimentos e resultados'
    }
  ];

  return (
    <div className="space-y-4">
      <div className="mb-4">
        <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
          Tipo de Apresentação: <span className="font-bold">Pôster/Banner</span>
        </p>
      </div>

      {campos.map((campo) => (
        <div key={campo.id}>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            {campo.label}
          </label>
          <p className="text-xs text-gray-500 dark:text-gray-400 mb-2">
            {campo.descricao}
          </p>
          <input
            type="number"
            step="0.1"
            min="0"
            max="10"
            value={notas[campo.id] || ''}
            onChange={(e) => setNotas({ ...notas, [campo.id]: e.target.value })}
            className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg 
                     bg-white dark:bg-gray-800 text-gray-900 dark:text-white
                     focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="0 à 10"
            required
          />
        </div>
      ))}

      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          Comentários (Opcional)
        </label>
        <textarea
          rows="4"
          value={comentarios}
          onChange={(e) => setComentarios(e.target.value)}
          className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg 
                   bg-white dark:bg-gray-800 text-gray-900 dark:text-white
                   focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
          placeholder="Adicione comentários relacionados ao trabalho apresentado"
        />
      </div>
    </div>
  );
};

export default FormularioBanner;
