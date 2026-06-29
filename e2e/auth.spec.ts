import { test, expect } from "@playwright/test";

test.describe("Login Page", () => {
  test("should load with all elements", async ({ page }) => {
    await page.goto("/login", { waitUntil: "networkidle" });
    await expect(page.getByText("INVENTOY")).toBeVisible();
    await expect(page.getByRole("button", { name: /^Entrar$/ })).toBeVisible();
    await expect(page.getByText("Cadastre-se gratis")).toBeVisible();
  });

  test("should show validation error for empty form", async ({ page }) => {
    await page.goto("/login", { waitUntil: "networkidle" });
    await page.getByRole("button", { name: /^Entrar$/ }).click();
    await expect(page.getByText("Preencha todos os campos")).toBeVisible();
  });

  test("should show error for invalid credentials", async ({ page }) => {
    await page.goto("/login", { waitUntil: "networkidle" });
    await page.getByPlaceholder("seu@email.com").fill("teste@teste.com");
    await page.getByPlaceholder("********").fill("senhaerrada");
    await page.getByRole("button", { name: /^Entrar$/ }).click();
    await expect(page.getByText("Email ou senha incorretos")).toBeVisible({ timeout: 15000 });
  });

  test("should navigate to register page", async ({ page }) => {
    await page.goto("/login", { waitUntil: "networkidle" });
    await page.getByText("Cadastre-se gratis").click();
    await expect(page).toHaveURL(/\/register/);
  });

  test("should navigate to register via CTA button", async ({ page }) => {
    await page.goto("/register", { waitUntil: "networkidle" });
    await expect(page.getByRole("heading", { name: "Criar Conta" })).toBeVisible();
    await page.getByText("Fazer login").click();
    await expect(page).toHaveURL(/\/login/);
  });
});

test.describe("Register Page", () => {
  test("should load with all elements", async ({ page }) => {
    await page.goto("/register", { waitUntil: "networkidle" });
    await expect(page.getByRole("heading", { name: "Criar Conta" })).toBeVisible();
    await expect(page.getByRole("button", { name: "Criar Conta Gratis" })).toBeVisible();
  });

  test("should show validation error for empty form", async ({ page }) => {
    await page.goto("/register", { waitUntil: "networkidle" });
    await page.getByRole("button", { name: "Criar Conta Gratis" }).click();
    await expect(page.getByText("Preencha todos os campos")).toBeVisible();
  });

  test("should validate password length", async ({ page }) => {
    await page.goto("/register", { waitUntil: "networkidle" });
    await page.getByPlaceholder("Seu nome").fill("Teste");
    await page.getByPlaceholder("Minha Empresa Ltda").fill("Empresa Teste");
    await page.getByPlaceholder("voce@empresa.com").fill("teste@teste.com");
    await page.getByPlaceholder("Minimo 6 caracteres").fill("123");
    await page.getByRole("button", { name: "Criar Conta Gratis" }).click();
    await expect(page.getByText("Deve ter no minimo 6 caracteres", { exact: true })).toBeVisible();
  });

  test("should show error for existing email", async ({ page }) => {
    await page.goto("/register", { waitUntil: "networkidle" });
    await page.getByPlaceholder("Seu nome").fill("Teste User");
    await page.getByPlaceholder("Minha Empresa Ltda").fill("Empresa Teste Ltda");
    // Fill CPF (required field) - use a valid test CPF
    await page.getByPlaceholder("000.000.000-00").fill("52998224725");
    await page.getByPlaceholder("voce@empresa.com").fill("teste@teste.com");
    await page.getByPlaceholder("Minimo 6 caracteres").fill("senha123");
    await page.getByRole("button", { name: "Criar Conta Gratis" }).click();
    // API returns generic error for existing email
    await expect(page.getByText("Erro ao criar conta")).toBeVisible({ timeout: 20000 });
  });
});
