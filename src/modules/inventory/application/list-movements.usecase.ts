import { SupabaseClient } from "@supabase/supabase-js";
import type { Movement } from "../domain/movement.types";

interface MovementFilters {
  product_id?: string;
  type?: string;
  page?: number;
  pageSize?: number;
}

interface PaginatedMovements {
  data: Movement[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

export async function listMovementsUseCase(
  supabase: SupabaseClient,
  tenantId: string,
  filters: MovementFilters = {}
): Promise<PaginatedMovements> {
  const page = filters.page || 1;
  const pageSize = Math.min(filters.pageSize || 50, 100);
  const from = (page - 1) * pageSize;
  const to = from + pageSize - 1;

  let query = supabase
    .from("movements")
    .select("*, product:products(*), from_location:locations(*), to_location:locations(*)", { count: "exact" })
    .eq("tenant_id", tenantId);

  if (filters.product_id) {
    query = query.eq("product_id", filters.product_id);
  }

  if (filters.type) {
    query = query.eq("type", filters.type);
  }

  const { data, count, error } = await query
    .order("created_at", { ascending: false })
    .range(from, to);

  if (error) throw error;

  return {
    data: (data || []) as Movement[],
    total: count || 0,
    page,
    pageSize,
    totalPages: Math.ceil((count || 0) / pageSize),
  };
}
