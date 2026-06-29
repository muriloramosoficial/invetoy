import type { Product } from "@modules/catalog/domain/product.types";
import type { Location } from "./location.types";

export interface InventoryItem {
  id: string;
  product_id: string;
  product?: Product;
  location_id: string;
  location?: Location;
  quantity: number;
  batch: string | null;
  expiration_date: string | null;
  created_at: string;
  updated_at: string;
}
