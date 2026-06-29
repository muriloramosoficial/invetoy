import { SupabaseClient } from "@supabase/supabase-js";
import type { Product } from "../domain/product.types";

type UpdateProductInput = Partial<Omit<Product, "id" | "tenant_id" | "created_at" | "updated_at">>;

export async function updateProductUseCase(
  supabase: SupabaseClient,
  productId: string,
  input: UpdateProductInput
): Promise<Product> {
  const { data, error } = await supabase
    .from("products")
    .update(input)
    .eq("id", productId)
    .select()
    .single();

  if (error) {
    if (error.code === "23505") {
      throw new Error(`SKU duplicado`);
    }
    throw error;
  }

  return data as Product;
}
