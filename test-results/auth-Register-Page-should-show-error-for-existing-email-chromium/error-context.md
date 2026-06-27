# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: auth.spec.ts >> Register Page >> should show error for existing email
- Location: e2e\auth.spec.ts:62:7

# Error details

```
Error: expect(locator).toBeVisible() failed

Locator: getByText('already registered')
Expected: visible
Timeout: 20000ms
Error: element(s) not found

Call log:
  - Expect "toBeVisible" with timeout 20000ms
  - waiting for getByText('already registered')

```

```yaml
- heading "Comece gratis, cresca quando quiser" [level=2]
- paragraph: 14 dias de teste gratis. Sem cartao de credito. Cancele quando quiser.
- paragraph: Teste Gratis
- paragraph: 14 dias
- paragraph: Itens
- paragraph: Ate 100
- paragraph: Sem riscos
- paragraph: Cancele ja
- link "Voltar para pagina inicial":
  - /url: /
- heading "Criar Conta" [level=1]
- paragraph: Comece seu teste gratis - sem cartao de credito
- text: Nome completo *
- textbox "Nome completo *":
  - /placeholder: Seu nome
  - text: Teste User
- text: Nome da empresa *
- textbox "Nome da empresa *":
  - /placeholder: Minha Empresa Ltda
  - text: Empresa Teste Ltda
- text: CPF do responsavel *
- textbox "CPF do responsavel *":
  - /placeholder: 000.000.000-00
- paragraph: Documento do responsavel legal pela empresa
- text: CNPJ da empresa (opcional no plano Free)
- textbox "CNPJ da empresa (opcional no plano Free)":
  - /placeholder: 00.000.000/0000-00
- paragraph: Obrigatorio ao fazer upgrade para planos pagos
- text: Email *
- textbox "Email *":
  - /placeholder: voce@empresa.com
  - text: teste@teste.com
- text: Senha *
- textbox "Senha *":
  - /placeholder: Minimo 6 caracteres
  - text: senha123
- button "Mostrar senha"
- paragraph: Deve ter no minimo 6 caracteres
- paragraph:
  - text: Ao criar sua conta, voce aceita nossos
  - link "Termos de Servico":
    - /url: /termos
  - text: e
  - link "Politica de Privacidade":
    - /url: /privacidade
  - text: .
- alert: Informe um CPF valido para o responsavel
- button "Criar Conta Gratis"
- text: Ja tem conta?
- link "Fazer login":
  - /url: /login
- alert
```

# Test source

```ts
  1  | import { test, expect } from "@playwright/test";
  2  | 
  3  | test.describe("Login Page", () => {
  4  |   test("should load with all elements", async ({ page }) => {
  5  |     await page.goto("/login", { waitUntil: "networkidle" });
  6  |     await expect(page.getByText("INVENTOY")).toBeVisible();
  7  |     await expect(page.getByRole("button", { name: /^Entrar$/ })).toBeVisible();
  8  |     await expect(page.getByText("Cadastre-se gratis")).toBeVisible();
  9  |   });
  10 | 
  11 |   test("should show validation error for empty form", async ({ page }) => {
  12 |     await page.goto("/login", { waitUntil: "networkidle" });
  13 |     await page.getByRole("button", { name: /^Entrar$/ }).click();
  14 |     await expect(page.getByText("Preencha todos os campos")).toBeVisible();
  15 |   });
  16 | 
  17 |   test("should show error for invalid credentials", async ({ page }) => {
  18 |     await page.goto("/login", { waitUntil: "networkidle" });
  19 |     await page.getByPlaceholder("seu@email.com").fill("teste@teste.com");
  20 |     await page.getByPlaceholder("********").fill("senhaerrada");
  21 |     await page.getByRole("button", { name: /^Entrar$/ }).click();
  22 |     await expect(page.getByText("Email ou senha incorretos")).toBeVisible({ timeout: 15000 });
  23 |   });
  24 | 
  25 |   test("should navigate to register page", async ({ page }) => {
  26 |     await page.goto("/login", { waitUntil: "networkidle" });
  27 |     await page.getByText("Cadastre-se gratis").click();
  28 |     await expect(page).toHaveURL(/\/register/);
  29 |   });
  30 | 
  31 |   test("should navigate to register via CTA button", async ({ page }) => {
  32 |     await page.goto("/register", { waitUntil: "networkidle" });
  33 |     await expect(page.getByRole("heading", { name: "Criar Conta" })).toBeVisible();
  34 |     await page.getByText("Fazer login").click();
  35 |     await expect(page).toHaveURL(/\/login/);
  36 |   });
  37 | });
  38 | 
  39 | test.describe("Register Page", () => {
  40 |   test("should load with all elements", async ({ page }) => {
  41 |     await page.goto("/register", { waitUntil: "networkidle" });
  42 |     await expect(page.getByRole("heading", { name: "Criar Conta" })).toBeVisible();
  43 |     await expect(page.getByRole("button", { name: "Criar Conta Gratis" })).toBeVisible();
  44 |   });
  45 | 
  46 |   test("should show validation error for empty form", async ({ page }) => {
  47 |     await page.goto("/register", { waitUntil: "networkidle" });
  48 |     await page.getByRole("button", { name: "Criar Conta Gratis" }).click();
  49 |     await expect(page.getByText("Preencha todos os campos")).toBeVisible();
  50 |   });
  51 | 
  52 |   test("should validate password length", async ({ page }) => {
  53 |     await page.goto("/register", { waitUntil: "networkidle" });
  54 |     await page.getByPlaceholder("Seu nome").fill("Teste");
  55 |     await page.getByPlaceholder("Minha Empresa Ltda").fill("Empresa Teste");
  56 |     await page.getByPlaceholder("voce@empresa.com").fill("teste@teste.com");
  57 |     await page.getByPlaceholder("Minimo 6 caracteres").fill("123");
  58 |     await page.getByRole("button", { name: "Criar Conta Gratis" }).click();
  59 |     await expect(page.getByText("Deve ter no minimo 6 caracteres", { exact: true })).toBeVisible();
  60 |   });
  61 | 
  62 |   test("should show error for existing email", async ({ page }) => {
  63 |     await page.goto("/register", { waitUntil: "networkidle" });
  64 |     await page.getByPlaceholder("Seu nome").fill("Teste User");
  65 |     await page.getByPlaceholder("Minha Empresa Ltda").fill("Empresa Teste Ltda");
  66 |     await page.getByPlaceholder("voce@empresa.com").fill("teste@teste.com");
  67 |     await page.getByPlaceholder("Minimo 6 caracteres").fill("senha123");
  68 |     await page.getByRole("button", { name: "Criar Conta Gratis" }).click();
> 69 |     await expect(page.getByText("already registered")).toBeVisible({ timeout: 20000 });
     |                                                        ^ Error: expect(locator).toBeVisible() failed
  70 |   });
  71 | });
  72 | 
```