# ESPECIFICAÇÃO DE REFATORAÇÃO ARQUITETURAL — INVENTOY

## PARTE I: RESUMO EXECUTIVO DE DÍVIDA TÉCNICA

**Nota Geral: 6.8/10** — Arquitetura híbrida (legado no `app/` + DDD moderno no `src/`) com fundação sólida mas inconsistências graves de camadas, segurança e observabilidade.

O maior risco presente é a **duplicação de lógica de negócio** entre `src/modules/auth/presentation/actions/auth.ts` (Server Actions) e `src/modules/auth/application/register.usecase.ts` (Use Case), criando dois caminhos de cadastro que podem divergir. Em segundo lugar, a **violação de camada nos hooks de apresentação** (`use-products.ts`, `use-inventory.ts`, `use-movements.ts`) que fazem consultas SQL diretas bypassando use cases e repositories, tornando o código DDD decorativo. Em terceiro, a **exposição de chaves Asaas no tipo Tenant** (`types/index.ts`) que pode vazar secrets para o bundle do cliente.

---

## PARTE II: DIAGNÓSTICO DETALHADO POR PILAR

---

### PILAR 1: ARQUITETURA DE SISTEMA E SAAS

#### 1.1 Estrutura de Diretórios — Híbrida (Legado + DDD)

O repositório tem **duas arquiteturas coexistindo**:

- **Legado** (`app/`, `lib/`, `components/`, `hooks/`, `types/`): Next.js App Router tradicional, acoplado ao Supabase, sem camadas.
- **DDD Moderno** (`src/`): 8 módulos Feature-Based com domain/application/infrastructure/presentation.

**Problemas:**

| # | Problema | Localização | Gravidade |
|---|----------|-------------|-----------|
| P1.1 | Código legado ainda é O ÚNICO em produção — `src/` é inativo | `app/*` vs `src/modules/*` | **Crítico** |
| P1.2 | Server Actions em `app/actions/auth.ts` duplicam use cases | `app/actions/auth.ts` vs `src/modules/auth/application/register.usecase.ts` | **Crítico** |
| P1.3 | Hooks de apresentação fazem queries SQL diretas | `hooks/use-inventory.ts:41-60`, `hooks/use-movements.ts:30-50`, `src/modules/catalog/presentation/hooks/use-products.ts:45-70` | **Alto** |
| P1.4 | Admin `(admin)` e Dashboard `(dashboard)` são route groups válidos, mas misturados | `app/(admin)/admin/` vs `app/(dashboard)/` | **Baixo** |

#### 1.2 Bounded Contexts — Definidos mas não Isolados

**8 módulos DDD mapeados:** auth, tenant, identity, catalog, inventory, billing, admin, api-public

| Contexto | Isolamento | Problema |
|----------|-----------|----------|
| Auth | **Quebrado** | `register.usecase.ts` cria tenant + profile (vaza para tenant/identity) |
| Catalog | **Bom** | Nenhum cross-module dependency |
| Inventory | **Bom** | Depende apenas de Catalog indiretamente (product_id FK) |
| Billing | **Bom** | Só toca Asaas Gateway + tenant.subscription_status |
| API-Public | **Excelente** | Completamente isolado |

#### 1.3 Multi-tenancy — Implementação Robusta

**Avaliação: 8/10** — O tenant isolation via RLS + `get_user_tenant_id()` é correto. Todos os endpoints verificam tenant_id. Pontos de melhoria:

- `src/infrastructure/http/middleware.ts:35-42`: middleware só checa sessão, não extrai tenant_id para o request context
- `app/api/v1/products/route.ts`: usa service_role + verificação manual de tenant (bypassa RLS) — padrão ok mas arriscado se esquecer validação

#### 1.4 Modularidade para Microsserviços

**Avaliação: 5/10** — A estrutura DDD em `src/` permite extração futura, mas o acoplamento com o legado impede. Os modules têm dependências compartilhadas via `src/@core/` e `src/shared/` que precisariam virar pacotes. O maior bloqueador: billing depende de `lib/asaas.ts` (legado) e do módulo tenant.

---

### PILAR 2: BANCO DE DADOS E SCHEMA

#### 2.1 Padronização de Nomes

| Regra | Status | Ocorrências |
|-------|--------|-------------|
| Tabelas no plural + snake_case | ✅ OK | Todas: `tenants`, `profiles`, `categories`, `products`, `inventory_items`, `movements`, `api_keys`, `invite_codes`, `plan_configs`, `rate_limits`, `audit_log` |
| PK = `id` (uuid) | ✅ OK | Todas as tabelas |
| FK = `tabela_singular_id` | ✅ OK | `tenant_id`, `product_id`, `location_id`, `category_id`, `user_id`, `created_by` |
| `auth.users.id` referenciado | ✅ OK | `profiles.id REFERENCES auth.users(id)` |

#### 2.2 UUIDs vs IDs Sequenciais

**Decisão correta:** UUIDv4 em todas as tabelas (`gen_random_uuid()`). SaaS multi-tenant não deve usar SERIAL para não vazar volume de dados.

#### 2.3 Colunas de Auditoria

