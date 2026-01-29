// src/components/sessions/SessionCard.js
import React from 'react';
import PropTypes from 'prop-types';
import Card from '../ui/Card';
import Badge from '../ui/Badge';
import Button from '../ui/Button';
import { FiCalendar, FiMapPin, FiClock, FiUsers, FiEdit2, FiTrash2 } from 'react-icons/fi';
import { SESSION_STATUS, SESSION_STATUS_LABELS, BADGE_VARIANTS } from '../../constants';
import { formatDate } from '../../utils/formatters';
import bannerEUs from '../../Imagens/bannerEUs.png';

/**
 * Card de Sessão reutilizável
 */
const SessionCard = ({ sessao, onClick, onEdit, onDelete, isEventoPassado = false }) => {
  const getStatusVariant = (status) => {
    const variants = {
      [SESSION_STATUS.ATIVA]: BADGE_VARIANTS.SUCCESS,
      [SESSION_STATUS.ENCERRADA]: BADGE_VARIANTS.DEFAULT,
      [SESSION_STATUS.AGUARDANDO]: BADGE_VARIANTS.WARNING,
    };
    return variants[status] || BADGE_VARIANTS.DEFAULT;
  };

  const getStatusLabel = (status) => {
    return SESSION_STATUS_LABELS[status] || status;
  };

  return (
    <Card
      image={bannerEUs}
      hoverable
      onClick={onClick}
      className="h-full"
    >
      <div className="space-y-3">
        {/* Título e Status */}
        <div className="flex items-start justify-between gap-2">
          <h3 className="text-lg font-bold text-gray-900 dark:text-white flex-1">
            {sessao.titulo}
          </h3>
          <Badge variant={getStatusVariant(sessao.status)}>
            {getStatusLabel(sessao.status)}
          </Badge>
        </div>

        {/* Informações */}
        <div className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
          <div className="flex items-center gap-2">
            <FiMapPin size={16} className="flex-shrink-0" />
            <span>
              {typeof sessao.local === 'object' 
                ? `${sessao.local.sala || ''}, ${sessao.local.bloco || ''} - ${sessao.local.departamento || ''}, ${sessao.local.campus || ''}`.trim()
                : sessao.local}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <FiCalendar size={16} className="flex-shrink-0" />
            <span>{sessao.data ? formatDate(sessao.data) : '-'}</span>
          </div>

          <div className="flex items-center gap-2">
            <FiClock size={16} className="flex-shrink-0" />
            <span>
              {sessao.horarioInicio || '-'} - {sessao.horarioFim || '-'}
            </span>
          </div>

          {sessao.apresentacoes && sessao.apresentacoes.length > 0 && (
            <div className="flex items-center gap-2">
              <FiUsers size={16} className="flex-shrink-0" />
              <span>{sessao.apresentacoes.length} apresentações</span>
            </div>
          )}
        </div>

        {/* Organizadores */}
        {sessao.organizadores && sessao.organizadores.length > 0 && (
          <div className="pt-2 border-t border-gray-200 dark:border-gray-700">
            <p className="text-xs text-gray-500 dark:text-gray-500 mb-1">
              Organizadores:
            </p>
            <div className="flex flex-wrap gap-1">
              {sessao.organizadores.map((org, index) => (
                <Badge key={index} variant="default" size="sm">
                  {org.nome}
                </Badge>
              ))}
            </div>
          </div>
        )}

        {/* Botões de ação (apenas se onEdit ou onDelete for fornecido) */}
        {(onEdit || onDelete) && (
          <div className="pt-3 border-t border-gray-200 dark:border-gray-700">
            <div className="grid grid-cols-2 gap-2">
              {onEdit && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={(e) => {
                    e.stopPropagation();
                    onEdit(sessao);
                  }}
                  disabled={isEventoPassado}
                  title={isEventoPassado ? "Não é possível editar eventos passados" : ""}
                  className="flex items-center justify-center gap-1"
                >
                  <FiEdit2 size={14} />
                  Editar
                </Button>
              )}
              {onDelete && (
                <Button
                  variant="danger"
                  size="sm"
                  onClick={(e) => {
                    e.stopPropagation();
                    onDelete(sessao);
                  }}
                  disabled={isEventoPassado}
                  title={isEventoPassado ? "Não é possível excluir eventos passados" : ""}
                  className="flex items-center justify-center gap-1"
                >
                  <FiTrash2 size={14} />
                  Excluir
                </Button>
              )}
            </div>
          </div>
        )}
      </div>
    </Card>
  );
};

SessionCard.propTypes = {
  sessao: PropTypes.shape({
    id: PropTypes.number,
    titulo: PropTypes.string.isRequired,
    status: PropTypes.string.isRequired,
    local: PropTypes.string.isRequired,
    data: PropTypes.string.isRequired,
    horarioInicio: PropTypes.string.isRequired,
    horarioFim: PropTypes.string.isRequired,
    imagemUrl: PropTypes.string,
    apresentacoes: PropTypes.array,
    organizadores: PropTypes.arrayOf(
      PropTypes.shape({
        nome: PropTypes.string,
      })
    ),
  }).isRequired,
  onClick: PropTypes.func,
  onEdit: PropTypes.func,
  onDelete: PropTypes.func,
};

export default SessionCard;
