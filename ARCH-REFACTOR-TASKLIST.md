# 🏗️ INVENTOY — Plano de Ação: 3.3 → 10/10

> **Meta:** Transformar a arquitetura de protótipo em um sistema SaaS profissional, modular, seguro e testável.
> **Estratégia:** Feature-Based Clean Architecture com módulos DDD, sem refatoração agressiva — cada fase é incremental e não quebra o sistema em produção.
> **Projeto Supabase vinculado:** `mjkeznlmhtskrekywnfg` (INVENTOY)

---

## 📊 Scoreboard da Jornada

| Fase | Área | Antes | Depois | Esforço |
|------|------|-------|--------|---------|
| Fase 1 | Estrutura de Pastas | 3/10 | 9/10 | ⭐ Médio |
| Fase 2 | Separação de Domínios (DDD) | 2/10 | 10/10 | 🚀 Alto |
| Fase 3 | Multi-tenancy & RLS | 5/10 | 10/10 | 🔥 Crítico |
| Fase 4 | Segurança (AppSec) | 5/10 | 10/10 | 🔥 Crítico |
| Fase 5 | Manutenibilidade | 3/10 | 9/10 | ⭐ Médio |
| Fase 6 | Testabilidade | 2/10 | 9/10 | 🚀 Alto |
| **Final** | **Geral** | **3.3/10** | **9.5/10** | **~14 dias** |

---

## 📋 LEGENDA

| Símbolo | Significado |
|---------|-------------|
| ✅ | Tarefa concluída |
| ⬜ | Tarefa a fazer |
| 🔴 | Bloqueante — precisa ser feito antes |
| 🟡 | Importante mas não bloqueante |
| 🟢 | Melhoria contínua |
| 🐳 | Comando Supabase CLI necessário |
| ⚠️ | Risco alto se ignorado |

---

# 🏁 FASE 0 — PREPARAÇÃO DO AMBIENTE

> **Objetivo:** Garantir que o Supabase CLI está conectado e o sistema compila sem erros antes de começar.

- [ ] ⬜ **0.1** Verificar conexão do Supabase CLI `supabase link --project-ref mjkeznlmhtskrekywnfg`
- [ ] ⬜ **0.2** Criar branch de trabalho no git `git checkout -b refactor/arch-10x`
- [ ] ⬜ **0.3** Rodar `npm run build` e garantir que compila (baseline)
- [ ] ⬜ **0.4** Rodar `npx playwright test` e garantir que os e2e passam (baseline)

---

# 🏗️ FASE 1 — FUNDAÇÃO: NOVA ESTRUTURA DE PASTAS

> **Objetivo:** Criar a espinha dorsal da arquitetura sem mover código ainda. Apenas criar diretórios e arquivos de configuração.

## 1.1 Criar esqueleto `src/` e `@core/`

- [ ] ⬜ **1.1.1** Criar diretório `src/` na raiz
- [ ] ⬜ **1.1.2** Criar `src/@core/types/api.ts` — tipos genéricos (`PaginatedResponse<T>`, `ApiError`, `ApiSuccess<T>`)
- [ ] ⬜ **1.1.3** Criar `src/@core/types/index.ts` — barrel export
- [ ] ⬜ **1.1.4** Criar `src/@core/errors/app-error.ts` — classe `AppError` com `statusCode`, `code`, `details`
- [ ] ⬜ **1.1.5** Criar `src/@core/errors/auth-error.ts` — extends `AppError` status 401
- [ ] ⬜ **1.1.6** Criar `src/@core/errors/not-found-error.ts` — extends `AppError` status 404
- [ ] ⬜ **1.1.7** Criar `src/@core/errors/validation-error.ts` — extends `AppError` status 400
- [ ] ⬜ **1.1.8** Criar `src/@core/errors/index.ts` — barrel
- [ ] ⬜ **1.1.9** Criar `src/@core/utils/cn.ts` — mover `cn()` de `lib/utils.ts`
- [ ] ⬜ **1.1.10** Criar `src/@core/utils/date.ts` — mover `formatDate`, `formatDateShort`, `calculateDaysUntil`
- [ ] ⬜ **1.1.11** Criar `src/@core/utils/number.ts` — mover `formatCurrency`, `generateSku`
- [ ] ⬜ **1.1.12** Criar `src/@core/utils/string.ts` — mover `truncate`, adicionar `slugify`, `maskCpf`, `maskCnpj`
- [ ] ⬜ **1.1.13** Criar `src/@core/utils/debounce.ts` — mover `debounce` de `lib/utils.ts`
- [ ] ⬜ **1.1.14** Criar `src/@core/utils/index.ts` — barrel

