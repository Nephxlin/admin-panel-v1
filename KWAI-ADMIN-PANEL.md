# 🎯 Kwai Pixels - Admin Panel

## ✅ Sistema Completo Implementado!

O sistema de gerenciamento de Kwai Pixels foi 100% integrado no admin-panel.

---

## 📍 Localização

**URL**: `http://localhost:3000/dashboard/kwai-pixels`

**Menu**: Sidebar → "Kwai Pixels" (ícone Activity)

---

## 🎨 Funcionalidades

### 1️⃣ **Listar Pixels**
- Visualizar todos os pixels cadastrados
- Status (Ativo/Inativo)
- Pixel ID e Access Token (com show/hide)
- Ações: Editar, Deletar, Ativar/Desativar

### 2️⃣ **Criar Pixel**
- Pixel ID (obrigatório)
- Access Token (opcional)
- Nome
- Descrição
- Status (Ativo/Inativo)

### 3️⃣ **Editar Pixel**
- Atualizar qualquer campo
- Salvar alterações

### 4️⃣ **Deletar Pixel**
- Confirmação antes de deletar
- Remove permanentemente

### 5️⃣ **Ativar/Desativar**
- Toggle rápido do status
- Pixels inativos não aparecem no frontend

### 6️⃣ **Copiar IDs**
- Botão para copiar Pixel ID
- Botão para copiar Access Token
- Feedback visual (check verde)

---

## 📊 Interface

### Tabela de Pixels

```
┌────────────────────┬────────────────┬──────────────────┬────────┬─────────┐
│ Pixel              │ Pixel ID       │ Access Token     │ Status │ Ações   │
├────────────────────┼────────────────┼──────────────────┼────────┼─────────┤
│ Campanha Principal │ 0D0NElE9N8... │ ••••••••••••••  │ ✅ Ativo│ ✏️ 🗑️  │
│ Descrição aqui     │ [Copiar 📋]    │ [👁️ Mostrar]     │        │         │
└────────────────────┴────────────────┴──────────────────┴────────┴─────────┘
```

### Modal de Criação/Edição

```
┌─────────────────────────────────────┐
│ Novo Pixel / Editar Pixel           │
├─────────────────────────────────────┤
│ Pixel ID *                          │
│ ┌─────────────────────────────────┐ │
│ │ 0D0NElE9N8onlSxVmaAuGA          │ │
│ └─────────────────────────────────┘ │
│                                     │
│ Access Token (Opcional)             │
│ ┌─────────────────────────────────┐ │
│ │ seu_access_token_aqui           │ │
│ └─────────────────────────────────┘ │
│                                     │
│ Nome                                │
│ ┌─────────────────────────────────┐ │
│ │ Campanha Principal              │ │
│ └─────────────────────────────────┘ │
│                                     │
│ Descrição                           │
│ ┌─────────────────────────────────┐ │
│ │ Pixel para rastreamento...      │ │
│ └─────────────────────────────────┘ │
│                                     │
│ ☑️ Pixel ativo                      │
│                                     │
│      [Cancelar]  [Criar Pixel]     │
└─────────────────────────────────────┘
```

---

## 🔧 APIs Integradas

### Backend Endpoints:

```typescript
// Listar todos
GET /api/admin/kwai-pixels

// Listar ativos
GET /api/admin/kwai-pixels/active

// Ver específico
GET /api/admin/kwai-pixels/:id

// Criar
POST /api/admin/kwai-pixels
{
  "pixelId": "0D0NElE9N8onlSxVmaAuGA",
  "accessToken": "optional_token",
  "name": "Campanha Principal",
  "description": "Descrição",
  "isActive": true
}

// Atualizar
PUT /api/admin/kwai-pixels/:id
{
  "pixelId": "novo_id",
  "name": "Novo Nome",
  ...
}

// Deletar
DELETE /api/admin/kwai-pixels/:id

// Ativar/Desativar
POST /api/admin/kwai-pixels/:id/toggle-status
{
  "isActive": true
}
```

---

## 💡 Como Usar

### Passo 1: Obter Pixel ID

1. Acesse https://business.kwai.com
2. Vá em Assets → Pixel
3. Clique em "Create Pixel"
4. Selecione "Developer Mode"
5. Copie o Pixel ID

### Passo 2: Criar no Admin Panel

1. Acesse: `/dashboard/kwai-pixels`
2. Clique em "Novo Pixel"
3. Cole o Pixel ID
4. Preencha nome e descrição
5. Salve

