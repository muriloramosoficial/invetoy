import { SupabaseRepository } from "@infra/database/supabase/repository.helper";
import type { InventoryItem } from "../domain/inventory.types";
import type { IInventoryRepository } from "../domain/repositories/i-inventory.repository";

export class SupabaseInventoryRepository extends SupabaseRepository implements IInventoryRepository {
  async findByTenant(tenantId: string): Promise<InventoryItem[]> {
    const { data, error } = await this.getClient()
      .from("inventory_items")
      .select("*, product:products(*), location:locations(*)")
      .eq("tenant_id", tenantId);

    if (error) throw this.handleError(error);
    return (data || []) as InventoryItem[];
  }

  async adjustInventory(params: {
    productId: string;
    locationId: string;
    type: "in" | "out" | "count";
    quantity: number;
    notes?: string;
    userId: string;
  }): Promise<void> {
    const { error } = await this.getClient().rpc("adjust_inventory", {
      p_product_id: params.productId,
      p_location_id: params.locationId,
      p_type: params.type,
      p_quantity: params.quantity,
      p_notes: params.notes || null,
      p_user_id: params.userId,
    });

    if (error) throw this.handleError(error);
  }
}