## 1.2 Criar estrutura de módulos vazia

- [ ] ⬜ **1.2.1** Criar `src/modules/auth/` com subpastas: `domain/`, `application/`, `infrastructure/`, `presentation/`
- [ ] ⬜ **1.2.2** Criar `src/modules/tenant/` com subpastas: `domain/`, `application/`, `infrastructure/`, `presentation/`
- [ ] ⬜ **1.2.3** Criar `src/modules/identity/` com subpastas: `domain/`, `application/`, `infrastructure/`, `presentation/`
- [ ] ⬜ **1.2.4** Criar `src/modules/catalog/` com subpastas: `domain/`, `application/`, `infrastructure/`, `presentation/`
- [ ] ⬜ **1.2.5** Criar `src/modules/inventory/` com subpastas: `domain/`, `application/`, `infrastructure/`, `presentation/`
- [ ] ⬜ **1.2.6** Criar `src/modules/billing/` com subpastas: `domain/`, `application/`, `infrastructure/`, `presentation/`
- [ ] ⬜ **1.2.7** Criar `src/modules/admin/` com subpastas: `domain/`, `application/`, `infrastructure/`, `presentation/`
- [ ] ⬜ **1.2.8** Criar `src/modules/api-public/` com subpastas: `domain/`, `application/`, `infrastructure/`, `presentation/`

## 1.3 Criar infraestrutura global

- [ ] ⬜ **1.3.1** Criar `src/infrastructure/database/supabase/client.ts` — Factory centralizada (browser, server, admin)
- [ ] ⬜ **1.3.2** Criar `src/infrastructure/database/supabase/repository.helper.ts` — Classe base `SupabaseRepository`
- [ ] ⬜ **1.3.3** Criar `src/infrastructure/http/rate-limiter.ts` — Refatorado (fail-closed, chama RPC function)
- [ ] ⬜ **1.3.4** Criar `src/infrastructure/http/middleware.ts` — (antigo `proxy.ts`) + helpers
- [ ] ⬜ **1.3.5** Criar `src/infrastructure/logger.ts` — Logger estruturado

## 1.4 Criar `shared/` (componentes compartilhados)

- [ ] ⬜ **1.4.1** Criar `src/shared/ui/` — Mover `components/ui/` (button, card, dialog, input, label, select, table, toast, badge, filter-bar)
- [ ] ⬜ **1.4.2** Criar `src/shared/providers/theme-provider.tsx` — Mover de `components/providers.tsx`
- [ ] ⬜ **1.4.3** Criar `src/shared/providers/tenant-provider.tsx` — **NOVO**: contexto centralizado de tenant
- [ ] ⬜ **1.4.4** Criar `src/shared/providers/index.ts` — barrel

## 1.5 Atualizar `tsconfig.json`

- [ ] ⬜ **1.5.1** Adicionar path aliases para `@core/*`, `@modules/*`, `@infra/*`, `@shared/*`
- [ ] ⬜ **1.5.2** Atualizar `include` para cobrir `src/`

---

# 🧩 FASE 2 — EXTRAÇÃO DOS MÓDULOS DE DOMÍNIO (DDD)

> **Objetivo:** Extrair e organizar cada domínio de negócio em módulos autocontidos.
> ⚠️ Regra: Crie PRIMEIRO os types/domain, depois infrastructure, depois application, e por fim presentation. NUNCA use SERVICE_ROLE em route handlers.

