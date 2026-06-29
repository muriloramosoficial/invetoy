import { SupabaseClient } from "@supabase/supabase-js";
import { Quantity } from "../domain/quantity.value-object";

interface AdjustInventoryInput {
  tenant_id: string;
  product_id: string;
  location_id: string;
  type: "in" | "out" | "count";
  quantity: number;
  notes?: string;
  batch?: string;
  expiration_date?: string;
  user_id: string;
}

export async function adjustInventoryUseCase(
  supabase: SupabaseClient,
  input: AdjustInventoryInput
): Promise<void> {
  const qty = Quantity.create(input.quantity);

  const { error } = await supabase.rpc("adjust_inventory", {
    p_product_id: input.product_id,
    p_location_id: input.location_id,
    p_type: input.type,
    p_quantity: qty.value,
    p_notes: input.notes || null,
    p_batch: input.batch || null,
    p_expiration_date: input.expiration_date || null,
    p_user_id: input.user_id,
  });

  if (error) throw error;
}
