import { describe, it, expect } from "vitest";
import { formatCurrency, generateSku } from "./number";

describe("formatCurrency", () => {
  it("formats BRL currency", () => {
    const result = formatCurrency(1234.56);
    expect(result).toContain("1.234");
    expect(result).toContain("56");
  });

  it("formats USD currency", () => {
    const result = formatCurrency(1234.56, "USD");
    expect(result).toContain("1,234");
  });
});

describe("generateSku", () => {
  it("generates a SKU with prefix", () => {
    const sku = generateSku("Test Product", "Eletrônicos");
    expect(sku).toMatch(/^ELE-/);
  });

  it("uses INV prefix when no category", () => {
    const sku = generateSku("Test Product");
    expect(sku).toMatch(/^INV-/);
  });
});