## 2.1 Módulo `auth`

- [ ] ⬜ **2.1.1** Criar `modules/auth/domain/auth.types.ts` — `LoginRequest`, `RegisterRequest`, `AuthSession`
- [ ] ⬜ **2.1.2** Criar `modules/auth/domain/auth.errors.ts`
- [ ] ⬜ **2.1.3** Criar `modules/auth/application/login.usecase.ts` — validar schema Zod, chamar Supabase signInWithPassword
- [ ] ⬜ **2.1.4** Criar `modules/auth/application/register.usecase.ts` — criar auth user + tenant + profile
- [ ] ⬜ **2.1.5** Criar `modules/auth/infrastructure/supabase-auth.repository.ts`
- [ ] ⬜ **2.1.6** Criar `modules/auth/presentation/actions/auth.ts` — Server Actions (mover de `app/actions/auth.ts`)
- [ ] ⬜ **2.1.7** Criar `modules/auth/presentation/components/login-form.tsx`
- [ ] ⬜ **2.1.8** Criar `modules/auth/presentation/components/register-form.tsx`
- [ ] ⬜ **2.1.9** Atualizar `app/(auth)/login/page.tsx` para usar componentes do módulo
- [ ] ⬜ **2.1.10** Atualizar `app/(auth)/register/page.tsx` para usar componentes do módulo

## 2.2 Módulo `tenant`

- [ ] ⬜ **2.2.1** Criar `modules/tenant/domain/tenant.types.ts` — extrair `Tenant`, `TenantConfig` de `types/index.ts`
- [ ] ⬜ **2.2.2** Criar `modules/tenant/domain/tenant-id.value-object.ts` — Value Object imutável
- [ ] ⬜ **2.2.3** Criar `modules/tenant/application/get-tenant-config.usecase.ts`
- [ ] ⬜ **2.2.4** Criar `modules/tenant/infrastructure/supabase-tenant.repository.ts`
- [ ] ⬜ **2.2.5** Criar `modules/tenant/presentation/hooks/use-tenant.ts` — Hook + Context que resolve tenant UMA ÚNICA VEZ

## 2.3 Módulo `identity`

- [ ] ⬜ **2.3.1** Criar `modules/identity/domain/identity.types.ts` — `Profile`, `Role`, `User`
- [ ] ⬜ **2.3.2** Criar `modules/identity/application/get-profile.usecase.ts`
## 2.4 Módulo `catalog`

- [ ] ⬜ **2.4.1** Criar `modules/catalog/domain/product.types.ts` — `Product`, `Unit`, `Condition`
- [ ] ⬜ **2.4.2** Criar `modules/catalog/domain/category.types.ts` — `Category`
- [ ] ⬜ **2.4.3** Criar `modules/catalog/domain/product.errors.ts`
- [ ] ⬜ **2.4.4** Criar `modules/catalog/domain/product-id.value-object.ts`
- [ ] ⬜ **2.4.5** Criar `modules/catalog/application/create-product.usecase.ts` — validar schema → chamar `api_create_product()` RPC
- [ ] ⬜ **2.4.6** Criar `modules/catalog/application/update-product.usecase.ts`
- [ ] ⬜ **2.4.7** Criar `modules/catalog/application/list-products.usecase.ts` — paginação + busca + filtros
- [ ] ⬜ **2.4.8** Criar `modules/catalog/infrastructure/supabase-product.repository.ts`
- [ ] ⬜ **2.4.9** Criar `modules/catalog/infrastructure/supabase-category.repository.ts`
- [ ] ⬜ **2.4.10** Criar `modules/catalog/presentation/hooks/use-products.ts`
- [ ] ⬜ **2.4.11** Criar `modules/catalog/presentation/validations/product.schema.ts`

## 2.5 Módulo `inventory`

