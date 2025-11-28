# 🐛 Guia de Debug - Loop Infinito

## ✅ Correções Aplicadas

### 1. Interceptor do Axios
- ✅ Adicionado flag `isRedirecting` para evitar múltiplos redirecionamentos
- ✅ Verificação se já está na página de login antes de redirecionar
- ✅ Limpeza de token e cookie ao detectar 401
- ✅ Timeout antes de redirecionar para garantir limpeza

### 2. React Query
- ✅ Configurado `retry: false` globalmente
- ✅ Desabilitado `refetchOnMount`
- ✅ Desabilitado `refetchOnReconnect`
- ✅ Queries dependentes usando `enabled`

### 3. AuthGuard
- ✅ Componente de proteção no layout do dashboard
- ✅ Verificação de token, user e isAdmin
- ✅ Loading state durante verificação

### 4. Login
- ✅ Cookie definido corretamente com `SameSite=Lax`
- ✅ Delay antes de redirecionar para garantir salvamento

## 🔍 Como Verificar se o Loop Foi Corrigido

### 1. Limpar Tudo Antes de Testar
```javascript
// No console do navegador (F12):
localStorage.clear();
document.cookie.split(";").forEach(c => {
  document.cookie = c.replace(/^ +/, "").replace(/=.*/, "=;expires=" + new Date().toUTCString() + ";path=/");
});
location.reload();
```

### 2. Fazer Login
1. Acesse `http://localhost:3000/login`
2. Faça login com um usuário admin
3. Verifique no console se aparecem erros

### 3. Verificar se Token foi Salvo
```javascript
// No console do navegador:
console.log('Token localStorage:', localStorage.getItem('admin_token'));
console.log('Cookie:', document.cookie);
console.log('User:', localStorage.getItem('admin_user'));
```

### 4. Verificar Network Tab
- Abra DevTools (F12) → Aba Network
- Filtre por "Fetch/XHR"
- Verifique se as requisições estão sendo feitas:
  - ✅ `/api/admin/dashboard/stats` (apenas 1 vez)
  - ✅ `/api/admin/dashboard/transactions` (apenas 1 vez)
  - ✅ `/api/admin/dashboard/revenue-chart` (apenas 1 vez)
- ❌ Se aparecerem múltiplas requisições repetidas = ainda há loop

### 5. Verificar Status Codes
- **200**: OK, backend respondeu corretamente
- **401**: Não autenticado (verifica se token está sendo enviado)
- **403**: Usuário não é admin
- **404**: Rota não encontrada no backend

## 🚨 Possíveis Problemas Restantes

### Problema 1: Backend não está rodando
**Sintomas:**
- Erros de conexão no console
- Status "failed" nas requisições

**Solução:**
```bash
cd backend-nodejs
npm run dev
```

### Problema 2: Usuário não é admin
**Sintomas:**
- Status 403 nas requisições admin
- Redirecionamento para login após autenticação

**Solução:**
```sql
-- Atualizar usuário para admin no banco
UPDATE users SET is_admin = true WHERE email = 'seu-email@example.com';
```

### Problema 3: CORS Error
**Sintomas:**
- Erro de CORS no console
- Requisições bloqueadas

**Solução:**
- Verificar se backend tem configuração CORS correta
- Verificar se porta está correta (3005)

### Problema 4: JWT Expirado
**Sintomas:**
- 401 em todas as requisições após algum tempo
- Mesmo após login

**Solução:**
```bash
# Verificar JWT_EXPIRES_IN no backend/.env
JWT_EXPIRES_IN="30d"
```

## 🛠️ Comandos Úteis para Debug

### Backend
```bash
# Ver logs do backend em tempo real
cd backend-nodejs
npm run dev

# Verificar se rotas admin existem
curl http://localhost:3005/api/admin/dashboard/stats
```

### Frontend
```bash
# Limpar cache e reinstalar
cd admin-panel
rm -rf .next node_modules
npm install
npm run dev
```

### Banco de Dados
```bash
# Verificar usuários admin
cd backend-nodejs
npm run prisma:studio
# Abrir http://localhost:5555
```

## ✅ Checklist de Verificação

- [ ] Backend está rodando na porta correta (3005)
- [ ] Frontend está rodando na porta 3000
- [ ] `NEXT_PUBLIC_API_URL=http://localhost:3005` no `.env.local`
- [ ] Usuário tem `is_admin = true` no banco
- [ ] Token está sendo salvo no localStorage
- [ ] Cookie `admin_token` está definido
- [ ] Não há erros no console do navegador
- [ ] Network tab mostra apenas 1 requisição por endpoint
- [ ] Status code das requisições é 200

## 📞 Se Ainda Persistir o Loop

1. **Capture o log completo:**
   - Abra DevTools (F12)
   - Vá para Console
   - Limpe o console
   - Faça login
   - Copie todos os erros/avisos

2. **Capture o Network:**
   - Abra DevTools (F12) → Network
   - Marque "Preserve log"
   - Faça login
   - Tire screenshot das requisições

3. **Verifique o backend:**
   - Veja os logs do terminal do backend
   - Procure por erros de autenticação
   - Verifique se as rotas admin estão registradas

## 🎯 Teste Final

Se tudo estiver correto, você deve conseguir:
1. ✅ Fazer login sem erros
2. ✅ Ver o dashboard com estatísticas
3. ✅ Navegar entre páginas sem loops
4. ✅ Fazer logout e login novamente
5. ✅ Recarregar a página sem perder a sessão

