using Microsoft.EntityFrameworkCore;
using SisEUs.Domain.Comum.LoggedUser;
using SisEUs.Domain.Comum.Token;
using SisEUs.Domain.ContextoDeUsuario.Entidades;
using SisEUs.Infrastructure.Repositorios;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;

namespace SisEUs.Infrastructure.LoggedUser
{
    public class LoggedUser(AppDbContext context, ITokenProvider tokenProvider) : ILoggedUser
    {
        public async Task<Usuario> User()
        {
            var token = tokenProvider.Value();

            var tokenHandler = new JwtSecurityTokenHandler();

            var jwtSecurityToken = tokenHandler.ReadJwtToken(token);

            // Procurar pela claim Sid em suas variações possíveis
            var sidClaim = jwtSecurityToken.Claims.FirstOrDefault(c => c.Type == ClaimTypes.Sid) ??
                           jwtSecurityToken.Claims.FirstOrDefault(c => c.Type == "http://schemas.xmlsoap.org/ws/2005/05/identity/claims/sid") ??
                           jwtSecurityToken.Claims.FirstOrDefault(c => c.Type == "sid");
            
            if (sidClaim == null)
            {
                // Se ainda não encontrou, tente usar o Sub claim como fallback
                var subClaim = jwtSecurityToken.Claims.FirstOrDefault(c => c.Type == JwtRegisteredClaimNames.Sub);
                if (subClaim == null)
                    throw new InvalidOperationException("Token não contém claim de identificação (Sid ou Sub).");
                sidClaim = subClaim;
            }

            var identifier = sidClaim.Value;

            var userIdentifier = Guid.Parse(identifier);

            var user = await context
                .Usuarios
                .AsNoTracking()
                .FirstOrDefaultAsync(u => u.UserIdentifier == userIdentifier);

            if (user == null)
                throw new InvalidOperationException($"Usuário com identificador {userIdentifier} não encontrado no banco de dados.");

            return user;
        }
    }
}
