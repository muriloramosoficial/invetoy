import { SupabaseClient } from "@supabase/supabase-js";
import type { AdminMetrics } from "../domain/admin.types";

export async function getAdminMetricsUseCase(
  supabase: SupabaseClient
): Promise<AdminMetrics> {
  const [tenantsResult, profilesResult, productsResult] = await Promise.all([
    supabase.from("tenants").select("id, subscription_status", { count: "exact", head: true }),
    supabase.from("profiles").select("id", { count: "exact", head: true }),
    supabase.from("products").select("id", { count: "exact", head: true }),
  ]);

  return {
    totalTenants: tenantsResult.count || 0,
    activeSubscriptions: 0,
    totalUsers: profilesResult.count || 0,
    totalProducts: productsResult.count || 0,
    revenue: 0,
  };
}
