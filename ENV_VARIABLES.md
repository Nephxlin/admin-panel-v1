# Variáveis de Ambiente do Admin Panel

## Configuração Local (.env.local)

Crie um arquivo `.env.local` na raiz do projeto com:

```bash
# API Backend URL
NEXT_PUBLIC_API_URL=http://localhost:3005
```

## Configuração de Produção (Coolify)

No Coolify, configure a variável de ambiente:

```bash
NEXT_PUBLIC_API_URL=http://ykssc04o08ccokkcgk08ckgg.168.231.117.96.sslip.io
```

**IMPORTANTE:** Marque como "Available at Buildtime" ✅

## Como Usar

A variável `NEXT_PUBLIC_API_URL` é usada para:
- Fazer requisições à API do backend
- Construir URLs de imagens (banners, jogos, etc)
- Configurar o axios client

Se a variável não estiver configurada, o sistema usa `http://localhost:3005` como padrão.

