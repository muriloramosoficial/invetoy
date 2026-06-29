import { test, expect } from "@playwright/test";

test.describe("Landing Page", () => {
  test("should load with correct title", async ({ page }) => {
    await page.goto("/");
    await expect(page).toHaveTitle(/INVENTOY/);
  });

  test("should display pricing section", async ({ page }) => {
    await page.goto("/");
    await page.locator("#pricing").scrollIntoViewIfNeeded();
    await expect(page.locator("#pricing h3")).toContainText(["Free", "Starter", "Pro", "Enterprise"]);
  });

  test("should navigate to login", async ({ page }) => {
    await page.goto("/");
    // Use a direct text locator to find the visible "Entrar" button
    await page.getByText("Entrar").first().click();
    await expect(page).toHaveURL(/\/login/);
  });
});

test.describe("API Docs Page", () => {
  test("should load API documentation", async ({ page }) => {
    await page.goto("/docs/api");
    // The page has a heading "API INVENTOY" (split across elements)
    await expect(page.locator("h1")).toBeVisible();
    // The info cards are always visible
    await expect(page.getByText("Autenticação")).toBeVisible();
    // Endpoint cards list different paths
    await expect(page.getByText("/products").first()).toBeVisible();
  });
});

test.describe("Static Pages", () => {
  test("should load privacy policy", async ({ page }) => {
    await page.goto("/privacidade");
    await expect(page.getByRole("heading", { name: "Política de Privacidade" })).toBeVisible();
  });

  test("should load terms of service", async ({ page }) => {
    await page.goto("/termos");
    await expect(page.getByRole("heading", { name: "Termos de Serviço" })).toBeVisible();
  });
});
