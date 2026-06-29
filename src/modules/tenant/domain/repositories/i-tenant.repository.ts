import type { Tenant } from "../tenant.types";

export interface ITenantRepository {
  findById(id: string): Promise<Tenant | null>;
  update(id: string, updates: Partial<Tenant>): Promise<void>;
}