- [ ] ⬜ **2.5.1** Criar `modules/inventory/domain/inventory.types.ts` — `InventoryItem`
- [ ] ⬜ **2.5.2** Criar `modules/inventory/domain/location.types.ts` — `Location`
- [ ] ⬜ **2.5.3** Criar `modules/inventory/domain/movement.types.ts` — `Movement`, `MovementType`
- [ ] ⬜ **2.5.4** Criar `modules/inventory/domain/quantity.value-object.ts` — validação (inteiro, >= 0)
- [ ] ⬜ **2.5.5** Criar `modules/inventory/application/adjust-inventory.usecase.ts`
- [ ] ⬜ **2.5.6** Criar `modules/inventory/application/transfer-inventory.usecase.ts`
- [ ] ⬜ **2.5.7** Criar `modules/inventory/application/list-movements.usecase.ts`
- [ ] ⬜ **2.5.8** Criar `modules/inventory/infrastructure/supabase-inventory.repository.ts`
- [ ] ⬜ **2.5.9** Criar `modules/inventory/infrastructure/supabase-movement.repository.ts`
- [ ] ⬜ **2.5.10** Criar `modules/inventory/infrastructure/supabase-location.repository.ts`
- [ ] ⬜ **2.5.11** Criar `modules/inventory/presentation/hooks/use-inventory.ts` — refatorado
- [ ] ⬜ **2.5.12** Criar `modules/inventory/presentation/hooks/use-movements.ts` — refatorado
- [ ] ⬜ **2.5.13** Criar `modules/inventory/presentation/hooks/use-realtime.ts` — mover de `hooks/use-realtime.ts`

## 2.6 Módulo `billing`

- [ ] ⬜ **2.6.1** Criar `modules/billing/domain/plan.types.ts` — `Plan`, `PlanConfig`
- [ ] ⬜ **2.6.2** Criar `modules/billing/domain/subscription.types.ts`
- [ ] ⬜ **2.6.3** Criar `modules/billing/domain/payment.types.ts`
- [ ] ⬜ **2.6.4** Criar `modules/billing/domain/asaas.types.ts` — Tipos específicos da Asaas
- [ ] ⬜ **2.6.5** Criar `modules/billing/domain/billing.errors.ts`
- [ ] ⬜ **2.6.6** Criar `modules/billing/application/get-plans.usecase.ts`
- [ ] ⬜ **2.6.7** Criar `modules/billing/application/create-subscription.usecase.ts`
- [ ] ⬜ **2.6.8** Criar `modules/billing/application/handle-webhook.usecase.ts`
- [ ] ⬜ **2.6.9** Criar `modules/billing/infrastructure/supabase-billing.repository.ts`
- [ ] ⬜ **2.6.10** Criar `modules/billing/infrastructure/asaas.gateway.ts` — extrair de `lib/asaas.ts`
- [ ] ⬜ **2.6.11** Criar `modules/billing/infrastructure/asaas.http-client.ts` — com retry, timeout, logging
- [ ] ⬜ **2.6.12** Criar `modules/billing/presentation/validations/billing.schema.ts`

## 2.7 Módulo `admin`

- [ ] ⬜ **2.7.1** Criar `modules/admin/domain/admin.types.ts` — `AdminMetrics`, `AdminActivity`
- [ ] ⬜ **2.7.2** Criar `modules/admin/domain/admin.errors.ts`
- [ ] ⬜ **2.7.3** Criar `modules/admin/application/manage-users.usecase.ts`
- [ ] ⬜ **2.7.4** Criar `modules/admin/application/manage-plans.usecase.ts`
- [ ] ⬜ **2.7.5** Criar `modules/admin/application/get-metrics.usecase.ts`
- [ ] ⬜ **2.7.6** Criar `modules/admin/infrastructure/supabase-admin.repository.ts`
- [ ] ⬜ **2.7.7** Criar `modules/admin/presentation/components/admin-sidebar.tsx`

## 2.8 Módulo `api-public`

