import { createHash, randomBytes } from "crypto";
import { SupabaseRepository } from "@infra/database/supabase/repository.helper";
import type { ApiKey } from "../domain/api-key.types";
import type { IApiKeyRepository } from "../domain/repositories/i-api-key.repository";

export class SupabaseApiKeyRepository extends SupabaseRepository implements IApiKeyRepository {
  private generateKey(): { raw: string; prefix: string; hash: string } {
    const raw = `inv_${randomBytes(24).toString("base64url")}`;
    const prefix = raw.slice(0, 12);
    const hash = createHash("sha256").update(raw).digest("hex");
    return { raw, prefix, hash };
  }

  async authenticate(rawKey: string): Promise<{ tenantId: string } | null> {
    if (!rawKey || rawKey.length < 20) return null;

    const keyHash = createHash("sha256").update(rawKey).digest("hex");
    const prefix = rawKey.slice(0, 12);

    const { data, error } = await this.getClient()
      .from("api_keys")
      .select("tenant_id, revoked_at, expires_at")
      .eq("key_hash", keyHash)
      .eq("key_prefix", prefix)
      .single();

    if (error || !data) return null;
    if (data.revoked_at) return null;
    if (data.expires_at && new Date(data.expires_at) < new Date()) return null;

    return { tenantId: data.tenant_id };
  }

  async create(tenantId: string, name: string): Promise<{ rawKey: string }> {
    const { raw, prefix, hash } = this.generateKey();

    const { error } = await this.getClient()
      .from("api_keys")
      .insert({ tenant_id: tenantId, name, key_hash: hash, key_prefix: prefix });

    if (error) throw this.handleError(error);
    return { rawKey: raw };
  }

  async revoke(keyId: string, tenantId: string): Promise<void> {
    const { error } = await this.getClient()
      .from("api_keys")
      .update({ revoked_at: new Date().toISOString() })
      .eq("id", keyId)
      .eq("tenant_id", tenantId);

    if (error) throw this.handleError(error);
  }

  async listByTenant(tenantId: string): Promise<ApiKey[]> {
    const { data, error } = await this.getClient()
      .from("api_keys")
      .select("id, name, key_prefix, created_at, last_used_at, revoked_at, expires_at")
      .eq("tenant_id", tenantId)
      .order("created_at", { ascending: false });

    if (error) throw this.handleError(error);
    return (data || []) as ApiKey[];
  }
}
