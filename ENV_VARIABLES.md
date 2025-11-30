# Variáveis de Ambiente do Admin Panel

## Configuração Local (.env.local)

Crie um arquivo `.env.local` na raiz do projeto com:

```bash
# API Backend URL
NEXT_PUBLIC_API_URL=http://localhost:3005

# Frontend URL (para URLs de teste com Kwai Pixel)
NEXT_PUBLIC_FRONTEND_URL=http://localhost:3006
```

## Configuração de Produção (Coolify)

No Coolify, configure as variáveis de ambiente:

```bash
NEXT_PUBLIC_API_URL=http://ykssc04o08ccokkcgk08ckgg.168.231.117.96.sslip.io
NEXT_PUBLIC_FRONTEND_URL=https://seu-site.com
```

**IMPORTANTE:** Marque ambas como "Available at Buildtime" ✅

## Como Usar

### NEXT_PUBLIC_API_URL
A variável `NEXT_PUBLIC_API_URL` é usada para:
- Fazer requisições à API do backend
- Construir URLs de imagens (banners, jogos, etc)
- Configurar o axios client

Se a variável não estiver configurada, o sistema usa `http://localhost:3005` como padrão.

### NEXT_PUBLIC_FRONTEND_URL
A variável `NEXT_PUBLIC_FRONTEND_URL` é usada para:
- Gerar URLs de teste com Kwai Pixel (exemplo: `https://seu-site.com?kpid=123`)
- Links de referência para o frontend
- Integração com serviços de rastreamento

Se a variável não estiver configurada, o sistema usa `http://localhost:3006` como padrão.

