import { SupabaseClient } from "@supabase/supabase-js";
import type { Tenant } from "../domain/tenant.types";

export async function getTenantConfigUseCase(
  supabase: SupabaseClient,
  tenantId: string
): Promise<Tenant> {
  const { data, error } = await supabase
    .from("tenants")
    .select("*")
    .eq("id", tenantId)
    .single();

  if (error || !data) {
    throw new Error("Organização não encontrada");
  }

  return data as Tenant;
}
