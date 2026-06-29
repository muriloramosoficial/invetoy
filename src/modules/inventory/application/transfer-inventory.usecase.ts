import { SupabaseClient } from "@supabase/supabase-js";
import { Quantity } from "../domain/quantity.value-object";

interface TransferInventoryInput {
  tenant_id: string;
  product_id: string;
  from_location_id: string;
  to_location_id: string;
  quantity: number;
  notes?: string;
  user_id: string;
}

export async function transferInventoryUseCase(
  supabase: SupabaseClient,
  input: TransferInventoryInput
): Promise<void> {
  if (input.from_location_id === input.to_location_id) {
    throw new Error("Origem e destino devem ser diferentes");
  }

  const qty = Quantity.create(input.quantity);

  const { error } = await supabase.rpc("transfer_inventory", {
    p_product_id: input.product_id,
    p_from_location: input.from_location_id,
    p_to_location: input.to_location_id,
    p_quantity: qty.value,
    p_notes: input.notes || null,
    p_user_id: input.user_id,
  });

  if (error) throw error;
}
