import type { InventoryItem } from "../inventory.types";

export interface IInventoryRepository {
  findByTenant(tenantId: string): Promise<InventoryItem[]>;
  adjustInventory(params: {
    productId: string;
    locationId: string;
    type: "in" | "out" | "count";
    quantity: number;
    notes?: string;
    userId: string;
  }): Promise<void>;
}
