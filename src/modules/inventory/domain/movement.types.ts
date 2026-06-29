import type { Product } from "@modules/catalog/domain/product.types";
import type { Location } from "./location.types";
import type { Profile } from "@modules/identity/domain/identity.types";

export type MovementType = "in" | "out" | "transfer" | "adjustment" | "count";

export interface Movement {
  id: string;
  tenant_id: string;
  product_id: string;
  product?: Product;
  from_location_id: string | null;
  from_location?: Location | null;
  to_location_id: string | null;
  to_location?: Location | null;
  quantity: number;
  type: MovementType;
  reference: string | null;
  notes: string | null;
  user_id: string;
  user?: Profile;
  created_at: string;
}
