# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: landing.spec.ts >> Landing Page >> should navigate to login
- Location: e2e\landing.spec.ts:15:7

# Error details

```
Error: expect(page).toHaveURL(expected) failed

Expected pattern: /\/login/
Received string:  "http://localhost:3000/"
Timeout: 5000ms

Call log:
  - Expect "toHaveURL" with timeout 5000ms
    13 × unexpected value "http://localhost:3000/"

```

```yaml
- banner:
  - link "INVENTOY":
    - /url: /
  - navigation:
    - link "Recursos":
      - /url: "#features"
    - link "Preços":
      - /url: "#pricing"
    - link "FAQ":
      - /url: "#faq"
    - button "Entrar"
    - button "Começar"
- text: Feito no Brasil 🇧🇷
- heading "Gestao de Patrimonio que sua empresa merece" [level=1]
- paragraph: Do almoxarifado a diretoria - uma plataforma completa para controlar, analisar e otimizar seu patrimonio em tempo real.
- button "Testar Grátis por 14 Dias"
- button "Ver Demo"
- text: Sem cartão de crédito 14 dias de teste grátis Cancele quando quiser Feito no Brasil
- paragraph: 300+
- paragraph: Empresas Ativas
- paragraph: 50,000+
- paragraph: Itens Gerenciados
- paragraph: 99%
- paragraph: Uptime
- paragraph: 15min
- paragraph: Tempo de Setup
- text: Dados Protegidos Criptografia Total 99.9% Uptime Infraestrutura Cloud Tempo Real Funcionalidades
- heading "Tudo que você precisa para gerenciar seu patrimonio" [level=2]
- paragraph: Do almoxarifado a diretoria - ferramentas para cada area da sua empresa, com dados em tempo real e seguranca enterprise.
- heading "Gestao de Patrimonio" [level=3]
- paragraph: Registre todos os bens da empresa com placa de patrimonio, marca, modelo, numero de serie e responsavel. Saiba onde cada item esta a qualquer momento.
- heading "Leitor de Codigo de Barras" [level=3]
- paragraph: Scanner mobile nativo com camera. Identifique itens por placa ou codigo de barras direto do chao de fabrica, sem equipamentos extras.
- heading "Relatorios e Auditoria" [level=3]
- paragraph: Dashboard completo com historico de movimentacoes, quem moveu cada item, quando e para onde. Relatorios exportaveis em CSV.
- heading "Controle por Papels" [level=3]
- paragraph: Administradores, gerentes e operadores com permissoes granulares. Cada usuario ve exatamente o que precisa para seu trabalho.
- heading "Assinatura Mensal Flexivel" [level=3]
- paragraph: Planos a partir de R$ 49/mes com pagamento via PIX, Boleto ou Cartao. Sem taxa de setup. Cancele quando quiser, sem multas.
- heading "API REST Integrada" [level=3]
- paragraph: Integre com seu ERP, site ou sistemas internos via API REST. Documentacao interativa disponivel nos planos Starter e Pro.
- heading "Seguranca Empresarial" [level=3]
- paragraph: Dados criptografados em transito e em repouso. Cada empresa tem isolamento total de dados, com controle granular de acessos.
- heading "Multiplas Filiais" [level=3]
- paragraph: Organize o patrimonio por filiais, departamentos, salas e armazens. Controle granular de localizacao de cada bem.
- heading "Tempo Real" [level=3]
- paragraph: Atualizacoes instantaneas em todos os dispositivos. Multiplos usuarios veem as mesmas informacoes simultaneamente, sem refresh.
- text: Como Funciona
- heading "Comece em 15 minutos" [level=2]
- paragraph: Sem burocracia. Crie sua conta, cadastre seus produtos e comece a gerenciar.
- text: "01"
- heading "Crie sua conta" [level=3]
- paragraph: Cadastre-se gratis, sem cartao de credito. Configure sua empresa e convide sua equipe.
- text: "02"
- heading "Cadastre itens" [level=3]
- paragraph: Adicione itens manualmente, importe via CSV ou use o leitor de codigos de barras.
- text: "03"
- heading "Gerencie em tempo real" [level=3]
- paragraph: Acompanhe movimentacoes, receba alertas de itens desatualizados e gere relatorios.
- text: Depoimentos
- heading "Quem usa, recomenda" [level=2]
- paragraph: “O INVENTOY transformou nossa gestão de patrimonio. Reduzimos perdas em 40% no primeiro mês.”
- paragraph: Carlos Silva
- paragraph: CEO, LogTech Transportes
- paragraph: “A API REST foi fundamental para integrar com nosso ERP. A documentação é clara e completa.”
- paragraph: Ana Oliveira
- paragraph: CTO, StockPlus Ltda
- paragraph: “Testei vários sistemas, mas o INVENTOY é o único que oferece scanner nativo sem custo extra.”
- paragraph: Ricardo Mendes
- paragraph: Gerente de Operações, Distribuidora ABC
- text: Preços
- heading "Preços simples e transparentes" [level=2]
- paragraph: Comece grátis, upgrade conforme crescer. Pagamento via PIX, Boleto ou Cartão.
- heading "Free" [level=3]
- paragraph: Para pequenas equipes começando
- text: R$ 0/mês
- list:
  - listitem: Ate 30 itens
  - listitem: 1 usuario
  - listitem: Dashboard basico
  - listitem: Movimentacoes manuais
  - listitem: Suporte por email
- button "Comecar Gratis"
- text: Mais Popular
- heading "Starter" [level=3]
- paragraph: Para negocios em crescimento
- text: R$ 49/mês
- list:
  - listitem: Ate 500 itens
  - listitem: 3 usuarios
  - listitem: Relatorios avancados
  - listitem: Leitor de codigos
  - listitem: Exportacao CSV
  - listitem: API REST
  - listitem: Suporte por email
- button "Testar Gratis"
- heading "Pro" [level=3]
- paragraph: Para operacoes em escala
- text: R$ 149/mês
- list:
  - listitem: Ate 3.000 itens
  - listitem: 10 usuarios
  - listitem: API REST
  - listitem: Leitor de codigos
  - listitem: Relatorios customizados
  - listitem: Exportacao CSV
  - listitem: Multiplas filiais
  - listitem: Suporte prioritario 24h
- button "Testar Gratis"
- heading "Enterprise" [level=3]
- paragraph: Para grandes operacoes
- text: Sob consulta
- list:
  - listitem: Itens ilimitados
  - listitem: Usuarios ilimitados
  - listitem: API REST
  - listitem: Leitor de codigos
  - listitem: Relatorios customizados
  - listitem: Multiplas filiais
  - listitem: Onboarding dedicado
  - listitem: SLA personalizado
- button "Falar com Vendas"
- heading "Pronto para transformar sua gestão de patrimonio?" [level=2]
- paragraph: Junte-se a centenas de empresas que ja usam o INVENTOY para controlar seu inventario em tempo real. Comece gratis - sem cartao de credito.
- button "Testar Grátis por 14 Dias"
- button "Ver Demo"
- text: FAQ
- heading "Perguntas Frequentes" [level=2]
- group: Precisa de cartao de credito para testar?
- group: Posso migrar meus dados de outro sistema?
- group: O leitor de codigos funciona em qualquer celular?
- group: Como funciona a seguranca dos meus dados?
- group: Posso cancelar minha assinatura a qualquer momento?
- group: A API tem limite de requisicoes?
- contentinfo:
  - text: INVENTOY
  - paragraph: Gestão de Patrimonio Inteligente. Feito no Brasil 🇧🇷
  - heading "Produto" [level=4]
  - link "Recursos":
    - /url: "#features"
  - link "Preços":
    - /url: "#pricing"
  - link "API":
    - /url: /settings/api
  - heading "Empresa" [level=4]
  - link "Termos de Serviço":
    - /url: /termos
  - link "Privacidade":
    - /url: /privacidade
  - link "Contato":
    - /url: mailto:contato@inventoy.com.br
  - heading "Suporte" [level=4]
  - link "suporte@inventoy.com.br":
    - /url: mailto:suporte@inventoy.com.br
  - link "Documentação da API":
    - /url: /settings/api
  - text: © 2026 INVENTOY. Todos os direitos reservados.
  - link "Termos":
    - /url: /termos
  - link "Privacidade":
    - /url: /privacidade
  - link "Cadastro":
    - /url: /register
- alert
```