- [ ] ⬜ **2.8.1** Criar `modules/api-public/domain/api-key.types.ts`
- [ ] ⬜ **2.8.2** Criar `modules/api-public/domain/api-key.errors.ts`
- [ ] ⬜ **2.8.3** Criar `modules/api-public/application/authenticate-api-key.usecase.ts`
- [ ] ⬜ **2.8.4** Criar `modules/api-public/application/generate-api-key.usecase.ts`
- [ ] ⬜ **2.8.5** Criar `modules/api-public/infrastructure/supabase-api-key.repository.ts`
- [ ] ⬜ **2.8.6** Criar `modules/api-public/presentation/middleware/auth.ts`
---

# 🔐 FASE 3 — SUPABASE: SEGURANÇA + MULTI-TENANCY + MIGRAÇÕES

> **Objetivo:** Eliminar o bypass indiscriminado de RLS, garantir isolamento real entre tenants e adicionar auditoria.
> 🐳 = Comando Supabase CLI necessário.

## 3.1 Auditoria de SERVICE_ROLE

- [ ] ⬜ ⚠️ **3.1.1** Mapear TODOS os locais que usam `SUPABASE_SERVICE_ROLE_KEY`
      `grep -r "SERVICE_ROLE_KEY\|service_role\|createAdminClient" --include="*.ts" --include="*.tsx" src/ app/ lib/ | grep -v node_modules`
      **Conhecidos:** `lib/supabase/admin.ts`, `lib/api/auth.ts`, `lib/asaas.ts`, `lib/rate-limiter.ts`, `app/api/v1/inventory/route.ts`, `app/api/v1/products/route.ts`, `app/api/admin/users/create/route.ts`, `app/api/admin/users/manage/route.ts`
- [ ] ⬜ 🔴 **3.1.2** SERVICE_ROLE só pode ser usado em: (1) repositórios autorizados, (2) PL/pgSQL functions, (3) webhooks — NUNCA em route handlers HTTP
- [ ] ⬜ **3.1.3** Rotas de leitura da API v1: substituir SERVICE_ROLE por `getServerClient()` (RLS resolve)
- [ ] ⬜ **3.1.4** Rotas de escrita da API v1: substituir por chamadas a `security definer` functions no banco
- [ ] ⬜ **3.1.5** `lib/rate-limiter.ts`: refatorar para usar RPC function `check_rate_limit()` em vez de query inline

## 3.2 Reforçar RLS (Row-Level Security)

- [ ] ⬜ 🐳 **3.2.1** Migration `20260628000001_enhance_rls.sql`:
      - Garantir RLS ativo em TODAS as tabelas de tenant
      - Policy padrão: `using (tenant_id = public.get_user_tenant_id())`
      - Policy para `api_keys`: tenant só vê/gerencia as próprias chaves
- [ ] ⬜ 🐳 **3.2.2** Adicionar `security_invoker = true` nas views que ainda não têm

## 3.3 Criar funções `security definer` para operações críticas

- [ ] 🐳 **3.3.1** Migration `20260628000002_admin_functions.sql`:
      ```sql
      -- Função que substitui o SERVICE_ROLE nas APIs
      create or replace function public.api_create_product(
        p_tenant_id uuid, p_sku text, p_name text,
        p_description text default null, p_category_id uuid default null,
        p_min_stock integer default 0, p_unit text default 'un',
        p_price decimal default null, p_cost decimal default null
      ) returns jsonb
      language plpgsql security definer set search_path = public as $
      declare v_product products;
      begin
        insert into products (tenant_id, sku, name, description, category_id, min_stock, unit, price, cost)
        values (p_tenant_id, p_sku, p_name, p_description, p_category_id, p_min_stock, p_unit, p_price, p_cost)
        returning * into v_product;
        return row_to_json(v_product)::jsonb;
      end;
      $;
      ```
- [ ] 🐳 **3.3.2** Criar `public.api_adjust_inventory()` — ajuste de estoque com validação de tenant
- [ ] 🐳 **3.3.3** Criar `public.api_list_products()` — listagem paginada segura
- [ ] 🐳 **3.3.4** Migration `20260628000004_rate_limiter_v2.sql` — função `check_rate_limit()` no banco

## 3.4 Auditoria e Soft Delete

