# Troubleshooting de Imagens no Admin Panel

## Problema: Imagens não carregam

Se as imagens de jogos e banners não estiverem carregando, siga este checklist:

### 1. Verificar Variável de Ambiente

**Local (.env.local):**
```bash
NEXT_PUBLIC_API_URL=http://localhost:3005
```

**Produção (Coolify):**
```bash
NEXT_PUBLIC_API_URL=http://ykssc04o08ccokkcgk08ckgg.168.231.117.96.sslip.io
```

⚠️ **IMPORTANTE:** 
- No Coolify, marque como "Available at Buildtime" ✅
- Sempre faça **rebuild** após alterar variáveis de ambiente
- A variável deve começar com `NEXT_PUBLIC_` para estar disponível no browser

### 2. Verificar CORS no Backend

O backend precisa ter estas variáveis configuradas:

```bash
APP_URL=http://ykssc04o08ccokkcgk08ckgg.168.231.117.96.sslip.io
ADMIN_PANEL_URL=http://agw4cwockw4k844cgkgs0o8g.168.231.117.96.sslip.io
FRONTEND_URL=http://foog40s4sokw8gowc084sgcw.168.231.117.96.sslip.io
```

O arquivo `backend-nodejs/src/app.ts` está configurado para aceitar requisições desses domínios.

### 3. Verificar URLs das Imagens

Abra o DevTools do navegador (F12) e:

1. Vá na aba **Network**
2. Filtre por "Img"
3. Tente carregar uma página com imagens
4. Verifique se as URLs estão corretas

**URL correta deve ser:**
```
http://backend-url/uploads/banners/abc123.png
```

**URLs incorretas:**
```
http://backend-url/uploads/uploads/banners/abc123.png  ❌ (duplicado)
banners/abc123.png  ❌ (relativo, sem domínio)
```

### 4. Verificar Erros de CORS

No console do navegador, se você ver:

```
Access to image at 'http://...' from origin 'http://...' has been blocked by CORS policy
```

**Solução:** Adicione a variável `ADMIN_PANEL_URL` no backend e reinicie.

### 5. Verificar Next.js Config

O arquivo `next.config.ts` deve ter:

```typescript
images: {
  remotePatterns: [
    {
      protocol: 'http',
      hostname: '**',
    },
    {
      protocol: 'https',
      hostname: '**',
    },
  ],
  unoptimized: true,
},
```

### 6. Como Testar

**No terminal do admin-panel:**
```bash
# Verificar se a variável está definida
echo $NEXT_PUBLIC_API_URL

# Deve retornar: http://ykssc04o08ccokkcgk08ckgg.168.231.117.96.sslip.io
```

**No browser (Console):**
```javascript
// Testar URL da imagem diretamente
fetch('http://ykssc04o08ccokkcgk08ckgg.168.231.117.96.sslip.io/uploads/games/abc123.png')
  .then(r => console.log('Status:', r.status))
  .catch(e => console.error('Erro:', e));
```

### 7. Checklist Final

- [ ] Variável `NEXT_PUBLIC_API_URL` configurada no Coolify
- [ ] Marcada como "Available at Buildtime"
- [ ] Rebuild feito após configurar
- [ ] Backend tem `APP_URL` e `ADMIN_PANEL_URL` configurados
- [ ] Backend reiniciado após configurar
- [ ] URLs das imagens retornadas pela API estão completas (começam com `http://`)
- [ ] DevTools não mostra erros de CORS
- [ ] `next.config.ts` tem configuração de imagens remotas

## Comandos Úteis

**Rebuild no Coolify:**
1. Vá no serviço do admin-panel
2. Clique em "Redeploy"
3. Aguarde o build completar

**Verificar logs no Coolify:**
1. Vá no serviço
2. Clique em "Logs"
3. Procure por erros relacionados a imagens ou CORS

**Limpar cache do Next.js (local):**
```bash
rm -rf .next
yarn build
```

## Ainda não funciona?

1. Verifique se o backend está respondendo:
   ```bash
   curl http://ykssc04o08ccokkcgk08ckgg.168.231.117.96.sslip.io/health
   ```

2. Teste acessar uma imagem diretamente no navegador:
   ```
   http://ykssc04o08ccokkcgk08ckgg.168.231.117.96.sslip.io/uploads/banners/[filename].png
   ```

3. Se o upload funciona mas a exibição não, o problema é no frontend
4. Se nem o upload funciona, o problema é no backend

