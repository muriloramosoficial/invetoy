import { SupabaseClient } from "@supabase/supabase-js";

interface CreateSubscriptionInput {
  tenant_id: string;
  plan_id: string;
  payment_method?: string;
}

export async function createSubscriptionUseCase(
  supabase: SupabaseClient,
  input: CreateSubscriptionInput
): Promise<void> {
  const { data: tenant, error: tenantError } = await supabase
    .from("tenants")
    .select("payment_customer_id, asaas_env")
    .eq("id", input.tenant_id)
    .single();

  if (tenantError || !tenant) {
    throw new Error("Organização não encontrada");
  }

  if (!tenant.payment_customer_id) {
    throw new Error("Cliente não registrado no gateway de pagamento");
  }

  const { error } = await supabase.from("tenants").update({
    plan: input.plan_id,
    subscription_status: "trialing",
  }).eq("id", input.tenant_id);

  if (error) throw error;
}