| Coluna | Obrigatória | Status |
|--------|-------------|--------|
| `created_at` | ✅ | Presente em todas as 11 tabelas |
| `updated_at` | ✅ | Presente em `products`, `inventory_items`, `plan_configs` |
| `updated_at` | ❌ **Ausente** | **Faltando em:** tenants, profiles, categories, locations, api_keys, invite_codes |
| `deleted_at` | ❌ **Ausente** | Nenhuma tabela tem soft delete verdadeiro. `archived_at` existe em products, categories, locations, mas não é universal |

#### 2.4 Problemas de Tipagem

| # | Problema | Localização | Gravidade |
|---|----------|-------------|-----------|
| P2.1 | `deleted_at` ausente em TODAS as tabelas — sem soft delete universal | Todas as migrations | **Crítico** |
| P2.2 | `updated_at` ausente em 6 de 11 tabelas | tenants, profiles, categories, locations, api_keys, invite_codes | **Alto** |
| P2.3 | `rates_limits.window_start` sem índice para cleanup | `20260627000011_rate_limiting.sql` | **Médio** |
| P2.4 | Sem índice em `products.expiration_date` e `products.batch` | Schema atual | **Médio** |
| P2.5 | `name` em categories/locations usa TEXT (sem limite) | Schema atual | **Baixo** |
| P2.6 | `handle_new_user()` usa `raw_user_meta_data` não sanitizado | `20260626000001_initial_schema.sql` | **Alto** |
| P2.7 | `unit` CHECK restringe a 7 valores (pode ser pouco flexível) | Schema `products` | **Baixo** |

#### 2.5 Views

| View | Problema |
|------|----------|
| `low_stock_products` | ✅ Correta — agrega por tenant com `security_invoker = true` |
| `inventory_summary` | ✅ Correta |
| `v_assets` | ✅ Correta |
| `v_admin_metrics` | ✅ Correta |
| `v_admin_activity` | ✅ Correta |

---

### PILAR 3: DESIGN PATTERNS E SOLID

#### 3.1 Anti-padrões Identificados

| # | Anti-padrão | Localização | Gravidade |
|---|-------------|-------------|-----------|
| P3.1 | **God Object**: `lib/asaas.ts` (329 lines) faz TUDO — cliente HTTP, tokenização, parsing de webhook, geração de QR code | `lib/asaas.ts` | **Alto** |
| P3.2 | **Spaghetti**: `app/(dashboard)/settings/page.tsx` (260+ lines) mistura tenant info, team management, loading/error/empty states tudo num único arquivo | `app/(dashboard)/settings/page.tsx` | **Alto** |
| P3.3 | **Singleton Pattern abusivo**: `lib/supabase/client.ts` e `lib/supabase/server.ts` criam clientes toda vez que chamados (sem singleton/lazy singleton) | `lib/supabase/client.ts` | **Médio** |
| P3.4 | **Spaghetti**: `hooks/use-inventory.ts` (92 lines) mistura busca, filtro, paginação, status filter (que nem implementa) | `hooks/use-inventory.ts` | **Médio** |
| P3.5 | **Duplicated Interface**: `MenuPanelProps` declarada duas vezes em `hooks/use-dropdown-menu.tsx:84-88` e `:90-95` | `hooks/use-dropdown-menu.tsx` | **Médio** |
| P3.6 | **Dead Code**: `status` filter definido na interface de `useInventory` mas nunca implementado | `hooks/use-inventory.ts:15-20` | **Baixo** |

#### 3.2 Single Responsibility Principle

| # | Violação | Localização |
|---|----------|-------------|
| P3.7 | `register.usecase.ts` cria **tenant + profile** (duas responsabilidades, dois módulos) | `src/modules/auth/application/register.usecase.ts:20-45` |
| P3.8 | `actions/auth.ts` duplica `register.usecase.ts` e adiciona server action responsabilidades | `app/actions/auth.ts:30-60` |
| P3.9 | `tenant-provider.tsx` faz query direta ao Supabase + gerencia estado React | `src/shared/providers/tenant-provider.tsx:30-60` |

#### 3.3 Open/Closed Principle

| # | Violação | Localização |
|---|----------|-------------|
| P3.10 | Adicionar novo tipo de movimentação requer alterar CHECK, use cases, tipos, validações — sem extensão via Strategy | `src/modules/inventory/domain/movement.types.ts` |
| P3.11 | Adicionar nova forma de pagamento requer alterar todo `lib/asaas.ts` — sem Strategy Pattern | `lib/asaas.ts` |

#### 3.4 Dependency Inversion Principle

| Módulo | Use Case | DIP OK? |
|--------|----------|---------|
| Auth | `login.usecase.ts` | ❌ **Cria `createClient()` inline** |
| Auth | `register.usecase.ts` | ❌ **Cria `createClient()` inline** |
| Tenant | `get-tenant-config.usecase.ts` | ✅ Recebe `supabase` por parâmetro |
| Catalog | `create-product.usecase.ts` | ✅ Recebe `supabase` por parâmetro |
| Catalog | `list-products.usecase.ts` | ✅ |
| Catalog | `update-product.usecase.ts` | ✅ |
| Inventory | `adjust-inventory.usecase.ts` | ✅ |
| Inventory | `list-movements.usecase.ts` | ✅ |
| Inventory | `transfer-inventory.usecase.ts` | ✅ |
| Billing | Todos | ✅ |
| Admin | Todos | ✅ |
| API-Public | Todos | ✅ |

#### 3.5 Padrões Ausentes

