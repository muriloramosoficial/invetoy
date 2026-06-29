import { SupabaseRepository } from "@infra/database/supabase/repository.helper";
import type { Plan } from "../domain/plan.types";

export class SupabaseBillingRepository extends SupabaseRepository {
  async getPlans(): Promise<Plan[]> {
    const { data, error } = await this.getClient()
      .from("plans")
      .select("*")
      .order("price_brl", { ascending: true });

    if (error) throw this.handleError(error);
    return (data || []) as Plan[];
  }

  async updateTenantSubscription(
    tenantId: string,
    updates: { plan?: string; subscription_status?: string; subscription_id?: string }
  ): Promise<void> {
    const { error } = await this.getClient()
      .from("tenants")
      .update(updates)
      .eq("id", tenantId);

    if (error) throw this.handleError(error);
  }
}
