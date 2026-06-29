export interface Tenant {
  id: string;
  name: string;
  slug: string;
  created_at: string;
  payment_provider: "asaas" | null;
  payment_customer_id: string | null;
  subscription_id: string | null;
  subscription_status: "active" | "trialing" | "past_due" | "canceled" | "incomplete" | null;
  plan: "free" | "starter" | "pro" | "enterprise";
  locale: "pt-BR";
  cnpj: string | null;
  asaas_api_key_sandbox: string | null;
  asaas_api_key_production: string | null;
  asaas_env: "sandbox" | "production";
  asaas_webhook_url_sandbox: string | null;
  asaas_webhook_url_production: string | null;
  asaas_webhook_secret_sandbox: string | null;
  asaas_webhook_secret_production: string | null;
}
