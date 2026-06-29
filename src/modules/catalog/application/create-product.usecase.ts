import { SupabaseClient } from "@supabase/supabase-js";
import type { Product } from "../domain/product.types";

interface CreateProductInput {
  tenant_id: string;
  sku: string;
  name: string;
  description?: string | null;
  category_id?: string | null;
  min_stock?: number;
  unit?: string;
  price?: number | null;
  cost?: number | null;
}

export async function createProductUseCase(
  supabase: SupabaseClient,
  input: CreateProductInput
): Promise<Product> {
  const { data, error } = await supabase
    .from("products")
    .insert({
      tenant_id: input.tenant_id,
      sku: input.sku,
      name: input.name,
      description: input.description,
      category_id: input.category_id,
      min_stock: input.min_stock ?? 0,
      unit: input.unit ?? "un",
      price: input.price,
      cost: input.cost,
    })
    .select()
    .single();

  if (error) {
    if (error.code === "23505") {
      throw new Error(`SKU duplicado: ${input.sku}`);
    }
    throw error;
  }

  return data as Product;
}