| Padrão | Onde é Necessário | Justificativa |
|--------|-------------------|---------------|
| **Strategy** | `inventory/domain/movement.types.ts` | Cada tipo de movimentação (in/out/transfer/count/adjustment) tem regras diferentes de validação |
| **Strategy** | `lib/asaas.ts` (métodos de pagamento) | PIX, Boleto, Cartão têm fluxos diferentes |
| **Factory** | Criação de produtos com asset_tag vs sem | Dois fluxos de criação distintos |
| **Repository Interface** | Todos os módulos | `supabase-product.repository.ts` implementa diretamente — sem `IProductRepository` para mock |

---

### PILAR 4: CLEAN CODE E QUALIDADE

#### 4.1 Nomes Genéricos

| # | Nome | Localização |
|---|------|-------------|
| P4.1 | `data` usado como nome de variável em ~40 lugares | `app/api/*/route.ts`, `hooks/*.ts` |
| P4.2 | `handle` em funções de callback sem descrição | `hooks/use-realtime.ts:35` |
| P4.3 | `info` em variáveis de estado | Vários componentes |

#### 4.2 Complexidade Ciclomática

| # | Função | Linhas | Problema |
|---|--------|--------|----------|
| P4.4 | `app/(dashboard)/settings/page.tsx` | 260+ | Mix de 3 features (tenant info, team, invites) |
| P4.5 | `lib/asaas.ts:tokenizeCreditCard()` | ~50 | Lida com dados sensíveis + parsing + HTTP |
| P4.6 | `lib/export-utils.ts:exportData()` | 186 | 4 formatos de export no mesmo switch |
| P4.7 | `hooks/use-inventory.ts` | 92 | Busca + filtro + paginação + status filter morto |
| P4.8 | `src/modules/api-public/infrastructure/supabase-api-key.repository.ts:authenticate()` | 40+ | Multiplos if/else aninhados |

**Funções acima de 20 linhas sem quebra:** ~25 ocorrências identificadas.

#### 4.3 Tipagem Fraca

| # | Problema | Localização | Gravidade |
|---|----------|-------------|-----------|
| P4.9 | `any` nos parametros do Repository Helper | `src/infrastructure/database/supabase/repository.helper.ts:15` | **Médio** | 
| P4.10 | `as unknown as T` casts | `hooks/use-inventory.ts:85`, `hooks/use-movements.ts:55` | **Médio** |
| P4.11 | `Record<string, unknown>` em callbacks de realtime | `hooks/use-realtime.ts:25` | **Baixo** |
| P4.12 | `ReturnType<typeof createBrowserClient> \| null` cast | `lib/supabase/client.ts:22` | **Médio** |

#### 4.4 Testabilidade

| Aspecto | Status |
|---------|--------|
| Injeção de dependência nos use cases | 10/12 OK (Auth falha) |
| Repository Helper permite mock | Parcial — sem interface, extende classe concreta |
| Hooks com queries diretas | **Não testáveis** — `use-products.ts`, `use-inventory.ts`, `use-movements.ts` |
| Componentes puros (UI) | **Testáveis** — sem dependências externas |
| Cobertura atual | 37 testes, 9 suites — ~5% do código |

---

### PILAR 5: SEGURANÇA (OWASP TOP 10 E APPSEC)

#### 5.1 Injeções

| # | Tipo | Localização | Risco |
|---|------|-------------|-------|
| P5.1 | **SQL Injection potencial** — `handle_new_user()` usa `raw_user_meta_data->>'tenant_name'` direto em slug sem sanitização além de regex | `20260626000001_initial_schema.sql` | **Médio** |
| P5.2 | **XSS potencial** — Toast messages e error messages renderizados sem sanitização | `components/ui/toast.tsx:80-100` | **Baixo** (React escapa por padrão) |

#### 5.2 Autenticação e Autorização

| # | Problema | Localização | Gravidade |
|---|----------|-------------|-----------|
| P5.3 | **Registro sem confirmação de email**: `email_confirm: false` permite criar contas sem verificação | `app/(auth)/register/page.tsx:35` | **Alto** |
| P5.4 | **Senha fraca**: mínimo de 6 caracteres apenas | `lib/validations.ts:registerSchema` | **Alto** |
| P5.5 | **RBAC client-side**: Admin sidebar checa `is_staff` no cliente | `components/admin/admin-sidebar.tsx:30-45` | **Alto** |
| P5.6 | **JWT session**: Supabase gerencia tokens, mas sem refresh explícito no middleware atual | `src/infrastructure/http/middleware.ts` | **Médio** |
| P5.7 | **API Key sem rotação**: sem endpoint de revogação na V1 API | `app/api/v1/products/route.ts` | **Médio** |

#### 5.3 IDOR (Insecure Direct Object Reference)

| # | Problema | Localização | Gravidade |
|---|----------|-------------|-----------|
| P5.8 | **V1 API usa service_role + verificação manual de tenant** — se esquecer validação em 1 endpoint, dados vazam entre tenants | `app/api/v1/*/route.ts` | **Crítico** |
| P5.9 | **Listagem de API keys expõe `key_prefix`** — permite brute-force offline | `lib/api/auth.ts:listApiKeys()` | **Médio** |
| P5.10 | **GET /api/v1/products sem paginação máxima** — sem `page_size` máximo, pode vazar dataset inteiro | `app/api/v1/products/route.ts` | **Médio** |

