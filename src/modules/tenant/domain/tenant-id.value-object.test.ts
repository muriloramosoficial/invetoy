import { describe, it, expect } from "vitest";
import { TenantId } from "./tenant-id.value-object";

describe("TenantId Value Object", () => {
  it("creates a valid tenant ID", () => {
    const id = TenantId.create("550e8400-e29b-41d4-a716-446655440000");
    expect(id.value).toBe("550e8400-e29b-41d4-a716-446655440000");
  });

  it("rejects empty values", () => {
    expect(() => TenantId.create("")).toThrow("empty");
  });

  it("checks equality", () => {
    const a = TenantId.create("550e8400-e29b-41d4-a716-446655440000");
    const b = TenantId.create("550e8400-e29b-41d4-a716-446655440000");
    const c = TenantId.create("550e8400-e29b-41d4-a716-446655440001");
    expect(a.equals(b)).toBe(true);
    expect(a.equals(c)).toBe(false);
  });
});
