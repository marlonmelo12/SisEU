using SisEUs.Application.Apresentacoes.DTOs.Respostas;
using SisEUs.Application.Comum.DTOs;
using SisEUs.Application.Eventos.DTOs.Resposta;
using SisEUs.Domain.ContextoDeEvento.Entidades;
using SisEUs.Domain.ContextoDeUsuario.Interfaces;

namespace SisEUs.Application.Eventos.Mappers
{
    public static class EventoMapper
    {
        public static async Task<EventoResposta> ToResponseDtoAsync(
            this Evento evento,
            IUsuarioRepositorio usuarioRepositorio,
            CancellationToken cancellationToken)
        {
            var organizadoresDto = new List<ParticipanteResposta>();
            if (evento.ParticipantesIds.Count > 0)
            {
                var idsParticipantes = evento.ParticipantesIds.ToList();
                var usuarios = await usuarioRepositorio.ObterPorIdsAsync(idsParticipantes, cancellationToken);

                organizadoresDto = [.. usuarios.Select(u => new ParticipanteResposta
                (
                    Id: u.Id,
                    NomeCompleto: $"{u.Nome.Nome} {u.Nome.Sobrenome}"
                ))];
            }

            var avaliadoresNomes = new List<string>();
            if (evento.AvaliadoresIds.Count > 0)
            {
                var idsAvaliadores = evento.AvaliadoresIds.ToList();
                var usuariosAvaliadores = await usuarioRepositorio.ObterPorIdsAsync(idsAvaliadores, cancellationToken);

                avaliadoresNomes = [.. usuariosAvaliadores.Select(u => $"{u.Nome.Nome} {u.Nome.Sobrenome}")];
            }

            // Mapear apresentações
            var apresentacoesDto = new List<ApresentacaoResposta>();
            if (evento.Apresentacoes.Count > 0)
            {
                foreach (var apresentacao in evento.Apresentacoes)
                {
                    // Buscar autor e orientador
                    var autor = await usuarioRepositorio.ObterPorIdAsync(apresentacao.AutorId, cancellationToken);
                    var orientador = await usuarioRepositorio.ObterPorIdAsync(apresentacao.OrientadorId, cancellationToken);

                    var autorDto = autor != null 
                        ? new UsuarioResposta(autor.Id, $"{autor.Nome.Nome} {autor.Nome.Sobrenome}", autor.Cpf.Valor, autor.Email.Valor)
                        : new UsuarioResposta(0, "Autor não encontrado", "", "");

                    var orientadorDto = orientador != null 
                        ? new UsuarioResposta(orientador.Id, $"{orientador.Nome.Nome} {orientador.Nome.Sobrenome}", orientador.Cpf.Valor, orientador.Email.Valor)
                        : new UsuarioResposta(0, "Orientador não encontrado", "", "");

                    apresentacoesDto.Add(new ApresentacaoResposta(
                        apresentacao.Id,
                        null!,  // null para evitar referência circular
                        apresentacao.Titulo.Valor,
                        autorDto,
                        orientadorDto
                    ));
                }
            }

            return new EventoResposta(
                Id: evento.Id,
                Titulo: evento.Titulo.Valor,
                Local: new LocalResposta(
                    evento.Local.Campus,
                    evento.Local.Departamento,
                    evento.Local.Bloco,
                    evento.Local.Sala
                ),
                Localizacao: new LocalizacaoResposta(
                    evento.Localizacao.Latitude,
                    evento.Localizacao.Longitude
                ),
                DataInicio: evento.DataInicio,
                DataFim: evento.DataFim,
                Organizadores: organizadoresDto,
                Avaliadores: avaliadoresNomes,
                ETipoEvento: evento.TipoEvento.ToString(),
                EventType: evento.TipoEvento,
                ImgUrl: evento.ImgUrl,
                CodigoUnico: evento.CodigoUnico,
                NomeCampus: evento.Local.Campus,
                PinCheckin: evento.PinCheckin,
                Apresentacoes: apresentacoesDto
            );
        }

        public static EventoResposta ToResponseDto(this Evento evento, List<string> avaliadoresNomes)
        {
            var organizadoresDto = evento.ParticipantesIds
                .Select(id => new ParticipanteResposta(Id: id, NomeCompleto: ""))
                .ToList();

            return new EventoResposta(
                Id: evento.Id,
                Titulo: evento.Titulo.Valor,
                Local: new LocalResposta(
                    evento.Local.Campus,
                    evento.Local.Departamento,
                    evento.Local.Bloco,
                    evento.Local.Sala
                ),
                Localizacao: new LocalizacaoResposta(
                    evento.Localizacao.Latitude,
                    evento.Localizacao.Longitude
                ),
                DataInicio: evento.DataInicio,
                DataFim: evento.DataFim,
                Organizadores: organizadoresDto,
                Avaliadores: avaliadoresNomes,
                ETipoEvento: evento.TipoEvento.ToString(),
                EventType: evento.TipoEvento,
                ImgUrl: evento.ImgUrl,
                CodigoUnico: evento.CodigoUnico,
                NomeCampus: evento.Local.Campus,
                PinCheckin: evento.PinCheckin,
                Apresentacoes: []
            );
        }
    }
}