#### 5.4 Exposição de Dados Sensíveis

| # | Problema | Localização | Gravidade |
|---|----------|-------------|-----------|
| P5.11 | **PCI Compliance**: `tokenizeCreditCard()` recebe número + CVV no servidor — deveria ser tokenização client-side | `lib/asaas.ts:tokenizeCreditCard()` | **Crítico** |
| P5.12 | **Tenant type expõe chaves Asaas** no bundle do frontend | `types/index.ts:Tenant` | **Alto** |
| P5.13 | **Service role key usada em arquivo importável por client components** | `lib/api/auth.ts` | **Alto** |
| P5.14 | **webhook token comparado com `!==`** (não constant-time) | `app/api/webhooks/asaas/route.ts:25` | **Baixo** (não explorável em rede local) |

#### 5.5 Headers de Segurança

| Header | Configurado? | Localização |
|--------|-------------|-------------|
| CSP | ✅ `next.config.ts` + `vercel.json` (CSP duplicado removido) | ✅ |
| HSTS | ❌ **Ausente** | `vercel.json` + `next.config.ts` |
| X-Content-Type-Options | ✅ | `vercel.json` |
| X-Frame-Options | ✅ | `vercel.json` |
| Referrer-Policy | ✅ | `vercel.json` |

---

### PILAR 6: UX TÉCNICA E PERFORMANCE

#### 6.1 N+1 Queries

| # | Problema | Localização | Impacto |
|---|----------|-------------|---------|
| P6.1 | `hooks/use-inventory.ts:40-55` faz query separada para produtos, depois filtra inventory por IDs (2 round-trips) | `hooks/use-inventory.ts` | **Médio** |
| P6.2 | `lib/asaas.ts:getAsaasConfigForUser()` faz 2 queries (profiles -> tenants) quando 1 JOIN resolveria | `lib/asaas.ts:100-115` | **Médio** |
| P6.3 | `admin/tenants/page.tsx` faz query de tenants e profiles separadamente | `app/(admin)/admin/tenants/page.tsx` | **Médio** |

#### 6.2 Over-fetching

| # | Problema | Localização | Impacto |
|---|----------|-------------|---------|
| P6.4 | Queries com `select(*)` ou `select(*) nested` em múltiplos hooks | `hooks/use-movements.ts:35`, `hooks/use-inventory.ts:50` | **Médio** |
| P6.5 | V1 API retorna objeto Product completo (28 campos) mesmo quando só precisa de 5 | `app/api/v1/products/route.ts` | **Baixo** |

#### 6.3 Cache Ausente

| # | Recurso | Cache Necessário | Localização |
|---|---------|-----------------|-------------|
| P6.6 | `checkPlanAccess()` chamado em TODA requisição V1 — sem cache | `lib/api/v1-auth.ts:30` | **Alto** |
| P6.7 | Planos (plan_configs) mudam raramente — sem cache | `src/modules/billing/application/get-plans.usecase.ts` | **Médio** |
| P6.8 | Config de tenant (Asaas keys) — sem cache | `lib/asaas.ts:30` | **Médio** |

#### 6.4 Otimistic UI Ausente

| # | Operação | Estado Atual | Localização |
|---|----------|--------------|-------------|
| P6.9 | Ajuste de inventário | Aguarda resposta do servidor (spinner) | `app/(dashboard)/inventory/page.tsx` |
| P6.10 | Criação de produto | Aguarda resposta | `app/(dashboard)/products/page.tsx` |

#### 6.5 Estados de UI Críticos

| # | Estado | Presente? | Localização |
|---|--------|-----------|-------------|
| P6.11 | **Skeleton Loading** | ❌ **Ausente na maioria das páginas** | `app/(dashboard)/products/page.tsx`, `app/(dashboard)/inventory/page.tsx` |
| P6.12 | **Error Boundary** | ✅ Presente em `app/error.tsx` | ✅ |
| P6.13 | **Empty State** | ❌ **Ausente** em products, inventory, movements | `app/(dashboard)/products/page.tsx` |
| P6.14 | **Loading State** | Parcial — alguns com `loading`, outros sem | Variado |

---

### PILAR 7: OBSERVABILIDADE E MONITORAMENTO

#### 7.1 Logs

| # | Problema | Localização | Gravidade |
|---|----------|-------------|-----------|
| P7.1 | **Logs são `console.log`/`console.error` puros** — sem formato JSON, sem estrutura | Em todo o código | **Alto** |
| P7.2 | **Sem `trace_id`**, `user_id` ou `tenant_id` nos logs | Todos os logs | **Alto** |
| P7.3 | Erros engolidos silenciosamente em `try/catch` vazios | `lib/supabase/server.ts:25`, `lib/supabase/proxy.ts:40` | **Médio** |
| P7.4 | Sem logs estruturados em webhooks (debugging impossível) | `app/api/webhooks/asaas/route.ts` | **Médio** |

#### 7.2 Rastreamento Distribuído

| Aspecto | Status |
|---------|--------|
| Distributed Tracing (OpenTelemetry) | ❌ **Ausente** |
| Request ID tracking | ❌ **Ausente** |
| Correlation ID across services | ❌ **Ausente** |

#### 7.3 Global Error Handler