# Test source

```ts
  1  | import { test, expect } from "@playwright/test";
  2  | 
  3  | test.describe("Landing Page", () => {
  4  |   test("should load with correct title", async ({ page }) => {
  5  |     await page.goto("/");
  6  |     await expect(page).toHaveTitle(/INVENTOY/);
  7  |   });
  8  | 
  9  |   test("should display pricing section", async ({ page }) => {
  10 |     await page.goto("/");
  11 |     await page.locator("#pricing").scrollIntoViewIfNeeded();
  12 |     await expect(page.locator("#pricing h3")).toContainText(["Free", "Starter", "Pro", "Enterprise"]);
  13 |   });
  14 | 
  15 |   test("should navigate to login", async ({ page }) => {
  16 |     await page.goto("/");
  17 |     // Use a direct text locator to find the visible "Entrar" button
  18 |     await page.getByText("Entrar").first().click();
> 19 |     await expect(page).toHaveURL(/\/login/);
     |                        ^ Error: expect(page).toHaveURL(expected) failed
  20 |   });
  21 | });
  22 | 
  23 | test.describe("API Docs Page", () => {
  24 |   test("should load API documentation", async ({ page }) => {
  25 |     await page.goto("/docs/api");
  26 |     // The page has a heading "API INVENTOY" (split across elements)
  27 |     await expect(page.locator("h1")).toBeVisible();
  28 |     // The info cards are always visible
  29 |     await expect(page.getByText("Autenticação")).toBeVisible();
  30 |     // Endpoint cards list different paths
  31 |     await expect(page.getByText("/products").first()).toBeVisible();
  32 |   });
  33 | });
  34 | 
  35 | test.describe("Static Pages", () => {
  36 |   test("should load privacy policy", async ({ page }) => {
  37 |     await page.goto("/privacidade");
  38 |     await expect(page.getByRole("heading", { name: "Política de Privacidade" })).toBeVisible();
  39 |   });
  40 | 
  41 |   test("should load terms of service", async ({ page }) => {
  42 |     await page.goto("/termos");
  43 |     await expect(page.getByRole("heading", { name: "Termos de Serviço" })).toBeVisible();
  44 |   });
  45 | });
  46 | 
```