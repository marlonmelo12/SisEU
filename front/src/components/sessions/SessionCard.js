// src/components/sessions/SessionCard.js
import React from 'react';
import PropTypes from 'prop-types';
import Card from '../ui/Card';
import Badge from '../ui/Badge';
import Button from '../ui/Button';
import { FiCalendar, FiMapPin, FiClock, FiUsers, FiEdit2, FiTrash2, FiMaximize2, FiKey } from 'react-icons/fi';
import { SESSION_STATUS, SESSION_STATUS_LABELS, BADGE_VARIANTS } from '../../constants';
import { formatDate } from '../../utils/formatters';
import bannerEUs from '../../Imagens/bannerEUs.png';

/**
 * Card de Sessão reutilizável com suporte a QR Code e PIN
 */
const SessionCard = ({ sessao, onClick, onEdit, onDelete, onShowQRCode, isEventoPassado = false }) => {
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

  const pinExibicao = sessao.pin || sessao.codigoPin || sessao.codigoUnico;

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

        {/* PIN Badge se existir */}
        {pinExibicao && (
          <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-primary-50 dark:bg-primary-900/40 text-primary-700 dark:text-primary-300 text-xs font-mono font-bold">
            <FiKey size={12} />
            <span>PIN: {pinExibicao}</span>
          </div>
        )}

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

        {/* Botões de ação */}
        <div className="pt-3 border-t border-gray-200 dark:border-gray-700 flex flex-col gap-2">
          {onShowQRCode && (
            <Button
              variant="secondary"
              size="sm"
              onClick={(e) => {
                e.stopPropagation();
                onShowQRCode(sessao);
              }}
              className="w-full flex items-center justify-center gap-1.5 font-semibold"
            >
              <FiMaximize2 size={14} />
              QR Code
            </Button>
          )}

          {(onEdit || onDelete) && (
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
          )}
        </div>
      </div>
    </Card>
  );
};

SessionCard.propTypes = {
  sessao: PropTypes.object.isRequired,
  onClick: PropTypes.func,
  onEdit: PropTypes.func,
  onDelete: PropTypes.func,
  onShowQRCode: PropTypes.func,
  isEventoPassado: PropTypes.bool,
};

export default SessionCard;
