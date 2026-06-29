# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: landing.spec.ts >> API Docs Page >> should load API documentation
- Location: e2e\landing.spec.ts:24:7

# Error details

```
Error: expect(locator).toBeVisible() failed

Locator: getByText('Autenticação')
Expected: visible
Timeout: 5000ms
Error: element(s) not found

Call log:
  - Expect "toBeVisible" with timeout 5000ms
  - waiting for getByText('Autenticação')

```

```yaml
- link "Voltar para pagina inicial":
  - /url: /
- heading "INVENTOY" [level=1]
- paragraph: Gestao de Patrimonio Inteligente
- text: Email
- textbox "Email":
  - /placeholder: seu@email.com
- text: Senha
- button "Esqueceu?"
- textbox "Senha":
  - /placeholder: "********"
- button "Mostrar senha"
- button "Entrar"
- text: Nao tem conta?
- link "Cadastre-se gratis":
  - /url: /register
- text: ou
- button "Entrar com link magico"
- paragraph:
  - text: Ao continuar, voce aceita nossos
  - link "Termos":
    - /url: /termos
  - text: e
  - link "Privacidade":
    - /url: /privacidade
- heading "Controle total do seu patrimonio" [level=2]
- paragraph: Dashboard em tempo real, historico de movimentacoes, movimentacoes auditadas e muito mais.
- paragraph: Produtos
- paragraph: Ilimitados
- paragraph: Analytics
- paragraph: Em tempo real
- paragraph: Seguranca
- paragraph: Criptografia
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
  19 |     await expect(page).toHaveURL(/\/login/);
  20 |   });
  21 | });
  22 | 
  23 | test.describe("API Docs Page", () => {
  24 |   test("should load API documentation", async ({ page }) => {
  25 |     await page.goto("/docs/api");
  26 |     // The page has a heading "API INVENTOY" (split across elements)
  27 |     await expect(page.locator("h1")).toBeVisible();
  28 |     // The info cards are always visible
> 29 |     await expect(page.getByText("Autenticação")).toBeVisible();
     |                                                  ^ Error: expect(locator).toBeVisible() failed
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