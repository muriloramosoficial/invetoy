import { createClient } from "@supabase/supabase-js";

const ASAAS_SANDBOX_URL = "https://api-sandbox.asaas.com/v3";
const ASAAS_PRODUCTION_URL = "https://api.asaas.com/v3";

export interface AsaasTenantConfig {
  apiKey: string;
  baseUrl: string;
  env: "sandbox" | "production";
  webhookUrl?: string;
  webhookSecret?: string;
}

export async function getAsaasConfig(tenantId: string): Promise<AsaasTenantConfig> {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } }
  );

  const { data: tenant, error } = await supabase
    .from("tenants")
    .select("asaas_api_key_sandbox, asaas_api_key_production, asaas_env")
    .eq("id", tenantId)
    .single();

  if (error || !tenant) {
    throw new Error("Tenant not found or Asaas config unavailable");
  }

  const env = (tenant.asaas_env || "sandbox") as "sandbox" | "production";
  const apiKey = env === "production"
    ? tenant.asaas_api_key_production
    : tenant.asaas_api_key_sandbox;

  if (!apiKey) {
    throw new Error(
      `Asaas API key not configured for ${env} environment. ` +
      `Go to /admin/asaas-config to set it up.`
    );
  }

  return {
    apiKey,
    baseUrl: env === "production" ? ASAAS_PRODUCTION_URL : ASAAS_SANDBOX_URL,
    env,
  };
}

export async function getAsaasConfigForUser(userId: string): Promise<AsaasTenantConfig> {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } }
  );

  const { data: profile } = await supabase
    .from("profiles")
    .select("tenant_id")
    .eq("id", userId)
    .single();

  if (!profile?.tenant_id) {
    throw new Error("Profile not found");
  }

  return getAsaasConfig(profile.tenant_id);
}
