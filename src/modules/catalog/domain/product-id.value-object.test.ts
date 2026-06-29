import { describe, it, expect } from "vitest";
import { ProductId } from "./product-id.value-object";

describe("ProductId Value Object", () => {
  it("creates a valid product ID", () => {
    const id = ProductId.create("550e8400-e29b-41d4-a716-446655440000");
    expect(id.value).toBe("550e8400-e29b-41d4-a716-446655440000");
  });

  it("rejects empty values", () => {
    expect(() => ProductId.create("")).toThrow("empty");
  });

  it("checks equality", () => {
    const a = ProductId.create("550e8400-e29b-41d4-a716-446655440000");
    const b = ProductId.create("550e8400-e29b-41d4-a716-446655440000");
    const c = ProductId.create("550e8400-e29b-41d4-a716-446655440001");
    expect(a.equals(b)).toBe(true);
    expect(a.equals(c)).toBe(false);
  });
});
