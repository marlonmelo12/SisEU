using Microsoft.Extensions.Logging;
using Microsoft.IdentityModel.Tokens;
using SisEUs.Domain.Comum.Token;
using SisEUs.Domain.ContextoDeUsuario.Entidades;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;

namespace SisEUs.Infrastructure.Token
{
    public class JwtTokenGenerator(uint expirationTimeMinutes, string signinKey, ILogger<JwtTokenGenerator> logger) : IAccessTokenGenerator
    {
        public string Generate(Usuario usuario)
        {
            logger.LogInformation("[TOKEN] Gerando token - UserId: {UserId}, EUserType: {UserType}", 
                usuario.Id, usuario.EUserType);

            var claims = new List<Claim>()
            {
                new(JwtRegisteredClaimNames.Sub, usuario.UserIdentifier.ToString()),
                new(ClaimTypes.Sid, usuario.UserIdentifier.ToString()),
                new(ClaimTypes.NameIdentifier, usuario.Id.ToString()),
                new(JwtRegisteredClaimNames.Jti, Guid.NewGuid().ToString()),
                new(JwtRegisteredClaimNames.Email, usuario.Email.Valor),
                new("http://schemas.microsoft.com/ws/2008/06/identity/claims/role", usuario.EUserType.ToString()),
                new("nome", usuario.Nome.ToString())
            };

            logger.LogInformation("[TOKEN] Claims adicionadas - Role: {Role}", 
                usuario.EUserType);

            var tokenDescriptor = new SecurityTokenDescriptor
            {
                Subject = new ClaimsIdentity(claims),
                Expires = DateTime.UtcNow.AddMinutes(expirationTimeMinutes),
                SigningCredentials = new SigningCredentials(new SymmetricSecurityKey(Encoding.UTF8.GetBytes(signinKey)), SecurityAlgorithms.HmacSha256Signature)
            };

            var tokenHandler = new JwtSecurityTokenHandler();
            var securityToken = tokenHandler.CreateToken(tokenDescriptor);
            return tokenHandler.WriteToken(securityToken);
        }
    }
}