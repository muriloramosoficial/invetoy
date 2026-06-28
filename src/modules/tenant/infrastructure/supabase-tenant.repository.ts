import { SupabaseRepository } from "@infra/database/supabase/repository.helper";
import type { Tenant } from "../domain/tenant.types";
import type { ITenantRepository } from "../domain/repositories/i-tenant.repository";

export class SupabaseTenantRepository extends SupabaseRepository implements ITenantRepository {
  async findById(id: string): Promise<Tenant | null> {
    const { data, error } = await this.getClient()
      .from("tenants")
      .select("*")
      .eq("id", id)
      .single();

    if (error) return null;
    return data as Tenant;
  }

  async update(id: string, updates: Partial<Tenant>): Promise<void> {
    const { error } = await this.getClient()
      .from("tenants")
      .update(updates)
      .eq("id", id);

    if (error) throw this.handleError(error);
  }
}
