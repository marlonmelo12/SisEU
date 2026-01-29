using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.Filters;
using SisEUs.Domain.ContextoDeUsuario.Enumeracoes;
using System.Security.Claims;

namespace SisEUs.API.Filter
{
    public class AuthorizeRolesFilter : IAuthorizationFilter
    {
        private readonly ETipoUsuario[] _allowedRoles;

        public AuthorizeRolesFilter(ETipoUsuario[] allowedRoles)
        {
            _allowedRoles = allowedRoles ?? throw new ArgumentNullException(nameof(allowedRoles));
        }

        public void OnAuthorization(AuthorizationFilterContext context)
        {
            var logger = context.HttpContext.RequestServices.GetRequiredService<ILogger<AuthorizeRolesFilter>>();

            if (!context.HttpContext.User.Identity?.IsAuthenticated ?? true)
            {
                logger.LogWarning("[AUTH] Usuário não autenticado");
                context.Result = new UnauthorizedObjectResult(new 
                { 
                    erro = "Usu�rio n�o autenticado." 
                });
                return;
            }

            var allClaims = context.HttpContext.User.Claims.Select(c => $"{c.Type}={c.Value}").ToList();
            logger.LogInformation("[AUTH] Todas as claims: {Claims}", string.Join(", ", allClaims));

            // Log de debug - ver ClaimTypes.Role
            logger.LogInformation("[AUTH-DEBUG] ClaimTypes.Role = {ClaimTypesRole}", ClaimTypes.Role);

            // Buscar todas as claims de role (pode haver múltiplas)
            var roleClaims = context.HttpContext.User.FindAll(ClaimTypes.Role)
                .Concat(context.HttpContext.User.FindAll("role"))
                .Concat(context.HttpContext.User.FindAll("http://schemas.microsoft.com/ws/2008/06/identity/claims/role"))
                .ToList();

            logger.LogInformation("[AUTH] Roles encontradas: {Roles}, Roles permitidas: {AllowedRoles}", 
                string.Join(", ", roleClaims.Select(r => r.Value)), 
                string.Join(", ", _allowedRoles));

            if (!roleClaims.Any())
            {
                logger.LogWarning("[AUTH] Nenhuma role encontrada no token");
                context.Result = new ForbidResult();
                return;
            }

            // Verificar se alguma das roles do usuário está nas roles permitidas
            bool hasPermission = false;
            foreach (var roleClaim in roleClaims)
            {
                if (Enum.TryParse<ETipoUsuario>(roleClaim.Value, ignoreCase: true, out var userRole))
                {
                    logger.LogInformation("[AUTH] Role parseada: {UserRole}", userRole);
                    
                    if (_allowedRoles.Contains(userRole))
                    {
                        hasPermission = true;
                        logger.LogInformation("[AUTH] Autorização concedida para role: {UserRole}", userRole);
                        break;
                    }
                }
                else
                {
                    logger.LogWarning("[AUTH] Falha ao parsear role: {RoleValue}", roleClaim.Value);
                }
            }

            if (!hasPermission)
            {
                var userRoles = string.Join(", ", roleClaims.Select(r => r.Value));
                logger.LogWarning("[AUTH] Acesso negado - Roles do usuário ({UserRoles}) não estão nas roles permitidas: {AllowedRoles}", 
                    userRoles, 
                    string.Join(", ", _allowedRoles));
                    
                context.Result = new ObjectResult(new 
                { 
                    erro = "Acesso negado. Você não tem permissão para acessar este recurso.",
                    roleRequerida = string.Join(", ", _allowedRoles.Select(r => r.ToString())),
                    suasRoles = userRoles
                })
                {
                    StatusCode = StatusCodes.Status403Forbidden
                };
                return;
            }
        }
    }
}
