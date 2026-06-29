import { describe, it, expect, vi } from "vitest";
import { createProductUseCase } from "./create-product.usecase";

function createMockSupabase(data?: any, error?: any) {
  return {
    from: vi.fn(() => ({
      insert: vi.fn(() => ({
        select: vi.fn(() => ({
          single: vi.fn(() => Promise.resolve({ data, error })),
        })),
      })),
    })),
  } as any;
}

describe("createProductUseCase", () => {
  it("creates a product successfully", async () => {
    const mockProduct = { id: "1", sku: "TEST-001", name: "Test Product" };
    const supabase = createMockSupabase(mockProduct);

    const result = await createProductUseCase(supabase, {
      tenant_id: "tenant-1",
      sku: "TEST-001",
      name: "Test Product",
    });

    expect(result).toEqual(mockProduct);
  });

  it("throws on duplicate SKU", async () => {
    const supabase = createMockSupabase(null, { code: "23505" });

    await expect(
      createProductUseCase(supabase, {
        tenant_id: "tenant-1",
        sku: "TEST-001",
        name: "Test Product",
      })
    ).rejects.toThrow("SKU duplicado");
  });
});
