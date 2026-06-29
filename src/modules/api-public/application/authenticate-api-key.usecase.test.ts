import { describe, it, expect, vi } from "vitest";
import { createHash } from "crypto";
import { authenticateApiKeyUseCase } from "./authenticate-api-key.usecase";

function hashKey(key: string): string {
  return createHash("sha256").update(key).digest("hex");
}

function createMockSupabase(overrides?: Partial<{ tenant_id: string; revoked_at: string | null; expires_at: string | null }>) {
  const data = overrides || { tenant_id: "tenant-1", revoked_at: null, expires_at: null };
  return {
    from: vi.fn(() => ({
      select: vi.fn(() => ({
        eq: vi.fn(() => ({
          eq: vi.fn(() => ({
            single: vi.fn(() => Promise.resolve({ data, error: null })),
          })),
        })),
      })),
    })),
  } as any;
}

describe("authenticateApiKeyUseCase", () => {
  const validKey = `inv_${"a".repeat(32)}`;

  it("authenticates a valid API key", async () => {
    const supabase = createMockSupabase();
    const result = await authenticateApiKeyUseCase(supabase, validKey);
    expect(result.tenantId).toBe("tenant-1");
  });

  it("rejects short keys", async () => {
    const supabase = createMockSupabase();
    await expect(authenticateApiKeyUseCase(supabase, "short")).rejects.toThrow("format");
  });

  it("rejects revoked keys", async () => {
    const supabase = createMockSupabase({
      tenant_id: "tenant-1",
      revoked_at: new Date().toISOString(),
      expires_at: null,
    });
    await expect(authenticateApiKeyUseCase(supabase, validKey)).rejects.toThrow("revoked");
  });

  it("rejects expired keys", async () => {
    const supabase = createMockSupabase({
      tenant_id: "tenant-1",
      revoked_at: null,
      expires_at: "2020-01-01",
    });
    await expect(authenticateApiKeyUseCase(supabase, validKey)).rejects.toThrow("expired");
  });
});
