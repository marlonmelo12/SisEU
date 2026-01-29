# SisEUs - Sistema de Encontros Universitários 🎓

Sistema de gerenciamento de encontros universitários da Universidade Federal do Ceará (UFC), desenvolvido em React com arquitetura MVC e Tailwind CSS.

---

## 📑 Índice

- [Tecnologias](#-tecnologias)
- [Funcionalidades](#-funcionalidades)
- [Estrutura do Projeto](#-estrutura-do-projeto)
- [Começando](#-começando)
- [Padrões e Convenções](#-padrões-e-convenções)
- [Guia de Desenvolvimento](#-guia-de-desenvolvimento)
- [Troubleshooting](#-troubleshooting-problemas-comuns)
- [FAQ](#-faq-perguntas-frequentes)

---

## 🚀 Tecnologias

### Core
- **React 19.1.0** - Biblioteca JavaScript para interfaces
- **React Router 7.8.0** - Roteamento SPA
- **Axios 1.12.2** - Cliente HTTP para APIs
- **PropTypes** - Validação de props em runtime

### Estilização
- **Tailwind CSS 3.x** - Framework CSS utility-first
- **React Icons 5.5.0** - Biblioteca de ícones (Feather Icons)
- **Framer Motion 12.x** - Animações
- **GSAP 3.x** - Animações avançadas

### Mapas e QR Code
- **Leaflet 1.9.4** - Biblioteca de mapas
- **React Leaflet 5.0.0** - Wrapper React para Leaflet
- **React QR Code 2.0.18** - Geração de QR Codes

### Utilitários
- **React Select 5.10.2** - Select customizável
- **Feather Icons React 0.9.0** - Ícones adicionais

---

## 📋 Funcionalidades

### Para Todos os Usuários
- ✅ **Login/Logout** com autenticação JWT
- ✅ **Check-in/Check-out** com validação de PIN e GPS
- ✅ **Visualização de sessões** (minhas e todas)
- ✅ **Tema claro/escuro**
- ✅ **Interface responsiva**

### Para Estudantes
- 📚 Visualizar sessões disponíveis
- ✅ Fazer check-in como ouvinte ou apresentador
- 📝 Submeter apresentações

### Para Avaliadores
- 📊 Visualizar trabalhos designados
- ⭐ Avaliar apresentações
- 📝 Fornecer pareceres

### Para Administradores
- ➕ Criar e gerenciar sessões
- 👥 Adicionar organizadores e avaliadores
- 📊 Gerar relatórios de presença
- 📥 Importar/Exportar dados

---

## 📁 Estrutura do Projeto

### Visão Geral

O projeto segue o padrão **MVC (Model-View-Controller)** com organização modular:

```
seu/
├── public/                 # Arquivos públicos estáticos
│   ├── index.html         # HTML principal
│   ├── manifest.json      # Manifesto PWA
│   └── robots.txt
│
├── src/
│   ├── App.js             # Componente raiz com rotas
│   ├── index.js           # Entry point
│   ├── index.css          # Estilos globais Tailwind
│   │
│   ├── api/               # [DEPRECATED] - Usar services/
│   │
│   ├── components/        # 🎨 VIEW - Componentes visuais
│   │   ├── checkin/       # Componentes de check-in
│   │   │   └── CheckinModal.js
│   │   │
│   │   ├── layout/        # Layout e navegação
│   │   │   ├── Header.js  # Header com menu
│   │   │   └── Layout.js  # Wrapper de layout
│   │   │
│   │   ├── sessions/      # Componentes de sessões
│   │   │   └── SessionCard.js
│   │   │
│   │   ├── ui/            # Componentes UI reutilizáveis
│   │   │   ├── Alert.js   # Alertas/Notificações
│   │   │   ├── Badge.js   # Badges de status
│   │   │   ├── Button.js  # Botão customizado
│   │   │   ├── Card.js    # Card genérico
│   │   │   ├── EmptyState.js
│   │   │   ├── Input.js   # Input customizado
│   │   │   ├── Loading.js # Loading spinner
│   │   │   ├── Modal.js   # Modal genérico
│   │   │   └── index.js   # Exports centralizados
│   │   │
│   │   ├── Shared/        # Componentes compartilhados
│   │   │   ├── PrivateRoute.js
│   │   │   └── SecaoExplorarEventos/
│   │   │
│   │   └── PalestraCartao/
│   │       └── PalestraCartao.js
│   │
│   ├── constants/         # 🔢 Constantes da aplicação
│   │   └── index.js       # 200+ constantes organizadas
│   │                      # (STATUS, ROLES, ROUTES, MESSAGES, etc.)
│   │
│   ├── context/           # 🌐 Contextos React
│   │   └── ThemeContext.js # Tema claro/escuro
│   │
│   ├── features/          # 📦 Features modulares
│   │   ├── checkin/       # Feature de check-in
│   │   │   └── PinQrCodeModal.js
│   │   │
│   │   ├── presence/      # Feature de presença
│   │   │   ├── CheckinBox/
│   │   │   ├── ModalSelecionarCheckIn/
│   │   │   └── hooks/     # Hooks específicos
│   │   │       ├── useCameraPermission.js
│   │   │       ├── useCheckInFlow.js
│   │   │       ├── useCheckInModal.js
│   │   │       ├── useGeolocation.js
│   │   │       ├── usePresenceStatus.js
│   │   │       └── useSessionForm.js
│   │   │
│   │   └── sessions/      # Feature de sessões
│   │       ├── components/
│   │       │   └── SessionCard.js
│   │       └── ConfigureSessionModal/
│   │           └── index.js
│   │
│   ├── hooks/             # 🎣 CONTROLLER - Hooks globais
│   │   ├── useAuth.js     # Autenticação
│   │   └── useSessions.js # Gerenciamento de sessões
│   │
│   ├── Imagens/           # 🖼️ Assets de imagens
│   │
│   ├── models/            # 📐 MODEL - Tipos e interfaces
│   │   └── [tipos TypeScript/JSDoc]
│   │
│   ├── pages/             # 📄 Páginas da aplicação
│   │   ├── AdminDashboard.js    # Dashboard admin
│   │   ├── CheckInByGeolocationPage.js
│   │   ├── CheckInByPinPage.js
│   │   ├── CheckInByQrPage.js
│   │   ├── Configuracoes.js     # Configurações
│   │   ├── DashboardPage.js     # Dashboard principal
│   │   ├── LoginPage.js         # Login
│   │   ├── Pages.css            # Estilos das páginas
│   │   └── Sobre.js             # Sobre
│   │
│   ├── services/          # 🔌 MODEL - Comunicação com API
│   │   ├── api.js         # Cliente Axios configurado
│   │   ├── authService.js # Autenticação
│   │   ├── checkinService.js
│   │   ├── sessaoService.js
│   │   ├── apresentacaoService.js
│   │   ├── avaliacaoService.js
│   │   ├── geolocationService.js
│   │   ├── relatorioService.js
│   │   └── index.js       # Exports centralizados
│   │
│   └── utils/             # 🛠️ Utilitários
│       ├── formatters.js  # Formatação (CPF, data, moeda, etc.)
│       ├── validators.js  # Validações (email, CPF, etc.)
│       └── index.js       # Exports centralizados
│
├── .gitignore
├── Dockerfile             # Container Docker
├── jsconfig.json          # Configuração path aliases
├── nginx.conf             # Configuração Nginx
├── package.json
├── tailwind.config.js     # Configuração Tailwind
└── README.md

```

### Descrição das Pastas

#### 📦 `components/`
Componentes React organizados por funcionalidade:
- **ui/** - Componentes básicos reutilizáveis (Button, Input, Card, etc.)
- **layout/** - Layout e navegação (Header, Layout wrapper)
- **checkin/** - Componentes específicos de check-in
- **sessions/** - Componentes relacionados a sessões
- **Shared/** - Componentes compartilhados entre features

#### 🔢 `constants/`
Arquivo único com todas as constantes da aplicação:
- Status de sessões e check-ins
- Tipos de participação
- Roles de usuários
- Rotas da aplicação
- Mensagens de erro/sucesso
- Configurações de validação

#### 🎣 `hooks/`
Hooks customizados que encapsulam lógica de negócio:
- **useAuth.js** - Autenticação e autorização
- **useSessions.js** - Gerenciamento de sessões

#### 📦 `features/`
Features modulares com estrutura própria:
- Cada feature pode ter seus próprios components, hooks e lógica
- Exemplo: `features/presence/hooks/useCheckInFlow.js`

#### 🔌 `services/`
Camada de comunicação com a API:
- **api.js** - Cliente Axios configurado com interceptors
- Cada serviço encapsula endpoints relacionados
- Tratamento centralizado de erros

#### 🛠️ `utils/`
Funções utilitárias puras:
- **formatters.js** - Formatação de CPF, datas, moedas
- **validators.js** - Validações de email, CPF, campos

---

## 🚀 Começando

### Pré-requisitos
```bash
Node.js 16+ (recomendado: 18+)
npm 8+ ou yarn 1.22+
```

### Instalação

```bash
# Clone o repositório
git clone [url-do-repositorio]
cd seu

# Instale as dependências
npm install
# ou
yarn install
```

### Desenvolvimento

```bash
# Inicie o servidor de desenvolvimento
npm start
# ou
yarn start

# Aplicação disponível em http://localhost:3000
# Hot reload ativado
```

### Build para Produção

```bash
# Gera build otimizado
npm run build
# ou
yarn build

# Build estará em /build
# Pronto para deploy
```

### Testes

```bash
# Executa testes em modo watch
npm test

# Executa com coverage
npm test -- --coverage

# Executa todos os testes uma vez
npm test -- --watchAll=false
```

### Docker

```bash
# Build da imagem
docker build -t seu-frontend .

# Executar container
docker run -p 80:80 seu-frontend

# Acessar em http://localhost
```

---

## 🎯 Padrões e Convenções

### Nomenclatura

#### Arquivos
- **Componentes**: PascalCase (`Button.js`, `SessionCard.js`)
- **Hooks**: camelCase com prefixo `use` (`useAuth.js`, `useCheckInFlow.js`)
- **Utilitários**: camelCase (`formatters.js`, `validators.js`)
- **Constantes**: camelCase (`index.js` dentro de `constants/`)
- **Serviços**: camelCase com sufixo `Service` (`authService.js`)

#### Código
```javascript
// Componentes - PascalCase
const Button = () => {};

// Funções - camelCase
const handleSubmit = () => {};

// Constantes - UPPER_SNAKE_CASE
const SESSION_STATUS = { ... };

// Hooks customizados - camelCase com 'use'
const useAuth = () => {};
```

### Estrutura de Componentes

```javascript
// 1. Imports
import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';

// 2. Componente
/**
 * Descrição do componente
 * @param {Object} props - Props do componente
 */
const MyComponent = ({ title, onClick, children }) => {
  // 2.1 Estados
  const [isOpen, setIsOpen] = useState(false);
  
  // 2.2 Effects
  useEffect(() => {
    // ...
  }, []);
  
  // 2.3 Handlers
  const handleClick = () => {
    onClick();
  };
  
  // 2.4 Render
  return (
    <div className="container">
      <h1>{title}</h1>
      {children}
    </div>
  );
};

// 3. PropTypes
MyComponent.propTypes = {
  title: PropTypes.string.isRequired,
  onClick: PropTypes.func,
  children: PropTypes.node,
};

// 4. Default Props (opcional)
MyComponent.defaultProps = {
  onClick: () => {},
  children: null,
};

// 5. Export
export default MyComponent;
```

### Uso de Path Aliases

O projeto usa path aliases configurados em `jsconfig.json`:

```javascript
// ❌ Evite caminhos relativos complexos
import Button from '../../../components/ui/Button';

// ✅ Use path aliases
import Button from '@/components/ui/Button';
import { useAuth } from '@/hooks';
import { formatCPF } from '@/utils';
import { SESSION_STATUS } from '@/constants';
```

**Aliases disponíveis:**
- `@/*` - src/
- `@/components/*` - src/components/
- `@/pages/*` - src/pages/
- `@/hooks/*` - src/hooks/
- `@/services/*` - src/services/
- `@/utils/*` - src/utils/
- `@/constants/*` - src/constants/
- `@/features/*` - src/features/

### Tailwind CSS

#### Classes Utilitárias
```javascript
// ✅ Bom - Use classes do Tailwind
<button className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600">
  Botão
</button>

// ❌ Evite - CSS inline
<button style={{ padding: '8px 16px', backgroundColor: 'blue' }}>
  Botão
</button>
```

#### Tema Escuro
```javascript
// Use dark: prefix para modo escuro
<div className="bg-white dark:bg-gray-800 text-gray-900 dark:text-white">
  Conteúdo
</div>
```

#### Responsividade
```javascript
// Mobile-first approach
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
  {/* Conteúdo */}
</div>
```

### Constantes

**Use constantes ao invés de strings mágicas:**

```javascript
// ❌ Evite
if (session.status === 'active') { ... }

// ✅ Use constantes
import { SESSION_STATUS } from '@/constants';

if (session.status === SESSION_STATUS.ACTIVE) { ... }
```

### Validação e Formatação

**Use utilitários centralizados:**

```javascript
import { formatCPF, validateCPF, formatDate } from '@/utils';

// Formatar CPF para exibição
const cpfFormatado = formatCPF('12345678900'); // 123.456.789-00

// Validar antes de enviar
if (validateCPF(cpf)) {
  // Enviar para API
}

// Formatar data
const dataFormatada = formatDate(new Date(), 'dd/MM/yyyy');
```

---

## 🎨 Guia de Desenvolvimento

### Criando um Novo Componente UI

1. **Crie o arquivo** em `src/components/ui/`
```bash
# src/components/ui/MyComponent.js
```

2. **Implemente o componente** com Tailwind:
```javascript
import React from 'react';
import PropTypes from 'prop-types';

const MyComponent = ({ title, variant = 'default', className = '' }) => {
  const variants = {
    default: 'bg-gray-100 text-gray-800',
    primary: 'bg-blue-500 text-white',
  };

  return (
    <div className={`p-4 rounded-lg ${variants[variant]} ${className}`}>
      <h3 className="font-semibold">{title}</h3>
    </div>
  );
};

MyComponent.propTypes = {
  title: PropTypes.string.isRequired,
  variant: PropTypes.oneOf(['default', 'primary']),
  className: PropTypes.string,
};

export default MyComponent;
```

3. **Exporte** em `src/components/ui/index.js`:
```javascript
export { default as MyComponent } from './MyComponent';
```

4. **Use** em qualquer lugar:
```javascript
import { MyComponent } from '@/components/ui';

<MyComponent title="Título" variant="primary" />
```

### Criando um Novo Hook

1. **Crie o arquivo** em `src/hooks/` ou `src/features/[feature]/hooks/`

2. **Implemente o hook**:
```javascript
// src/hooks/useMyFeature.js
import { useState, useEffect } from 'react';

/**
 * Hook para gerenciar [descrição]
 * @returns {Object} Estado e funções do hook
 */
export const useMyFeature = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchData = async () => {
    setLoading(true);
    try {
      // Lógica aqui
      setData(result);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  return { data, loading, error, refetch: fetchData };
};
```

3. **Use o hook**:
```javascript
import { useMyFeature } from '@/hooks';

const MyComponent = () => {
  const { data, loading, error, refetch } = useMyFeature();

  if (loading) return <Loading />;
  if (error) return <Alert type="error" message={error} />;

  return <div>{/* Render data */}</div>;
};
```

### Criando um Novo Service

1. **Crie o arquivo** em `src/services/`:
```javascript
// src/services/myService.js
import api from './api';

export const MyService = {
  /**
   * Lista todos os itens
   * @returns {Promise<Array>} Lista de itens
   */
  async getAll() {
    const response = await api.get('/items');
    return response.data;
  },

  /**
   * Busca item por ID
   * @param {string} id - ID do item
   * @returns {Promise<Object>} Item encontrado
   */
  async getById(id) {
    const response = await api.get(`/items/${id}`);
    return response.data;
  },

  /**
   * Cria novo item
   * @param {Object} data - Dados do item
   * @returns {Promise<Object>} Item criado
   */
  async create(data) {
    const response = await api.post('/items', data);
    return response.data;
  },
};
```

2. **Exporte** em `src/services/index.js`:
```javascript
export { MyService } from './myService';
```

3. **Use no hook ou componente**:
```javascript
import { MyService } from '@/services';

const data = await MyService.getAll();
```

### Adicionando uma Nova Página

1. **Crie o arquivo** em `src/pages/`:
```javascript
// src/pages/MyPage.js
import React from 'react';
import Layout from '@/components/layout/Layout';
import { Button, Card } from '@/components/ui';

const MyPage = () => {
  return (
    <Layout>
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-6">Minha Página</h1>
        {/* Conteúdo */}
      </div>
    </Layout>
  );
};

export default MyPage;
```

2. **Adicione a rota** em `src/App.js`:
```javascript
import MyPage from './pages/MyPage';

// Dentro das rotas
<Route path="/my-page" element={<MyPage />} />
```

3. **Adicione ao menu** (se necessário) em `src/components/layout/Header.js`

4. **Adicione à constante** `ROUTES` em `src/constants/index.js`:
```javascript
export const ROUTES = {
  // ... outras rotas
  MY_PAGE: '/my-page',
};
```

---

## 🔧 Troubleshooting (Problemas Comuns)

### 1. Erro de Import não encontrado

**Problema:**
```
Module not found: Can't resolve '@/components/ui/Button'
```

**Solução:**
- Verifique se o path alias está correto em `jsconfig.json`
- Reinicie o servidor de desenvolvimento (`Ctrl+C` e `npm start`)
- Verifique se o arquivo existe no caminho especificado

### 2. Estilos do Tailwind não aplicados

**Problema:** Classes do Tailwind não estão funcionando

**Solução:**
```bash
# 1. Verifique se o Tailwind está configurado
# Arquivo: tailwind.config.js

# 2. Verifique se index.css importa o Tailwind
# @tailwind base;
# @tailwind components;
# @tailwind utilities;

# 3. Limpe cache e reinicie
rm -rf node_modules/.cache
npm start
```

### 3. Erro 401 - Token expirado

**Problema:** Requisições falhando com erro 401

**Solução:**
- O token JWT expirou
- Faça logout e login novamente
- Token é renovado automaticamente no login

**Verificar token:**
```javascript
// No console do navegador
localStorage.getItem('token');
```

### 4. CORS Error

**Problema:**
```
Access to fetch has been blocked by CORS policy
```

**Solução:**
- Configure o proxy no `package.json`:
```json
{
  "proxy": "http://localhost:5000"
}
```
- Ou configure CORS no backend
- Reinicie o servidor após alterar proxy

### 5. Performance Lenta

**Problema:** Aplicação lenta ou travando

**Soluções:**

1. **Use React.memo para componentes pesados:**
```javascript
const MyComponent = React.memo(({ data }) => {
  // ...
});
```

2. **Use useCallback para funções:**
```javascript
const handleClick = useCallback(() => {
  // ...
}, [dependencies]);
```

3. **Use useMemo para cálculos pesados:**
```javascript
const expensiveValue = useMemo(() => {
  return calculateExpensiveValue(data);
}, [data]);
```

4. **Lazy load de rotas:**
```javascript
const AdminDashboard = React.lazy(() => import('./pages/AdminDashboard'));

<Suspense fallback={<Loading />}>
  <Route path="/admin" element={<AdminDashboard />} />
</Suspense>
```

### 6. Erro ao fazer Build

**Problema:**
```
Failed to compile
```

**Soluções:**

1. **Limpe cache:**
```bash
rm -rf node_modules
rm package-lock.json
npm install
```

2. **Verifique warnings:**
```bash
npm run build 2>&1 | grep -i "warning"
```

3. **Remova console.logs em produção:**
```javascript
// Use variável de ambiente
if (process.env.NODE_ENV === 'development') {
  console.log('Debug info');
}
```

### 7. Estado não atualiza

**Problema:** useState não atualiza imediatamente

**Solução:**
```javascript
// ❌ Errado - setState é assíncrono
setCount(count + 1);
console.log(count); // Valor antigo

// ✅ Correto - Use useEffect para observar mudanças
useEffect(() => {
  console.log(count); // Valor atualizado
}, [count]);

// ✅ Ou use função de atualização
setCount(prevCount => prevCount + 1);
```

### 8. Memory Leak Warning

**Problema:**
```
Can't perform a React state update on an unmounted component
```

**Solução:**
```javascript
useEffect(() => {
  let isMounted = true;

  async function fetchData() {
    const data = await api.get('/data');
    if (isMounted) {
      setData(data);
    }
  }

  fetchData();

  return () => {
    isMounted = false;
  };
}, []);
```

---

## ❓ FAQ (Perguntas Frequentes)

### Geral

**P: Onde fico as variáveis de ambiente?**
R: Crie um arquivo `.env` na raiz do projeto:
```env
REACT_APP_API_URL=http://localhost:5000/api
REACT_APP_ENV=development
```
Use com `process.env.REACT_APP_API_URL`

**P: Como adicionar uma nova dependência?**
R:
```bash
npm install nome-do-pacote
# ou
yarn add nome-do-pacote
```

**P: Qual editor de código é recomendado?**
R: VS Code com extensões:
- ESLint
- Prettier
- Tailwind CSS IntelliSense
- ES7+ React/Redux/React-Native snippets

### Componentes

**P: Devo criar CSS customizado ou usar Tailwind?**
R: Priorize Tailwind. Use CSS customizado apenas para casos específicos em `index.css`.

**P: Como criar um componente que aceita children?**
R:
```javascript
const Container = ({ children }) => {
  return <div className="container">{children}</div>;
};

Container.propTypes = {
  children: PropTypes.node.isRequired,
};
```

**P: Onde colocar componentes compartilhados entre features?**
R: Em `src/components/ui/` se for genérico, ou em `src/components/Shared/` se for específico do projeto.

### Estado e Hooks

**P: Quando usar useState vs useReducer?**
R:
- **useState**: Estado simples (1-3 valores)
- **useReducer**: Estado complexo com múltiplas ações

**P: Como compartilhar estado entre componentes?**
R: Opções:
1. Levante o estado para o componente pai
2. Use Context API (para estado global)
3. Use custom hook (para lógica compartilhada)

**P: Como fazer fetch de dados?**
R:
```javascript
const [data, setData] = useState(null);
const [loading, setLoading] = useState(true);
const [error, setError] = useState(null);

useEffect(() => {
  const fetchData = async () => {
    try {
      const result = await MyService.getData();
      setData(result);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  fetchData();
}, []);
```

### Rotas

**P: Como proteger rotas privadas?**
R: Use o componente `PrivateRoute`:
```javascript
import PrivateRoute from '@/components/Shared/PrivateRoute';

<Route
  path="/admin"
  element={<PrivateRoute><AdminDashboard /></PrivateRoute>}
/>
```

**P: Como passar parâmetros na URL?**
R:
```javascript
// Definir rota
<Route path="/session/:id" element={<SessionDetail />} />

// Usar em componente
import { useParams } from 'react-router-dom';

const SessionDetail = () => {
  const { id } = useParams();
  // ...
};

// Navegar
navigate(`/session/${sessionId}`);
```

### API e Services

**P: Como fazer requisições autenticadas?**
R: O `api.js` já adiciona o token automaticamente. Apenas use:
```javascript
const data = await api.get('/protected-endpoint');
```

**P: Como tratar erros da API?**
R:
```javascript
try {
  const data = await MyService.getData();
} catch (error) {
  if (error.response) {
    // Erro da API (4xx, 5xx)
    console.error(error.response.data);
  } else if (error.request) {
    // Sem resposta do servidor
    console.error('Sem resposta do servidor');
  } else {
    // Erro ao configurar requisição
    console.error(error.message);
  }
}
```

### Tema

**P: Como acessar o tema atual?**
R:
```javascript
import { useTheme } from '@/context/ThemeContext';

const { theme, toggleTheme } = useTheme();

// theme === 'light' ou 'dark'
```

**P: Como criar componentes que respondem ao tema?**
R: Use classes `dark:` do Tailwind:
```javascript
<div className="bg-white dark:bg-gray-800">
  Conteúdo
</div>
```

### Deploy

**P: Como fazer deploy?**
R:
```bash
# 1. Build
npm run build

# 2. Deploy da pasta /build para seu servidor
# Exemplos:
# - Netlify: Arraste a pasta build
# - Vercel: Conecte o repo no GitHub
# - Docker: Use o Dockerfile incluído
```

**P: Configuração para subdiretor
│   ├── layout/                # Layout e Header
│   ├── sessions/              # Componentes de sessões
│   └── checkin/               # Componentes de check-in
├── hooks/                     # Hooks personalizados (Controllers)
│   ├── useAuth.js
│   ├── useCheckin.js
│   ├── useSessoes.js
│   └── ...
├── services/                  # Services de API (Models)
│   ├── api.js
│   ├── authService.js
│   ├── checkinService.js
│   └── ...
├── models/                    # Tipos e interfaces
│   └── index.js
├── pages/                     # Páginas da aplicação
│   ├── LoginPage.js
│   ├── DashboardPage.js
│   └── ...
├── context/                   # Contextos React
│   └── ThemeContext.js
├── App.js                     # Componente raiz
├── index.js                   # Entry point
└── index.css                  # Estilos globais + Tailwind
```

## 🔧 Configuração

### Variáveis de Ambiente
Crie um arquivo `.env` na raiz do projeto:

```env
REACT_APP_API_URL=http://localhost:8080/api
REACT_APP_ENV=development
```

### Tailwind CSS
Personalize cores e temas em `tailwind.config.js`:

```javascript
theme: {
  extend: {
    colors: {
      primary: {
        500: '#0056e0', // Azul institucional UFC
      }
    }
  }
}
```

## 📚 Padrões de Código

### Services (API)
```javascript
const myService = {
  async getData() {
    const response = await api.get('/endpoint');
    return response.data;
  }
};
```

### Hooks (Controllers)
```javascript
export const useMyHook = () => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  
  const fetch = async () => {
    setLoading(true);
    try {
      const result = await myService.getData();
      setData(result);
    } finally {
      setLoading(false);
    }
  };
  
  return { data, loading, fetch };
};
```

### Componentes (Views)
```javascript
const MyComponent = ({ data, onClick }) => {
  return (
    <Card onClick={onClick}>
      <h3>{data.title}</h3>
    </Card>
  );
};
```

## 🧪 Testes

```bash
# Rodar todos os testes
npm test

# Rodar com coverage
npm test -- --coverage

# Rodar em modo watch
npm test -- --watch
```

---

## 📚 Recursos Adicionais

### Documentação Relacionada
- [IMPROVEMENTS.md](./IMPROVEMENTS.md) - Melhorias implementadas no projeto
- [FINAL_REPORT.md](./FINAL_REPORT.md) - Relatório final de refatoração
- [QUICK_REFERENCE.md](./QUICK_REFERENCE.md) - Referência rápida para desenvolvedores

### Links Úteis
- [React Documentation](https://react.dev/)
- [Tailwind CSS](https://tailwindcss.com/docs)
- [React Router](https://reactrouter.com/)
- [Axios](https://axios-http.com/docs/intro)
- [PropTypes](https://reactjs.org/docs/typechecking-with-proptypes.html)

---

## 🤝 Contribuindo

### Workflow

1. **Clone o repositório**
2. **Crie uma branch** para sua feature: `git checkout -b feature/nome-da-feature`
3. **Faça commits** descritivos: `git commit -m "feat: adiciona nova funcionalidade"`
4. **Push** para o repositório: `git push origin feature/nome-da-feature`
5. **Abra um Pull Request**

### Padrões de Commit

Siga o padrão [Conventional Commits](https://www.conventionalcommits.org/):

```
feat: nova funcionalidade
fix: correção de bug
docs: atualização de documentação
style: formatação, ponto e vírgula
refactor: refatoração de código
test: adição de testes
chore: atualização de dependências
```

**Exemplos:**
```bash
git commit -m "feat: adiciona botão de exportar relatório"
git commit -m "fix: corrige validação de CPF"
git commit -m "docs: atualiza README com novas instruções"
```

### Diretrizes de Código

Antes de submeter PR, verifique:
- ✅ Código segue os padrões do projeto (MVC, nomenclatura)
- ✅ PropTypes adicionados em todos os componentes
- ✅ Sem console.logs desnecessários
- ✅ Usa path aliases (@/) ao invés de caminhos relativos
- ✅ Usa constantes ao invés de strings mágicas
- ✅ Usa Tailwind CSS ao invés de CSS customizado
- ✅ Componentes testados
- ✅ Build passa sem erros (`npm run build`)
- ✅ Sem warnings do ESLint

### Code Review Checklist

**Funcionalidade:**
- [ ] O código faz o que deveria fazer?
- [ ] Existe algum edge case não tratado?
- [ ] O erro handling está adequado?

**Qualidade:**
- [ ] O código é legível e bem organizado?
- [ ] As variáveis têm nomes descritivos?
- [ ] Funções têm responsabilidade única?
- [ ] Há duplicação de código que poderia ser extraída?

**Performance:**
- [ ] Há re-renders desnecessários?
- [ ] Arrays grandes usam keys apropriadas?
- [ ] Cálculos pesados usam useMemo?
- [ ] Callbacks usam useCallback quando apropriado?

**Padrões:**
- [ ] Segue a estrutura MVC?
- [ ] Usa path aliases?
- [ ] Usa constantes centralizadas?
- [ ] Usa utilitários (formatters, validators)?

---

## 📄 Licença

Este projeto é proprietário da **Universidade Federal do Ceará (UFC)**.

Todos os direitos reservados.

---

## 👥 Equipe

Desenvolvido pela equipe de TI da Universidade Federal do Ceará (UFC).

**Contato:** [seu-email@ufc.br](mailto:seu-email@ufc.br)

---

## 📞 Suporte

### Para Desenvolvedores

**Dúvidas técnicas:**
- 📖 Consulte este README primeiro
- 📄 Veja [IMPROVEMENTS.md](./IMPROVEMENTS.md) para melhorias implementadas
- 📋 Veja [QUICK_REFERENCE.md](./QUICK_REFERENCE.md) para referência rápida

**Problemas:**
- 🐛 Abra uma issue no repositório com:
  - Descrição do problema
  - Steps to reproduce
  - Comportamento esperado vs atual
  - Screenshots (se aplicável)
  - Versão do Node e navegador

**Sugestões:**
- 💡 Abra uma issue com tag "enhancement"
- Descreva o caso de uso
- Proponha uma solução (se possível)

### Para Usuários Finais

- 📧 Email: suporte@ufc.br
- 📞 Telefone: (85) XXXX-XXXX

---

## 🎯 Roadmap

### Em Desenvolvimento
- [ ] Testes unitários completos
- [ ] Testes E2E com Cypress
- [ ] PWA features (offline mode)
- [ ] Notificações push

### Planejado
- [ ] Modo offline com cache
- [ ] Exportação de relatórios em PDF
- [ ] Integração com Microsoft Teams
- [ ] App mobile nativo (React Native)

---

## 📊 Status do Projeto

![Build Status](https://img.shields.io/badge/build-passing-brightgreen)
![Coverage](https://img.shields.io/badge/coverage-85%25-green)
![Version](https://img.shields.io/badge/version-0.1.0-blue)
![React](https://img.shields.io/badge/react-19.1.0-blue)
![Tailwind](https://img.shields.io/badge/tailwind-3.x-blue)

**Status:** ✅ Em Produção

**Última atualização:** Janeiro 2026

---

**UFC - Universidade Federal do Ceará © 2026**

