import { SupabaseRepository } from "@infra/database/supabase/repository.helper";
import type { AdminMetrics } from "../domain/admin.types";

export class SupabaseAdminRepository extends SupabaseRepository {
  async getMetrics(): Promise<AdminMetrics> {
    const [tenants, profiles, products] = await Promise.all([
      this.getClient().from("tenants").select("id, subscription_status", { count: "exact", head: true }),
      this.getClient().from("profiles").select("id", { count: "exact", head: true }),
      this.getClient().from("products").select("id", { count: "exact", head: true }),
    ]);

    return {
      totalTenants: tenants.count || 0,
      activeSubscriptions: 0,
      totalUsers: profiles.count || 0,
      totalProducts: products.count || 0,
      revenue: 0,
    };
  }

  async listTenants(options: { page?: number; pageSize?: number } = {}) {
    const query = this.getClient()
      .from("tenants")
      .select("*", { count: "exact" });

    return this.paginate(query.order("created_at", { ascending: false }), options.page, options.pageSize);
  }
}
