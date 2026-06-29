import type { ApiKey } from "../api-key.types";

export interface IApiKeyRepository {
  authenticate(rawKey: string): Promise<{ tenantId: string } | null>;
  create(tenantId: string, name: string): Promise<{ rawKey: string }>;
  revoke(keyId: string, tenantId: string): Promise<void>;
  listByTenant(tenantId: string): Promise<ApiKey[]>;
}
