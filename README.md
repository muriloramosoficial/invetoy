# INVENTOY

<p align="center">
  <strong>Gestão de Estoque Inteligente — Multi-tenant SaaS</strong>
</p>

<p align="center">
  <span style="color: #3ECF8E;">●</span> ASAAS (Brasil)
  <span style="color: #3ECF8E;"> ●</span> PIX, Boleto, Cartão
  <span style="color: #3ECF8E;"> ●</span> 100% Português Brasileiro
</p>

---

**INVENTOY** é um sistema de gestão de inventário multi-tenant com foco no mercado brasileiro — pagamentos via **ASAAS** (PIX, Boleto, Cartão de Crédito).

## Stack

- **Frontend:** Next.js 14 (App Router) + Tailwind CSS v4 + shadcn/ui
- **Database:** Supabase (PostgreSQL + RLS + Realtime)
- **Auth:** Supabase Auth (Magic Link + Email/Senha)
- **Payments:** ASAAS (PIX, Boleto, Cartão)
- **i18n:** react-i18next (pt-BR)
- **Charts:** Recharts

## Design System

- Dark mode nativo (inspirado no Supabase)
- Cores: fundo `#121212`, verde `#3ECF8E`, cinzas frios
- Tipografia: Inter (UI) + JetBrains Mono (dados)
- Textura de ruído suave no fundo

## Funcionalidades

### Web (Gestão)
- Dashboard com Bento Grid e gráficos de movimentação
- Inventário com tabela estilo terminal e ajuste rápido
- Log de movimentações (auditoria)
- CRUD de categorias e localizações
- Relatórios exportáveis
- Cadastro de produtos
- Configurações da conta

### Mobile (Operação) — *Em planejamento*
- Scanner de código de barras (câmera fullscreen)
- Fluxo de transferência em 3 passos
- Modo offline com sincronização
- Ver `specmobile.md`

## Deploy

```bash
# 1. Clone
git clone https://github.com/muriloramosoficial/invetoy.git

# 2. Install
npm install

# 3. Configure env vars (copie .env.local e preencha)
cp .env.local .env.local

# 4. Run dev
npm run dev

# 5. Build
npm run build
```

## Licença

MIT
