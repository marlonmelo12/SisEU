# SisEUs - Sistema de Gestão dos Encontros Universitários

O **SisEUs** é uma aplicação web focada em otimizar a logística dos Encontros Universitários da UFC. Evento cujo principal objetivo é divulgar trabalhos desenvolvidos na universidade em parceria com diversos setores da sociedade. 

Devido ao grande fluxo de pessoas e à complexidade das atividades antes, durante e após o evento, o sistema procura permitir o registro da presença dos participantes, além de possibilitar a avaliação dos trabalhos submetidos.

## O que o sistema faz?

### Registro de Presença (Geolocalização)
Otimiza o controle de entrada e saída dos participantes através de um sistema de Check-in e Check-out por geolocalização, garantindo que a presença seja validada apenas para quem está fisicamente no local do evento.

### Avaliação Técnica
Digitaliza a avaliação dos trabalhos apresentados seguindo o estabelecido no Edtial EU2025. O sistema adapta os formulários de acordo com a modalidade (Oral, Pôster, Pitch, etc.), facilitando o trabalho do avaliador.

### Gerenciamento e Relatórios
Centraliza a criação de sessões e a geração de relatórios consolidados. Esses dados são essenciais para:
- Computar horas de participação;
- Processar as notas dos trabalhos;
- Apoiar a administração na apuração de resultados e premiações.

## Tecnologias e Dependências
### Front-end
- React JS
- Axios
- Leaflet e React-Leaflet
  
### Back-end
- .NET (C#) rodando em ambiente ASP.NET Core e utilizando DDD, Domínio Rico para lógica de negócio e Result Pattern para respostas da API.
- MySQL 8.0 (Pomelo Entity Framework).
- Onion/Clean Architecture (API, Application, Domain, Infrastructure)
  
### Protipação
- Figma [Link](https://www.figma.com/design/rrPVA2S0Vlr7hET6QqMR9x/SisEUs?node-id=749-2065&t=1NAs0syUvk6toLbe-1)
  
### Testes
- qase.io
- Documento de Testes [Link](https://docs.google.com/document/d/1Nz_5KLoDvppHalcz9GV0edcVHRbZAxQFMadGa4T7zC4/edit?usp=sharing)
  
### Conteinerização 
- Docker e Docker Compose

# Instruções de Instalação e Execução

1. Certifique-se de ter o Docker instalado em sua máquina.
2. Clone o repositório e acesse a pasta raiz do projeto.
3. Execute o comando de subida: `docker-compose up -d`
4. O Docker irá baixar as imagens e configurar os três containers:
   
   - Frontend (React): acessível em http://localhost:80
   - Backend API (.NET): acessível em http://localhost:8080
   - Banco de Dados (MySQL): rodando na porta 3306
     
# Ambiente de Desenvolvimento

## Back-end
1. Certifique-se de ter o SDK do .NET 8.0 instalado.
2. Acesse a pasta do backend: `cd back`
3. Configure a string de conexão com o seu banco MySQL local no arquivo `appsettings.Development.json`.
4. Execute o projeto: `dotnet run`

## Front-end
1. Certifique-se de ter o Node.js instalado.
2. Acesse a pasta do frontend: `cd front`
3. Instale as dependências: `npm install`
4. Inicie a aplicação: `npm start`
5. O front abrirá na porta padrão do react, disponível em http://localhost:3000

# Estrutura do Projeto
O sistema foi desenvolvido seguindo padrões de mercado para garantir escalabilidade e manutenibilidade. A estrutura é dividida em dois arquivos (Front e Back) orquestrados pelo Docker.

## Back-end 
```text
back/src/
├── SisEUs.Domain/             # Contém as regras de negócio puras, sem dependências de frameworks externos.
├── SSisEUs.Apresentation/     # Orquestra os casos de uso da aplicacao     
├── SisEUs.Infrastructure/     # Implementações de persistência e serviços externos.
└── SisEUs.API/                # Exposição de endpoints REST.
```
## Front-end
```text
front/seu/src
├── api/            # Configuração do cliente HTTP
├── componentes/    # reutilizáveis 
├── context/        # Gerenciamento de estado
├── features/       # modules de negócio
├── hooks/          # Lógica isolada e reutilizável
├── imagens/        # estáticos e logotipos
├── pages/          # As telas da aplicação 
└── servicee/       # Chamadas aos endpoints da API
```
# Alinhamento com as Disicplinas

## Auditoria e Segurança de Sistemas de Informação

- Uso de geolocalização como prova de presença e log de auditoria, impedindo fraudes e garantindo a autenticidade da frequência.

- A herança na classe Usuário isola permissões, garantindo que cada ator (Avaliador, Estudante, Admin) acesse apenas suas funções específicas.

## Pesquisa Operacional 

- Conversão dos baremas do Edital EU2025 em dados quantificáveis e automação de médias para auxílio na premiação acadêmica.

- Pode aplicar PO para determinar o raio ideal de check-in com base na densidade de usuários e na precisão do sinal GPS no local do evento, minimizando falsos negativos.
  
# Equipe
Este projeto foi realizado como atividade para a disciplinha "Projeto Integrador IV", orientado pelo professor Bruno Riccelli. Alunos envolvidos:
- Gabriel Correia Melo
- Marlon Melo Moura
- Maria Fernanda Ferreira Paulino
- Josue Alexandre de Araujo
- Gustavo Abreu Prudencio