| Aspecto | Status |
|---------|--------|
| `app/error.tsx` (Next.js Error Boundary) | ✅ **Presente** |
| Sentry/Datadog/APM integration | ❌ **Ausente** |
| Unhandled rejection handler | ❌ **Ausente** |
| Uncaught exception handler | ❌ **Ausente** |

---

## PARTE III: TASK LIST EXECUTIVA

---

### FASE 1 — ESTRUTURA E BANCO (Prioridade Máxima)

---

**[T1.1]** - **P0 Crítico**
- **Pilar:** 2 (Banco de Dados)
- **Título:** Implementar Soft Delete Universal com `deleted_at`
- **Arquivos Alvo:** 
  - `supabase/migrations/20260628000005_soft_delete.sql` (nova migration)
  - `src/modules/*/domain/*.types.ts` (atualizar interfaces)
  - `src/@core/types/api.ts` (parâmetros de filtro include_deleted)
- **Contexto/Problema:** Nenhuma tabela tem soft delete universal. Apenas `archived_at` em products, categories, locations. Dados são fisicamente deletados em DELETE, impossibilitando recovery audit trail.
- **Especificação da Solução:** 
  1. Criar migration adicionando `deleted_at timestamptz` a: tenants, profiles, categories, locations, products, inventory_items, movements, api_keys, invite_codes, audit_log
  2. Atualizar todas as RLS policies de DELETE para fazer SET deleted_at = now()
  3. Atualizar todas as RLS policies de SELECT para filtrar WHERE deleted_at IS NULL (com exceção de admins/staff)
  4. Atualizar interfaces TypeScript nos módulos correspondentes

---

**[T1.2]** - **P0 Crítico**
- **Pilar:** 5 (Segurança)
- **Título:** Remover Tokenização de Cartão do Servidor (PCI Compliance)
- **Arquivos Alvo:** 
  - `lib/asaas.ts` (função `tokenizeCreditCard`)
  - `app/api/payments/asaas/checkout/route.ts`
- **Contexto/Problema:** `tokenizeCreditCard()` recebe número completo, CVV, titular e validade no servidor. Isso coloca a aplicação dentro do escopo PCI-DSS, exigindo auditoria anual, SAQ-D e potencialmente multas por não conformidade.
- **Especificação da Solução:** 
  1. Substituir tokenização server-side por Asaas Checkout透明 (transparent checkout) ou Asaas Card Tokenization client-side (JavaScript)
  2. Remover `tokenizeCreditCard()` de `lib/asaas.ts`
  3. Atualizar checkout flow para redirecionar ao Asaas Checkout em vez de processar cartão no servidor

---

**[T1.3]** - **P0 Crítico**
- **Pilar:** 2 (Banco de Dados)
- **Título:** Adicionar `updated_at` ausente em 6 tabelas
- **Arquivos Alvo:** 
  - `supabase/migrations/20260628000005_soft_delete.sql` (mesma migration)
- **Contexto/Problema:** tenants, profiles, categories, locations, api_keys, invite_codes não têm `updated_at`, impossibilitando rastreamento de alterações.
- **Especificação da Solução:** Adicionar `updated_at timestamptz NOT NULL DEFAULT now()` + trigger `BEFORE UPDATE` para cada tabela na mesma migration do soft delete.

---

**[T1.4]** - **P1 Alto**
- **Pilar:** 1 (Arquitetura)
- **Título:** Migrar Server Actions para Usar Use Cases (Eliminar Duplicação)
- **Arquivos Alvo:** 
  - `app/actions/auth.ts` (reescrever para delegar)
  - `src/modules/auth/application/register.usecase.ts` (refatorar para receber supabase client)
  - `src/modules/auth/application/login.usecase.ts` (refatorar para receber supabase client)
- **Contexto/Problema:** `app/actions/auth.ts` duplica toda a lógica de `register.usecase.ts` (criação de tenant, profile, rollback). Manutenção duplicada = bugs garantidos.
- **Especificação da Solução:** 
  1. Refatorar `login.usecase.ts` e `register.usecase.ts` para receber `supabase` como parâmetro (DIP)
  2. Refatorar `app/actions/auth.ts` para importar e chamar os use cases com o client adequado
  3. Remover lógica duplicada de `app/actions/auth.ts`

---

**[T1.5]** - **P1 Alto**
- **Pilar:** 2 (Banco de Dados)
- **Título:** Sanitizar `handle_new_user()` contra injeção via metadata
- **Arquivos Alvo:**
  - `supabase/migrations/20260628000005_soft_delete.sql` (recrear função)
- **Contexto/Problema:** `handle_new_user()` usa `raw_user_meta_data->>'tenant_name'` diretamente para gerar slug sem validação além de regex. Usuário malicioso pode registrar com nome que gere slug malicioso.
- **Especificação da Solução:** Recrear `handle_new_user()` com:
  1. Validação de tamanho máximo do nome (100 chars)
  2. Sanitização do slug com regex mais restritiva `^[a-z0-9-]+$`
  3. Fallback para `tenant-{UUID}` se slug gerado for vazio ou inválido
  4. Loop com sufixo numérico se slug já existir

---

**[T1.6]** - **P1 Alto**
- **Pilar:** 5 (Segurança)
- **Título:** Fortalecer Registro (Email Verification + Senha Forte)
- **Arquivos Alvo:**
  - `app/(auth)/register/page.tsx`
  - `lib/validations.ts` (registerSchema)
  - `src/modules/auth/presentation/components/register-form.tsx`
