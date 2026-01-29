# Sistema de Permissões - SisEUs

Este documento descreve o sistema de controle de acesso e permissões implementado na aplicação.

## Tipos de Usuário

A aplicação suporta 4 tipos de usuários com diferentes níveis de acesso:

### 1. ADMINISTRADOR
- **Acesso total** ao sistema
- Pode acessar o painel administrativo (`/admin`)
- Gerencia eventos, usuários e configurações
- Pode executar todas as funcionalidades de outros usuários

### 2. PROFESSOR / AVALIADOR
- Acesso às páginas de avaliações (`/avaliacoes`, `/minhas-avaliacoes`)
- Pode avaliar apresentações atribuídas
- Acesso ao dashboard geral
- Check-in/Check-out em eventos
- Visualização de sessões e eventos

### 3. ESTUDANTE
- Acesso ao dashboard (`/dashboard`)
- Visualização de suas apresentações
- Check-in/Check-out em eventos
- Visualização de sessões e eventos
- **NÃO** tem acesso a avaliações ou painel administrativo

## Estrutura de Proteção

### Componente PrivateRoute

Localizado em: `src/components/Shared/PrivateRoute.js`

Este componente protege rotas verificando:
1. **Autenticação**: Usuário está logado?
2. **Autorização**: Usuário tem a role necessária?

#### Uso

```jsx
// Rota protegida sem restrição de role (qualquer usuário autenticado)
<Route 
  path="/dashboard" 
  element={<PrivateRoute element={<DashboardPage />} />} 
/>

// Rota protegida com role específica
<Route 
  path="/admin" 
  element={
    <PrivateRoute 
      element={<AdminDashboard />} 
      allowedRoles={['ADMINISTRADOR']}
    />
  }
/>

// Rota protegida com múltiplas roles
<Route 
  path="/avaliacoes" 
  element={
    <PrivateRoute 
      element={<MinhasAvaliacoesPage />} 
      allowedRoles={['PROFESSOR', 'AVALIADOR']}
    />
  }
/>
```

## Mapeamento de Rotas e Permissões

| Rota | Permissões | Descrição |
|------|-----------|-----------|
| `/` | Pública | Página de login |
| `/admin` | ADMINISTRADOR | Painel administrativo |
| `/dashboard` | Autenticado | Dashboard principal |
| `/avaliacoes` | PROFESSOR, AVALIADOR | Gerenciamento de avaliações |
| `/minhas-avaliacoes` | PROFESSOR, AVALIADOR | Lista de avaliações do usuário |
| `/sessao/:id` | Autenticado | Detalhes de uma sessão |
| `/presenca` | Autenticado | Sistema de check-in/check-out |
| `/configuracoes` | Autenticado | Configurações do usuário |
| `/sobre` | Autenticado | Sobre o sistema |
| `/acesso-negado` | Autenticado | Página de erro de permissão |

## Fluxo de Autorização

```
1. Usuário tenta acessar rota protegida
   ↓
2. PrivateRoute verifica se está autenticado
   ↓ NÃO → Redireciona para /login
   ↓ SIM
3. Verifica se allowedRoles foi definido
   ↓ NÃO → Permite acesso
   ↓ SIM
4. Verifica se role do usuário está em allowedRoles
   ↓ NÃO → Exibe página de AcessoNegado
   ↓ SIM
5. Renderiza componente da rota
```

## Página de Acesso Negado

Localizada em: `src/pages/AcessoNegado.js`

Exibida quando um usuário autenticado tenta acessar uma rota sem permissão adequada.

Funcionalidades:
- Mensagem clara sobre falta de permissão
- Botão para retornar à página inicial apropriada para o tipo de usuário
- Design consistente com o restante da aplicação

## Redirecionamento Automático após Login

Após login bem-sucedido, o usuário é redirecionado automaticamente para:

- **ADMINISTRADOR** → `/admin`
- **PROFESSOR/AVALIADOR** → `/avaliacoes`
- **ESTUDANTE** → `/dashboard`

Implementado em: `src/hooks/useAuth.js` (função `login`)

## Backend - Verificação de Permissões

As rotas do backend também possuem verificação de permissões usando atributos:

```csharp
[AuthorizeRoles(ETipoUsuario.Admin)]
public async Task<IActionResult> AlgumaRotaAdmin()
{
    // Apenas administradores podem acessar
}

[AuthorizeRoles(ETipoUsuario.Professor, ETipoUsuario.Admin)]
public async Task<IActionResult> AlgumaRotaProfessor()
{
    // Professores e administradores podem acessar
}
```

## Manutenção e Extensão

### Adicionar Nova Role

1. Adicionar tipo no backend (ETipoUsuario)
2. Atualizar mapeamento em `authService.js`:
```javascript
const tipoUsuarioMap = {
  1: 'ESTUDANTE',
  2: 'PROFESSOR',
  3: 'AVALIADOR',
  4: 'ADMINISTRADOR',
  5: 'NOVA_ROLE' // Adicionar aqui
};
```

3. Adicionar verificação em `authService.js` se necessário
4. Atualizar rotas em `App.js` com nova permissão

### Adicionar Rota Protegida

```jsx
<Route 
  path="/nova-rota" 
  element={
    <PrivateRoute 
      element={<NovoComponente />} 
      allowedRoles={['ROLE1', 'ROLE2']}
    />
  }
/>
```

## Segurança

⚠️ **Importante**: 
- A verificação de permissões no frontend é apenas para UX
- **SEMPRE** implemente verificação no backend também
- Nunca confie apenas em verificações client-side
- Use HTTPS em produção
- Tokens JWT devem ter expiração adequada

## Testando Permissões

### Usuários de Teste (InitBD.cs)

- **Admin**: admin@siseus.com
- **Professor**: carlos.silva@siseus.com, maria.costa@siseus.com
- **Avaliador**: juliana.mendes@siseus.com, renato.oliveira@siseus.com
- **Estudante**: ana.lima@siseus.com, bruno.castro@siseus.com

**Senha padrão**: `Senha@123`

### Cenários de Teste

1. Login como estudante → tentar acessar `/admin` → deve mostrar "Acesso Negado"
2. Login como avaliador → acessar `/avaliacoes` → deve funcionar
3. Login como admin → deve acessar todas as rotas
4. Tentar acessar rota sem login → deve redirecionar para `/`
