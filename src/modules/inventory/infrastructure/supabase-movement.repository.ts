import { SupabaseRepository } from "@infra/database/supabase/repository.helper";
import type { Movement } from "../domain/movement.types";
import type { IMovementRepository } from "../domain/repositories/i-movement.repository";

export class SupabaseMovementRepository extends SupabaseRepository implements IMovementRepository {
  async findByTenant(
    tenantId: string,
    options: { page?: number; pageSize?: number; productId?: string; type?: string } = {}
  ) {
    let query = this.getClient()
      .from("movements")
      .select("*, product:products(*), from_location:locations(*), to_location:locations(*)", { count: "exact" })
      .eq("tenant_id", tenantId);

    if (options.productId) query = query.eq("product_id", options.productId);
    if (options.type) query = query.eq("type", options.type);

    return this.paginate<Movement>(query.order("created_at", { ascending: false }), options.page, options.pageSize);
  }

  async create(data: Partial<Movement>): Promise<Movement> {
    const { data: result, error } = await this.getClient()
      .from("movements")
      .insert(data)
      .select()
      .single();

    if (error) throw this.handleError(error);
    return result as Movement;
  }
}