- **Contexto/Problema:** `email_confirm: false` permite criar contas sem verificação de email. Senha mínima de 6 caracteres é fraca.
- **Especificação da Solução:**
  1. Alterar `email_confirm` para `true` no registro
  2. Aumentar senha mínima para 8 caracteres com requisito de maiúscula + número
  3. Atualizar `registerSchema` e `register-form.tsx` com as novas regras

---

### FASE 2 — SOLID E CLEAN CODE

---

**[T2.1]** - **P1 Alto**
- **Pilar:** 3 (Design Patterns)
- **Título:** Refatorar Hooks de Apresentação para Usar Use Cases
- **Arquivos Alvo:**
  - `src/modules/catalog/presentation/hooks/use-products.ts`
  - `src/modules/inventory/presentation/hooks/use-inventory.ts`
  - `src/modules/inventory/presentation/hooks/use-movements.ts`
  - `hooks/use-inventory.ts` (legado - remover)
  - `hooks/use-movements.ts` (legado - remover)
- **Contexto/Problema:** Hooks fazem `getBrowserClient().from("products").select(...)` direto — bypassam use cases, domain validation, e acoplam presentation a infrastructure.
- **Especificação da Solução:**
  1. Refatorar `use-products.ts` para aceitar um `createProductUseCase` ou `listProductsUseCase` por parâmetro (DIP)
  2. Criar adapter pattern para injetar implementação concreta (SupabaseProductRepository)
  3. Implementar testes mockando os use cases
  4. Remover hooks legados após migração

---

**[T2.2]** - **P1 Alto**
- **Pilar:** 3 (Design Patterns)
- **Título:** Aplicar Strategy Pattern para Tipos de Movimentação
- **Arquivos Alvo:**
  - `src/modules/inventory/domain/movement.types.ts`
  - `src/modules/inventory/application/adjust-inventory.usecase.ts`
  - `src/modules/inventory/domain/strategies/` (novo)
- **Contexto/Problema:** Cada tipo de movimentação (in/out/transfer/adjustment/count) tem regras diferentes de validação, mas estão todas num switch gigante. Nova movimentação = alterar código existente (OCP violation).
- **Especificação da Solução:**
  1. Criar interface `MovementStrategy { validate(): void; execute(): Promise<void> }`
  2. Implementar `InMovementStrategy`, `OutMovementStrategy`, `TransferMovementStrategy`, `AdjustmentMovementStrategy`, `CountMovementStrategy`
  3. Criar `MovementStrategyFactory` que retorna a strategy baseada no tipo
  4. Refatorar `adjust-inventory.usecase.ts` para usar a factory

---

**[T2.3]** - **P1 Alto**
- **Pilar:** 3 (Design Patterns)
- **Título:** Extrair Asaas God Object para Múltiplos Services
- **Arquivos Alvo:**
  - `lib/asaas.ts` (quebrar em 4+ arquivos)
  - `src/modules/billing/infrastructure/` (mover para cá)
- **Contexto/Problema:** `lib/asaas.ts` tem 329 linhas, 12 funções exportadas, mistura HTTP client, parsing, tokenização. Violação de Single Responsibility.
- **Especificação da Solução:**
  1. `asaas.client.ts` — HTTP client base (fetch wrapper com timeout/retry)
  2. `asaas.customer.ts` — create/get customer
  3. `asaas.subscription.ts` — create/cancel subscription
  4. `asaas.payment.ts` — get/list payments, PIX QR code
  5. `asaas.webhook.ts` — webhook signature verification + event parsing
  6. Manter barrel export para backward compatibility temporária

---

**[T2.4]** - **P2 Médio**
- **Pilar:** 4 (Clean Code)
- **Título:** Quebrar Settings Page (260+ linhas) em Componentes Menores
- **Arquivos Alvo:**
  - `app/(dashboard)/settings/page.tsx`
  - `src/modules/tenant/presentation/components/` (novos: tenant-info.tsx, team-list.tsx, invite-form.tsx)
- **Contexto/Problema:** Página de configurações mistura 3 features distintas num único arquivo, dificultando manutenção e teste.
- **Especificação da Solução:**
  1. Extrair `TenantInfoForm` — nome, CNPJ, locale
  2. Extrair `TeamMemberList` — listagem de membros com funções
  3. Extrair `InviteMemberForm` — formulário de convite
  4. Cada componente em arquivo separado com sua própria lógica de loading/error/empty

---

**[T2.5]** - **P2 Médio**
- **Pilar:** 4 (Clean Code)
- **Título:** Eliminar `any` e `as unknown as T` do código
- **Arquivos Alvo:**
  - `src/infrastructure/database/supabase/repository.helper.ts`
  - `hooks/use-inventory.ts`
  - `hooks/use-movements.ts`
  - `lib/supabase/client.ts`
- **Contexto/Problema:** Type safety escapatórios permitem erros em runtime que poderiam ser pegos em compile-time.
- **Especificação da Solução:**
  1. Criar interfaces genéricas tipadas para Repository Helper (`SupabaseRepository<T>`)
  2. Substituir `any` por `T extends Record<string, unknown>`
  3. Substituir `as unknown as T` por zod validation ou type guards
  4. Eliminar `null as unknown as ReturnType<...>` no client.ts com overloads

