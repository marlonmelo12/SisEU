import React from 'react';
import { FiMapPin, FiClock } from 'react-icons/fi';

const ApresentacaoCard = ({ apresentacao }) => {
  const evento = apresentacao.evento;
  const eventoTitulo = typeof evento === 'string' ? evento : evento?.titulo;
  const eventoLocal = typeof evento === 'object' ? evento?.local : null;
  const dataInicio = typeof evento === 'object' ? evento?.dataInicio : null;

  const formatarData = (data) => {
    if (!data) return '';
    const date = new Date(data);
    return date.toLocaleString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatarLocal = (local) => {
    if (!local) return '';
    const partes = [];
    if (local.cidade) partes.push(local.cidade);
    if (local.campus) partes.push(local.campus);
    if (local.bloco) partes.push(`Bloco ${local.bloco}`);
    if (local.sala) partes.push(local.sala);
    return partes.join(' - ');
  };

  return (
    <div className="bg-white rounded-lg shadow-md hover:shadow-xl transition-shadow duration-300 overflow-hidden">
      {/* Header com o nome do evento */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-800 text-white p-4">
        <h3 className="text-lg font-bold">{eventoTitulo}</h3>
        {/* Informações do evento */}
        <div className="mt-3 space-y-2 text-sm">
          {eventoLocal && (
            <div className="flex items-start gap-2">
              <FiMapPin size={16} className="flex-shrink-0 mt-0.5" />
              <span>{formatarLocal(eventoLocal)}</span>
            </div>
          )}
          {dataInicio && (
            <div className="flex items-center gap-2">
              <FiClock size={16} className="flex-shrink-0" />
              <span>{formatarData(dataInicio)}</span>
            </div>
          )}
        </div>
      </div>

      {/* Conteúdo principal */}
      <div className="p-6">
        {/* Título da apresentação */}
        <div className="mb-4">
          <h4 className="text-xl font-semibold text-gray-800 mb-2">
            {apresentacao.titulo}
          </h4>
        </div>

        {/* Informações do orientador */}
        <div className="border-l-4 border-green-500 pl-4">
          <p className="text-sm font-semibold text-gray-600 mb-1">Orientador</p>
          <p className="text-gray-800 font-medium">{apresentacao.orientador.nomeCompleto}</p>
          <p className="text-sm text-gray-500">{apresentacao.orientador.email}</p>
        </div>
      </div>
    </div>
  );
};

export default ApresentacaoCard;
