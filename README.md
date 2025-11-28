# Admin Panel - Cassino

Painel administrativo desenvolvido em Next.js 14 com TypeScript e Tailwind CSS.

## 🚀 Tecnologias

- **Next.js 14** (App Router)
- **TypeScript**
- **Tailwind CSS**
- **React Query** (@tanstack/react-query) - Data fetching e cache
- **Zustand** - State management
- **React Hook Form** + **Zod** - Formulários e validação
- **Recharts** - Gráficos
- **Lucide React** - Ícones
- **Axios** - HTTP client
- **date-fns** - Manipulação de datas
- **React Hot Toast** - Notificações

## 📦 Instalação

```bash
# Instalar dependências
npm install

# Configurar variáveis de ambiente
cp .env.local.example .env.local
# Editar NEXT_PUBLIC_API_URL com a URL do backend

# Executar em desenvolvimento
npm run dev

# Build para produção
npm run build

# Executar produção
npm start
```

## 🔧 Configuração

Configure a variável de ambiente `.env.local`:

```env
NEXT_PUBLIC_API_URL=http://localhost:3001
```

## 📁 Estrutura do Projeto

```
admin-panel/
├── app/
│   ├── (auth)/
│   │   └── login/          # Página de login
│   ├── (dashboard)/
│   │   ├── layout.tsx      # Layout do dashboard
│   │   └── dashboard/
│   │       ├── page.tsx    # Dashboard principal
│   │       ├── users/      # Gestão de usuários
│   │       ├── deposits/   # Gestão de depósitos
│   │       ├── withdrawals/# Gestão de saques
│   │       ├── games/      # Gestão de jogos
│   │       ├── settings/   # Configurações
│   │       └── ...
│   ├── layout.tsx          # Layout raiz
│   ├── page.tsx            # Redireciona para dashboard
│   └── providers.tsx       # React Query Provider
├── components/
│   ├── layout/
│   │   ├── Sidebar.tsx     # Menu lateral
│   │   └── Header.tsx      # Cabeçalho
│   └── ui/
│       ├── DataTable.tsx   # Tabela com paginação
│       ├── StatCard.tsx    # Card de estatísticas
│       └── StatusBadge.tsx # Badge de status
├── lib/
│   ├── api.ts              # Cliente API com Axios
│   ├── auth.ts             # Funções de autenticação
│   └── utils.ts            # Utilitários
├── store/
│   └── auth.store.ts       # Store Zustand
├── types/
│   └── index.ts            # Tipos TypeScript
└── middleware.ts           # Middleware de autenticação
```

## 🔐 Autenticação

O sistema utiliza JWT (JSON Web Tokens) para autenticação:

1. Login através da página `/login`
2. Token armazenado em `localStorage` e cookie
3. Middleware protege rotas `/dashboard/*`
4. Verificação de `isAdmin` no backend

## 📊 Funcionalidades Implementadas

### ✅ Backend (backend-nodejs)
- [x] Middleware de autenticação admin
- [x] Rotas admin completas (CRUD)
- [x] Controllers e services
- [x] Dashboard com KPIs
- [x] Gestão de usuários
- [x] Gestão de depósitos/saques
- [x] Gestão de jogos, provedores, categorias
- [x] Gestão de banners, missões, VIP
- [x] Configurações gerais

### ✅ Frontend (admin-panel)
- [x] Sistema de autenticação
- [x] Layout com sidebar e header
- [x] Dashboard com estatísticas e gráficos
- [x] Listagem de usuários
- [x] Listagem e aprovação de depósitos
- [x] Listagem e aprovação de saques
- [x] Listagem de jogos
- [x] Configurações gerais
- [x] Componentes reutilizáveis
- [x] Tabela com paginação
- [x] Sistema de notificações

### 🔨 Em Desenvolvimento
- [ ] Detalhes completos de usuários
- [ ] CRUD completo de jogos
- [ ] CRUD de provedores e categorias
- [ ] CRUD de banners
- [ ] CRUD de missões
- [ ] CRUD de níveis VIP
- [ ] Upload de imagens
- [ ] Exportação de dados (CSV)
- [ ] Filtros avançados

## 🎨 Tema

O painel suporta tema escuro (dark mode) através do Tailwind CSS.

## 🔗 Integração com Backend

O painel se comunica com o backend Node.js através da API REST:

- Base URL: `http://localhost:3001` (configurável)
- Endpoints: `/api/admin/*`
- Autenticação: Bearer Token (JWT)

## 📝 Uso

1. Inicie o backend Node.js
2. Inicie o painel admin
3. Acesse `http://localhost:3000`
4. Faça login com um usuário admin
5. Navegue pelo painel usando o menu lateral

## 🤝 Contribuindo

Este é um projeto interno. Para contribuir, entre em contato com a equipe.

## 📄 Licença

Proprietário - Todos os direitos reservados.