### Passo 3: Usar no Frontend

O pixel estará disponível automaticamente:

```
http://localhost:3006?kpid=SEU_PIXEL_ID
```

---

## 🎯 Info Box

O painel mostra um box informativo:

```
ℹ️ Como usar:
• Crie pixels para diferentes campanhas no Kwai
• Use o Pixel ID na URL: ?kpid=SEU_PIXEL_ID
• Access Token é opcional (apenas para rastreamento server-side)
• Pixels inativos não aparecem no frontend
```

---

## 🔐 Segurança

### Access Token

- **Mostrado**: `••••••••••••••••` (oculto por padrão)
- **Botão**: 👁️ para mostrar/ocultar
- **Nunca exposto** no frontend público
- **Apenas admin** pode visualizar

### Validações

- ✅ Pixel ID único (não permite duplicados)
- ✅ Autenticação admin obrigatória
- ✅ Confirmação antes de deletar

---

## 📱 Responsivo

- ✅ Desktop: Tabela completa
- ✅ Tablet: Tabela scroll horizontal
- ✅ Mobile: Cards empilhados (adaptativo)

---

## 🎨 Estados Visuais

### Status do Pixel

- 🟢 **Ativo**: Badge verde com ícone Power
- ⚫ **Inativo**: Badge cinza com ícone PowerOff

### Feedback Visual

- ✅ **Sucesso**: Toast verde
- ❌ **Erro**: Toast vermelho
- ⏳ **Loading**: Spinner animado

### Copiar

- 📋 **Normal**: Ícone Copy cinza
- ✅ **Copiado**: Check verde (2 segundos)

---

## 🧪 Como Testar

### Teste 1: Criar Pixel

1. Acesse `/dashboard/kwai-pixels`
2. Clique "Novo Pixel"
3. Preencha:
   - Pixel ID: `0D0NElE9N8onlSxVmaAuGA`
   - Nome: `Teste`
4. Salve
5. Verifique: Aparece na lista

### Teste 2: Editar Pixel

1. Clique ✏️ em um pixel
2. Altere o nome
3. Salve
4. Verifique: Nome atualizado

### Teste 3: Ativar/Desativar

1. Clique no badge de status
2. Confirme mudança
3. Verifique: Status mudou

### Teste 4: Copiar ID

1. Clique no ícone 📋
2. Verifique: Check verde aparece
3. Cole (Ctrl+V): ID copiado

### Teste 5: Deletar

1. Clique 🗑️
2. Confirme
3. Verifique: Pixel removido

---

## 🚀 Integração com Frontend

### Pixels Ativos

Endpoint público retorna apenas pixels ativos:

```javascript
// Frontend (casino-frontend)
GET /api/settings/kwai-pixels

// Resposta
{
  "status": true,
  "data": [
    {
      "id": 1,
      "pixelId": "0D0NElE9N8onlSxVmaAuGA",
      "name": "Campanha Principal"
      // accessToken NÃO é retornado
    }
  ]
}
```

### URL Tracking

```
http://localhost:3006?kpid=0D0NElE9N8onlSxVmaAuGA
```

O frontend busca automaticamente o pixel pelo ID.

---

## 📝 Arquivos Criados

### Admin Panel

```
admin-panel/
├── app/(dashboard)/dashboard/kwai-pixels/
│   └── page.tsx                        ← Página de gerenciamento
├── lib/
│   └── api.ts                          ← APIs (kwaiPixels adicionado)
├── components/layout/
│   └── Sidebar.tsx                     ← Menu atualizado
└── KWAI-ADMIN-PANEL.md                ← Esta documentação
```

---

## ✅ Checklist de Implementação

- [x] Página de gerenciamento criada
- [x] APIs integradas com backend
- [x] Menu sidebar atualizado
- [x] CRUD completo funcionando
- [x] Show/Hide de tokens
- [x] Copiar para clipboard
- [x] Validações e segurança
- [x] Feedback visual (toasts)
- [x] Confirmação de deleção
- [x] Info box explicativo
- [x] Documentação completa

---

## 🎉 Pronto para Uso!

O sistema está 100% funcional e pronto para gerenciar pixels Kwai.

**Próximos passos**:
1. Acesse `/dashboard/kwai-pixels`
2. Crie seu primeiro pixel
3. Teste no frontend com `?kpid=SEU_ID`
4. Monitore eventos no Debug Panel

---

**Status**: ✅ Implementação Completa  
**Versão**: 1.0.0  
**Data**: Novembro 2025



