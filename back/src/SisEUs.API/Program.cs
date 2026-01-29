using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using Microsoft.OpenApi.Models;
using SisEUs.API.Token;
using SisEUs.Application.Comum.Configuracoes;
using SisEUs.Domain.Comum.Token;
using SisEUs.Infrastructure;
using SisEUs.Infrastructure.Migracao;
using SisEUs.Infrastructure.Repositorios;
using System.Security.Claims;
using System.Text;

var builder = WebApplication.CreateBuilder(args);
var configuration = builder.Configuration;

var jwtSigningKey = configuration["Settings:Jwt:SigningKey"];

if (string.IsNullOrEmpty(jwtSigningKey))
{
    throw new InvalidOperationException(
        "A chave de assinatura (Settings:Jwt:SigningKey) não foi configurada em appsettings.json."
    );
}

// Configuração de Geolocalização
builder.Services.Configure<GeolocalizacaoConfig>(
    configuration.GetSection(GeolocalizacaoConfig.SectionName)
);

// JWT
builder.Services.AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
    .AddJwtBearer(options =>
    {
        options.TokenValidationParameters = new TokenValidationParameters
        {
            ValidateIssuerSigningKey = true,
            IssuerSigningKey =
                new SymmetricSecurityKey(Encoding.UTF8.GetBytes(jwtSigningKey)),

            ValidateIssuer = false,
            ValidIssuer = configuration["Settings:Jwt:Issuer"],

            ValidateAudience = false,
            ValidAudience = configuration["Settings:Jwt:Audience"],

            ValidateLifetime = true,
            ClockSkew = TimeSpan.FromMinutes(5),
            
            NameClaimType = ClaimTypes.NameIdentifier
        };
    });

// JSON
builder.Services.Configure<Microsoft.AspNetCore.Mvc.JsonOptions>(options =>
{
    options.JsonSerializerOptions.NumberHandling =
        System.Text.Json.Serialization.JsonNumberHandling.AllowReadingFromString;
});

builder.Services.AddControllers();
builder.Services.AddEndpointsApiExplorer();

// Infra
builder.Services.AddInfrastructure(builder.Configuration);

// CORS
builder.Services.AddCors(options =>
{
    options.AddPolicy("CorsPolicyDevelopment", policyBuilder =>
    {
        policyBuilder.AllowAnyOrigin()
                     .AllowAnyMethod()
                     .AllowAnyHeader();
    });

    options.AddPolicy("CorsPolicyProduction", policyBuilder =>
    {
        policyBuilder.WithOrigins("http://localhost:3000")
                     .WithMethods("GET", "POST", "PUT", "DELETE")
                     .AllowAnyHeader();
    });
});

// Swagger
builder.Services.AddSwaggerGen(options =>
{
    options.SwaggerDoc("v1", new OpenApiInfo
    {
        Title = "SisEUs API",
        Version = "v1",
        Description = "API para gerenciamento de eventos acadêmicos, presenças e avaliações",
        Contact = new OpenApiContact
        {
            Name = "SisEUs Team"
        }
    });

    options.AddSecurityDefinition("Bearer", new OpenApiSecurityScheme
    {
        Description = @"JWT Authorization header using Bearer scheme.
Insira 'Bearer' [espaço] e então seu token na caixa de texto abaixo.
Exemplo: 'Bearer 12345abcdef'",
        Name = "Authorization",
        In = ParameterLocation.Header,
        Type = SecuritySchemeType.ApiKey,
        Scheme = "Bearer"
    });

    options.AddSecurityRequirement(new OpenApiSecurityRequirement
    {
        {
            new OpenApiSecurityScheme
            {
                Reference = new OpenApiReference
                {
                    Type = ReferenceType.SecurityScheme,
                    Id = "Bearer"
                }
            },
            new List<string>()
        }
    });

    var xmlFile = $"{System.Reflection.Assembly.GetExecutingAssembly().GetName().Name}.xml";
    var xmlPath = Path.Combine(AppContext.BaseDirectory, xmlFile);
    if (File.Exists(xmlPath))
    {
        options.IncludeXmlComments(xmlPath);
    }

    options.TagActionsBy(api =>
        new[] { api.GroupName ?? api.ActionDescriptor.RouteValues["controller"] }
    );
    options.DocInclusionPredicate((_, __) => true);
});

builder.Services.AddScoped<ITokenProvider, HttpContextTokenValue>();
builder.Services.AddHttpContextAccessor();

var app = builder.Build();

// Aguardar o banco de dados estar pronto e executar migrations
using (var scope = app.Services.CreateScope())
{
    var services = scope.ServiceProvider;
    var logger = services.GetRequiredService<ILogger<Program>>();
    var context = services.GetRequiredService<AppDbContext>();
    
    var tentativas = 0;
    var maxTentativas = 30;
    var delay = TimeSpan.FromSeconds(2);
    
    while (tentativas < maxTentativas)
    {
        try
        {
            logger.LogInformation("Tentando conectar ao banco de dados... (Tentativa {Tentativas}/{MaxTentativas})", tentativas + 1, maxTentativas);
            
            // Tenta conectar e executar migrations
            context.Database.Migrate();
            logger.LogInformation("Migrations executadas com sucesso!");
            
            // Executar seed de dados iniciais
            await InitBD.SeedAsync(context);
            logger.LogInformation("Seed de dados executado com sucesso!");
            
            break;
        }
        catch (Exception ex)
        {
            tentativas++;
            
            if (tentativas >= maxTentativas)
            {
                logger.LogError(ex, "Falha ao conectar ao banco de dados após {MaxTentativas} tentativas.", maxTentativas);
                throw;
            }
            
            logger.LogWarning(ex, "Erro ao conectar ao banco de dados. Tentando novamente em {Delay} segundos...", delay.TotalSeconds);
            await Task.Delay(delay);
        }
    }
}

// CORS deve vir antes do Routing
if (app.Environment.IsDevelopment())
{
    app.UseCors("CorsPolicyDevelopment");
}
else
{
    app.UseCors("CorsPolicyProduction");
}

// Ambiente
if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

app.UseRouting();
app.UseAuthentication();
app.UseAuthorization();

app.MapControllers();
app.Run();
