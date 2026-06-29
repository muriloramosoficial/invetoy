import { SupabaseRepository } from "@infra/database/supabase/repository.helper";
import type { Location } from "../domain/location.types";

export class SupabaseLocationRepository extends SupabaseRepository {
  async findByTenant(tenantId: string): Promise<Location[]> {
    const { data, error } = await this.getClient()
      .from("locations")
      .select("*")
      .eq("tenant_id", tenantId)
      .is("archived_at", null)
      .order("name");

    if (error) throw this.handleError(error);
    return (data || []) as Location[];
  }

  async create(data: Partial<Location>): Promise<Location> {
    const { data: result, error } = await this.getClient()
      .from("locations")
      .insert(data)
      .select()
      .single();

    if (error) throw this.handleError(error);
    return result as Location;
  }
}
