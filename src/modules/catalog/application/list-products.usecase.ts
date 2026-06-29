import { SupabaseClient } from "@supabase/supabase-js";
import type { Product } from "../domain/product.types";

interface ProductFilters {
  search?: string;
  category_id?: string;
  showArchived?: boolean;
  page?: number;
  pageSize?: number;
}

interface PaginatedProducts {
  data: Product[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

export async function listProductsUseCase(
  supabase: SupabaseClient,
  tenantId: string,
  filters: ProductFilters = {}
): Promise<PaginatedProducts> {
  const page = filters.page || 1;
  const pageSize = Math.min(filters.pageSize || 50, 100);
  const from = (page - 1) * pageSize;
  const to = from + pageSize - 1;

  let query = supabase
    .from("products")
    .select("*, category:categories(*)", { count: "exact" })
    .eq("tenant_id", tenantId);

  if (!filters.showArchived) {
    query = query.is("archived_at", null);
  }

  if (filters.search) {
    query = query.or(
      `name.ilike.%${filters.search}%,sku.ilike.%${filters.search}%`
    );
  }

  if (filters.category_id) {
    query = query.eq("category_id", filters.category_id);
  }

  const { data, count, error } = await query
    .order("created_at", { ascending: false })
    .range(from, to);

  if (error) throw error;

  return {
    data: (data || []) as Product[],
    total: count || 0,
    page,
    pageSize,
    totalPages: Math.ceil((count || 0) / pageSize),
  };
}