- [ ] 🐳 **3.4.1** Migration `20260628000003_add_audit_log.sql`:
      ```sql
      create table if not exists public.audit_log (
        id uuid primary key default gen_random_uuid(),
        tenant_id uuid references public.tenants(id),
        user_id uuid references auth.users(id),
        action text not null,
        entity_type text not null,
        entity_id uuid,
        metadata jsonb,
        created_at timestamptz not null default now()
      );
      create index idx_audit_log_tenant on public.audit_log(tenant_id, created_at desc);
      create index idx_audit_log_user on public.audit_log(user_id, created_at desc);
      ```
- [ ] 🐳 **3.4.2** Garantir `archived_at` em products, categories, locations (soft delete)

## 3.5 Rate Limiter no Banco

- [ ] 🐳 **3.5.1** Migration `20260628000005_rate_limiter_v2.sql`:
      Criar `public.check_rate_limit(p_ip_address, p_endpoint, p_max_requests, p_window_seconds)` que retorna `jsonb` com `allowed`, `remaining`, `reset_in`
- [ ] ⬜ **3.5.2** Refatorar `src/infrastructure/http/rate-limiter.ts` para chamar a RPC function

---

# 🎯 FASE 4 — APPLICATION: USE CASES E REPOSITORIES

> **Objetivo:** Extrair toda lógica de negócio dos route handlers e páginas para Use Cases testáveis.

## 4.1 Use Cases Core

- [ ] ⬜ **4.1.1** Refatorar `login.usecase.ts` — validar com Zod, chamar Supabase auth, retornar `AuthSession` tipada
- [ ] ⬜ **4.1.2** Refatorar `register.usecase.ts` — criar user + tenant + profile em sequência atômica
- [ ] ⬜ **4.1.3** Refatorar `list-products.usecase.ts` — aceitar `PaginationParams`, `ProductFilters`, retornar `PaginatedResponse<Product>`
- [ ] ⬜ **4.1.4** Refatorar `adjust-inventory.usecase.ts` — validar Quantity, chamar `adjust_inventory()` function, retornar Movement
- [ ] ⬜ **4.1.5** Refatorar `transfer-inventory.usecase.ts` — validações de origem/destino/quantidade
- [ ] ⬜ **4.1.6** Refatorar `handle-webhook.usecase.ts` — processar evento Asaas, atualizar assinatura, log auditoria
- [ ] ⬜ **4.1.7** Refatorar `authenticate-api-key.usecase.ts` — hash + lookup + validação de expiração/revogação

## 4.2 Repository Pattern

- [ ] ⬜ **4.2.1** Criar `SupabaseRepository` (classe base abstrata) com métodos:
      - `paginate(query, page, pageSize)` → `PaginatedResponse<T>`
      - `applyTenantFilter(query, tenantId)` → `.eq('tenant_id', tenantId)`
      - `handleError(error)` → mapeia erro Supabase → `AppError`
      - `executeRpc(name, params)` → chamada segura a RPC functions
---

# 🖥️ FASE 5 — PRESENTATION: PÁGINAS, HOOKS E COMPONENTES

> **Objetivo:** Pages viram thin layers que delegam para hooks, que delegam para use cases.

- [ ] ⬜ **5.1** Refatorar `app/(dashboard)/dashboard/page.tsx` — extrair data fetching para `useDashboardMetrics()`, componentizar `<MetricsGrid>`, `<MovementChart>`, `<LowStockAlerts>`, `<ExpiringItems>`
- [ ] ⬜ **5.2** Refatorar `app/(dashboard)/inventory/page.tsx` — extrair para `modules/inventory/presentation/pages/inventory-page.tsx`, usar `useInventory()` do módulo
- [ ] ⬜ **5.3** Refatorar `app/(dashboard)/products/page.tsx` — extrair para `modules/catalog/presentation/pages/products-page.tsx`
- [ ] ⬜ **5.4** Refatorar `app/(dashboard)/movements/page.tsx` — extrair para `modules/inventory/presentation/pages/movements-page.tsx`
- [ ] ⬜ **5.5** Refatorar `app/(dashboard)/settings/api/page.tsx` — usar hooks do módulo `api-public`
- [ ] ⬜ **5.6** Criar `TenantProvider` global em `shared/providers/tenant-provider.tsx` — resolve tenant+profile UMA ÚNICA VEZ via React Context
- [ ] ⬜ **5.7** Atualizar `app/(dashboard)/layout.tsx` para consumir `TenantProvider`
- [ ] ⬜ **5.8** Atualizar `app/(admin)/layout.tsx` para consumir `TenantProvider`
- [ ] ⬜ **5.9** Refatorar `app/layout.tsx` — mover script de tema para `ThemeProvider`, limpar `dangerouslySetInnerHTML`

