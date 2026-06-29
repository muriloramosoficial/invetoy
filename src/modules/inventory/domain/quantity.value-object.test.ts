import { describe, it, expect } from "vitest";
import { Quantity } from "./quantity.value-object";

describe("Quantity Value Object", () => {
  it("creates a valid quantity", () => {
    const qty = Quantity.create(5);
    expect(qty.value).toBe(5);
  });

  it("rejects negative values", () => {
    expect(() => Quantity.create(-1)).toThrow("negative");
  });

  it("rejects decimal values", () => {
    expect(() => Quantity.create(1.5)).toThrow("integer");
  });

  it("rejects insufficient quantity on subtract", () => {
    const qty = Quantity.create(5);
    expect(() => qty.subtract(Quantity.create(10))).toThrow("Insufficient");
  });

  it("adds quantities", () => {
    const result = Quantity.create(3).add(Quantity.create(7));
    expect(result.value).toBe(10);
  });

  it("subtracts quantities", () => {
    const result = Quantity.create(10).subtract(Quantity.create(3));
    expect(result.value).toBe(7);
  });

  it("checks equality", () => {
    expect(Quantity.create(5).equals(Quantity.create(5))).toBe(true);
    expect(Quantity.create(5).equals(Quantity.create(3))).toBe(false);
  });
});