---

**[T2.6]** - **P2 Médio**
- **Pilar:** 3 (Design Patterns)
- **Título:** Criar Interfaces de Repository para Testabilidade (DIP)
- **Arquivos Alvo:**
  - `src/modules/*/domain/repositories/` (novo)
  - `src/modules/*/infrastructure/*.repository.ts` (implementar interfaces)
- **Contexto/Problema:** Repositories estendem `SupabaseRepository` concreto sem interface. Impossível mockar para testes unitários sem dependência real do Supabase.
- **Especificação da Solução:**
  1. Criar `IProductRepository`, `IInventoryRepository`, `IMovementRepository`, `ITenantRepository`, `IApiKeyRepository`, etc.
  2. Implementar interfaces nos repositories concretos
  3. Atualizar use cases para depender das interfaces, não das implementações concretas

---

### FASE 3 — SEGURANÇA E PERFORMANCE

---

**[T3.1]** - **P0 Crítico**
- **Pilar:** 5 (Segurança)
- **Título:** Remover Chaves Asaas do Tipo Tenant Exposto ao Frontend
- **Arquivos Alvo:**
  - `types/index.ts` (criar `TenantPublic` vs `TenantPrivate`)
  - `src/modules/tenant/domain/tenant.types.ts` (separar tipos)
  - `src/shared/providers/tenant-provider.tsx`
- **Contexto/Problema:** O tipo `Tenant` exportado de `types/index.ts` inclui `asaas_api_key_sandbox`, `asaas_api_key_production`, e secrets de webhook. Se esse tipo for importado em um client component, as chaves vazam para o bundle do navegador.
- **Especificação da Solução:**
  1. Separar `Tenant` em `TenantPublic` (dados seguros para frontend) e `TenantPrivate` (inclui chaves)
  2. Garantir que `TenantPublic` seja o único tipo usado em client components
  3. Adicionar validação no backend para nunca retornar chaves em endpoints públicos

---

**[T3.2]** - **P1 Alto**
- **Pilar:** 5 (Segurança)
- **Título:** Garantir que `lib/api/auth.ts` seja Server-Only
- **Arquivos Alvo:**
  - `lib/api/auth.ts` (adicionar `server-only` import)
- **Contexto/Problema:** `lib/api/auth.ts` usa `SUPABASE_SERVICE_ROLE_KEY` e é importável por client components. Se um client component importar este arquivo, a service role key vaza.
- **Especificação da Solução:**
  1. Adicionar `import 'server-only'` no topo do arquivo
  2. Verificar todos os imports do arquivo e garantir que só sejam usados em server components e route handlers

---

**[T3.3]** - **P1 Alto**
- **Pilar:** 5 (Segurança)
- **Título:** Implementar HSTS Header
- **Arquivos Alvo:**
  - `next.config.ts`
  - `vercel.json`
- **Contexto/Problema:** Sem HSTS (`Strict-Transport-Security`), conexões podem ser rebaixadas para HTTP em ataques MITM.
- **Especificação da Solução:** Adicionar `Strict-Transport-Security: max-age=63072000; includeSubDomains; preload` nos headers de `next.config.ts` e `vercel.json`.

---

**[T3.4]** - **P1 Alto**
- **Pilar:** 6 (Performance)
- **Título:** Implementar Cache para `checkPlanAccess()` e Plan Configs
- **Arquivos Alvo:**
  - `lib/api/v1-auth.ts`
  - `src/modules/billing/application/get-plans.usecase.ts`
- **Contexto/Problema:** `checkPlanAccess()` faz query no banco em TODA requisição V1. Planos mudam raramente (dias/semanas). Sem cache, cada requisição paga 1-5ms de latência de DB.
- **Especificação da Solução:**
  1. Implementar in-memory cache (`Map<string, { data, expiry }>`) com TTL de 5 minutos
  2. Para serverless (Vercel), considerar `@upstash/redis` como cache compartilhado
  3. Invalidar cache quando planos forem alterados via admin

---

**[T3.5]** - **P2 Médio**
- **Pilar:** 5 (Segurança)
- **Título:** Adicionar Rate Limiting na V1 API
- **Arquivos Alvo:**
  - `src/modules/api-public/presentation/middleware/auth.ts`
  - `app/api/v1/*/route.ts`
- **Contexto/Problema:** V1 API não tem rate limiting próprio. Apenas criação de produto tem limite (60/min). Endpoints de GET podem ser abusados.
- **Especificação da Solução:**
  1. Adicionar rate limiting por API key no middleware `withAuth()`
  2. Limites por plano: Starter 60 req/min, Pro 120 req/min
  3. Usar `check_rate_limit` RPC (já existe) ou Redis

---

**[T3.6]** - **P2 Médio**
- **Pilar:** 6 (Performance)
- **Título:** Adicionar Skeleton Loading + Empty States nas Páginas CRUD
- **Arquivos Alvo:**
  - `app/(dashboard)/products/page.tsx`
  - `app/(dashboard)/inventory/page.tsx`
  - `app/(dashboard)/movements/page.tsx`
  - `app/(dashboard)/categories/page.tsx`
  - `app/(dashboard)/locations/page.tsx`