---

# 🛡️ FASE 6 — SEGURANÇA (APPSEC)

> **Objetivo:** Hardening de segurança com base nas falhas identificadas na auditoria.

## 6.1 SERVICE_ROLE — Eliminação Gradual

- [ ] ⬜ 🔴 **6.1.1** Remover SERVICE_ROLE das rotas de **leitura** da API v1 (products, inventory, stock, movements)
- [ ] ⬜ 🔴 **6.1.2** Remover SERVICE_ROLE das rotas de **escrita** da API v1
- [ ] ⬜ 🔴 **6.1.3** Remover SERVICE_ROLE de `lib/asaas.ts` — já está como parâmetro, limpar import direto
- [ ] ⬜ 🔴 **6.1.4** Remover SERVICE_ROLE de `lib/rate-limiter.ts` — substituir por RPC function
- [ ] ⬜ 🔴 **6.1.5** **Meta:** SERVICE_ROLE só existe em `infrastructure/database/supabase/client.ts` e repositórios autorizados

## 6.2 Rate Limiter

- [ ] ⬜ 🔴 **6.2.1** Mudar de **fail-open** para **fail-closed**: se o banco falha, retorna `429` em vez de passar

## 6.3 Variáveis de Ambiente

- [ ] ⬜ ⚠️ **6.3.1** Verificar se `.env` e `.env.local` não foram commitados `git rm --cached .env .env.local`
- [ ] ⬜ **6.3.2** Criar `.env.example` completo com placeholders seguros

## 6.4 CSP

- [ ] ⬜ **6.4.1** Auditar `'unsafe-inline'` e `'unsafe-eval'` no CSP — tentar substituir por nonce
- [ ] ⬜ **6.4.2** Adicionar `report-uri` para monitorar violações de CSP

## 6.5 Validação e Sanitização

- [ ] ⬜ **6.5.1** Garantir que TODOS os inputs de API usam Zod schemas
- [ ] ⬜ **6.5.2** Sanitizar output (escapar HTML em campos como `name`, `description`)
---

# 🧪 FASE 7 — TESTES E QUALIDADE

> **Objetivo:** Alcançar cobertura de testes significativa nos Use Cases e Value Objects.

## 7.1 Testes Unitários

- [ ] ⬜ **7.1.1** Configurar Vitest `npm install -D vitest @testing-library/react @testing-library/jest-dom`
- [ ] ⬜ **7.1.2** Criar `vitest.config.ts`
- [ ] ⬜ **7.1.3** Testes para `@core/` — `quantity.value-object.test.ts`, `tenant-id.value-object.test.ts`
- [ ] ⬜ **7.1.4** Teste para `login.usecase.ts` (mocar Supabase auth)
- [ ] ⬜ **7.1.5** Teste para `create-product.usecase.ts`
- [ ] ⬜ **7.1.6** Teste para `adjust-inventory.usecase.ts`
- [ ] ⬜ **7.1.7** Teste para `authenticate-api-key.usecase.ts`
- [ ] ⬜ **7.1.8** Testes para `date.ts`, `number.ts`, `cn.ts` (pure functions)

## 7.2 Testes End-to-End (Playwright)

