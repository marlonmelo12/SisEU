// src/components/avaliacoes/FormularioOral.js
import React from 'react';

const FormularioOral = ({ notas, setNotas, comentarios, setComentarios }) => {
  const campos = [
    {
      id: 'qualidadeTecnica',
      label: 'Qualidade Técnica',
      descricao: 'Profundidade e relevância científica do conteúdo'
    },
    {
      id: 'apresentacaoOral',
      label: 'Apresentação Oral',
      descricao: 'Clareza, postura e domínio do tema'
    },
    {
      id: 'arguicao',
      label: 'Arguição',
      descricao: 'Capacidade de responder as perguntas da banca'
    }
  ];

  return (
    <div className="space-y-4">
      <div className="mb-4">
        <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
          Tipo de Apresentação: <span className="font-bold">Oral</span>
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

export default FormularioOral;