- **Contexto/Problema:** Páginas CRUD não têm skeleton loading (apenas "Carregando..." textual) nem empty states quando não há dados.
- **Especificação da Solução:**
  1. Criar componente `TableSkeleton` (linhas pulsantes) e `CardSkeleton`
  2. Criar componente `EmptyState` com ilustração + CTA (ex: "Nenhum produto cadastrado. Crie o primeiro!")
  3. Aplicar em todas as 5 páginas listadas

---

**[T3.7]** - **P3 Baixo**
- **Pilar:** 6 (Performance)
- **Título:** Adicionar Índices para Queries Frequentes
- **Arquivos Alvo:**
  - `supabase/migrations/20260628000006_indexes.sql` (nova migration)
- **Contexto/Problema:** `rate_limits.window_start` sem índice para cleanup, `products.expiration_date` e `batch` sem índice para queries de relatório.
- **Especificação da Solução:**
  1. `idx_rate_limits_cleanup ON rate_limits(window_start)` para queries de DELETE
  2. `idx_products_expiration ON products(tenant_id, expiration_date)` para relatórios
  3. `idx_products_batch ON products(tenant_id, batch)` para busca por lote

---

### FASE 4 — OBSERVABILIDADE

---

**[T4.1]** - **P1 Alto**
- **Pilar:** 7 (Observabilidade)
- **Título:** Implementar Logger Estruturado com Contexto
- **Arquivos Alvo:**
  - `src/@core/logger/index.ts` (novo)
  - `src/infrastructure/http/middleware.ts` (adicionar request-id)
  - Todos os route handlers e use cases (substituir console.log)
- **Contexto/Problema:** Logs são `console.log`/`console.error` sem estrutura, sem `trace_id`, `user_id`, `tenant_id`. Impossível correlacionar eventos ou debugar em produção.
- **Especificação da Solução:**
  1. Criar logger estruturado com formato JSON
  2. Níveis: `debug`, `info`, `warn`, `error`
  3. Contexto obrigatório: `trace_id` (gerado no middleware), `user_id`, `tenant_id`
  4. Saída: `console.log(JSON.stringify({ timestamp, level, message, trace_id, user_id, tenant_id, ...extra }))`
  5. Middleware gera `trace_id` via `crypto.randomUUID()` e injeta no request

---

**[T4.2]** - **P1 Alto**
- **Pilar:** 7 (Observabilidade)
- **Título:** Criar Global Error Handler com Report para Sentry
- **Arquivos Alvo:**
  - `app/error.tsx` (melhorar com reporting)
  - `src/infrastructure/http/error-handler.ts` (novo — handler unificado para API routes)
- **Contexto/Problema:** Erros em API routes são tratados individualmente com `try/catch` que retorna `{ error: message }`. Erros em background jobs (webhooks) são silenciosamente engolidos. Sem integração com APM/Sentry.
- **Especificação da Solução:**
  1. Criar `errorHandler(fn: HandlerFunction)` wrapper que captura exceções, loga estruturado, e retorna resposta padronizada
  2. Adicionar `@sentry/nextjs` para captura de exceções não tratadas
  3. Garantir que `app/error.tsx` reporte o erro antes de mostrar UI de fallback
  4. Adicionar `process.on('unhandledRejection')` handler global

---

**[T4.3]** - **P2 Médio**
- **Pilar:** 7 (Observabilidade)
- **Título:** Estruturar Logs de Webhook para Debugging
- **Arquivos Alvo:**
  - `app/api/webhooks/asaas/route.ts`
  - `src/modules/billing/application/handle-webhook.usecase.ts`
- **Contexto/Problema:** Webhooks do Asaas não têm logging estruturado — quando um webhook falha, não há como debugar sem acesso ao dashboard do Asaas.
- **Especificação da Solução:**
  1. Logar entrada do webhook com `event`, `payment_id`, `subscription_id`
  2. Logar saída com status do processamento
  3. Registrar webhooks rejeitados (token inválido) como `warn` com detalhes do header

---

**[T4.4]** - **P3 Baixo**
- **Pilar:** 7 (Observabilidade)
- **Título:** Adicionar Métricas de Negócio (Datadog/Prometheus)
- **Arquivos Alvo:**
  - `src/infrastructure/observability/metrics.ts` (novo)
  - `src/modules/*/application/*.usecase.ts` (adicionar métricas)
- **Contexto/Problema:** Sem métricas de negócio — número de produtos criados, movimentações, registros, etc. Impossível monitorar saúde do negócio.
- **Especificação da Solução:**
  1. Definir métricas-chave: `signups`, `products_created`, `inventory_adjustments`, `api_requests`, `webhooks_processed`
  2. Implementar `trackMetric(name, value, tags)` que envia para stdout estruturado (ou Datadog via API)
  3. Adicionar tracking nos use cases principais

---

## Sumário da Task List

| Fase | Tarefas | P0 | P1 | P2 | P3 |
|------|---------|----|----|----|----|
| **1 — Estrutura e Banco** | 6 | 3 | 3 | 0 | 0 |
| **2 — SOLID e Clean Code** | 6 | 0 | 3 | 3 | 0 |
| **3 — Segurança e Performance** | 7 | 1 | 3 | 2 | 1 |
| **4 — Observabilidade** | 4 | 0 | 2 | 1 | 1 |
| **Total** | **23** | **4** | **11** | **6** | **2** |

---

*Documento gerado em 28/06/2026 — Auditoria arquitetural completa do repositório INVENTOY.*