- [ ] ⬜ **7.2.1** Expandir `e2e/auth.spec.ts` para cobrir fluxo completo de registro + login
- [ ] ⬜ **7.2.2** Criar `e2e/products.spec.ts` — CRUD de produtos via UI
- [ ] ⬜ **7.2.3** Criar `e2e/api-v1.spec.ts` — testar API pública com chave de API
- [ ] ⬜ **7.2.4** Criar `e2e/admin.spec.ts` — testar painel admin (listar tenants)

---

# 🧹 FASE 8 — LIMPEZA E FINALIZAÇÃO

> **Objetivo:** Remover arquivos antigos, atualizar imports, verificar build.

## 8.1 Arquivos a Deletar

- [ ] ⬜ **8.1.1** Deletar `app/actions/` (movido para `modules/*/presentation/actions/`)
- [ ] ⬜ **8.1.2** Deletar `components/` antigo (movido para `shared/ui/` e `modules/*/presentation/`)
- [ ] ⬜ **8.1.3** Deletar `hooks/` (movido para `modules/*/presentation/hooks/`)
- [ ] ⬜ **8.1.4** Deletar `lib/` (distribuído entre `@core/`, `infrastructure/`, `modules/*/infrastructure/`)
- [ ] ⬜ **8.1.5** Deletar `types/index.ts` (distribuído entre `modules/*/domain/`)
- [ ] ⬜ **8.1.6** Deletar `proxy.ts` (movido para `infrastructure/http/middleware.ts`)

## 8.2 Validação Final

- [ ] ⬜ **8.2.1** Rodar `npm run build` e corrigir TODOS os erros de import
- [ ] ⬜ **8.2.2** Rodar `npx playwright test` e garantir que todos os testes passam
- [ ] ⬜ 🐳 **8.2.3** Rodar `supabase migration up` para aplicar migrations novas
- [ ] ⬜ **8.2.4** Verificar RLS policies `select * from pg_policies where tablename in ('products', 'inventory_items', 'movements', 'api_keys');`

## 8.3 Deploy

- [ ] ⬜ **8.3.1** Fazer merge na `main` e deploy para Vercel
- [ ] ⬜ **8.3.2** Verificar variáveis de ambiente no Vercel
- [ ] ⬜ **8.3.3** Rodar smoke tests pós-deploy

---

# 📈 MÉTRICAS DE SUCESSO

| Indicador | Antes | Depois | Como medir |
|-----------|-------|--------|------------|
| SERVICE_ROLE nas rotas de API | 8+ locais | 0 | `grep -r "SERVICE_ROLE" app/api/` |
| Queries de tenant duplicadas | 5+ | 1 (TenantProvider) | Contar `select.*tenant_id` em páginas |
| Tipos monolíticos | 1 arquivo (217 linhas) | 1 por módulo | Contar `domain/*.types.ts` |
| Módulos DDD | 0 | 8 módulos | Contar `modules/*/domain/` |
| Cobertura de testes | ~0% | >60% | `vitest --coverage` |
| Build sem warnings | ? | 100% | `npm run build` |
| Rate limiter fail-closed | ❌ Fail-open | ✅ Fail-closed | Revisão de código |
| RLS em todas as tabelas | Parcial | 100% | `select * from pg_policies` |

---

## 🚨 CHECKLIST DE EMERGÊNCIA (OPERAÇÃO PARALELA)

- [ ] ⬜ 🔴 Trabalhar em branch `refactor/arch-10x` isoladamente
- [ ] ⬜ 🔴 Nunca commitar SERVICE_ROLE em arquivos de código (só .env.local que está no .gitignore)
- [ ] ⬜ 🔴 Manter `app/` antigo intacto até a Fase 8 — módulos são criados em paralelo, depois o antigo é deletado
- [ ] ⬜ 🟡 Cada merge na `main` requer `npm run build` + testes passando

---

> **Gerado em:** 27/06/2026 | **Autor:** Auditoria Arquitetural INVENTOY
> **Score atual:** 3.3/10 | 🎯 **Meta: 9.5/10** | **Duração estimada:** ~14 dias
