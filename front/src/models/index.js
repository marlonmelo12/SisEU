/**
 * @typedef {Object} Usuario
 * @property {string} id
 * @property {string} cpf
 * @property {string} nome
 * @property {string} email
 * @property {'ESTUDANTE' | 'AVALIADOR' | 'ADMINISTRADOR'} tipoUsuario
 * @property {string} token
 */

/**
 * @typedef {Object} Sessao
 * @property {string} id
 * @property {string} titulo
 * @property {string} local
 * @property {string} data
 * @property {string} horarioInicio
 * @property {string} horarioFim
 * @property {string} eventoId
 * @property {string} imagemUrl
 * @property {Organizador[]} organizadores
 * @property {Avaliador[]} avaliadores
 * @property {Apresentacao[]} apresentacoes
 * @property {'ATIVA' | 'ENCERRADA' | 'AGUARDANDO'} status
 */

/**
 * @typedef {Object} Apresentacao
 * @property {string} id
 * @property {string} titulo
 * @property {string} autor
 * @property {string} orientador
 * @property {string} sessaoId
 * @property {string} eventoId
 * @property {'INICIADA' | 'FINALIZADA' | 'EM_ABERTO'} status
 * @property {number} nota
 * @property {string} parecer
 */

/**
 * @typedef {Object} Checkin
 * @property {string} id
 * @property {string} usuarioId
 * @property {string} eventoId
 * @property {string} sessaoId
 * @property {string} pin
 * @property {number} latitude
 * @property {number} longitude
 * @property {Date} dataHoraCheckin
 * @property {Date} dataHoraCheckout
 * @property {'OUVINTE' | 'APRESENTADOR'} tipoParticipacao
 * @property {boolean} completo
 */

/**
 * @typedef {Object} Avaliacao
 * @property {string} id
 * @property {string} apresentacaoId
 * @property {string} avaliadorId
 * @property {number} nota
 * @property {string} parecer
 * @property {'INICIADA' | 'FINALIZADA' | 'EM_ABERTO'} status
 * @property {Date} dataHora
 */

/**
 * @typedef {Object} Organizador
 * @property {string} id
 * @property {string} nome
 * @property {string} email
 */

/**
 * @typedef {Object} Avaliador
 * @property {string} id
 * @property {string} nome
 * @property {string} email
 */

/**
 * @typedef {Object} Evento
 * @property {string} id
 * @property {string} nome
 * @property {string} descricao
 * @property {string} local
 * @property {number} latitude
 * @property {number} longitude
 * @property {number} raioMetros
 * @property {Date} dataInicio
 * @property {Date} dataFim
 */

/**
 * @typedef {Object} RelatorioPresenca
 * @property {string} usuarioId
 * @property {string} nomeUsuario
 * @property {string} cpf
 * @property {string} sessaoTitulo
 * @property {Date} dataHoraCheckin
 * @property {Date} dataHoraCheckout
 * @property {boolean} presencaCompleta
 */

export {};
