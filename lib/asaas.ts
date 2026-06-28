// ─── ASAAS - Brazilian Payment Gateway Integration ───
// Sandbox: https://sandbox.asaas.com
// Docs: https://docs.asaas.com
//
// CRITICAL: API keys should be fetched from the database (tenants table)
// and passed as parameters. Do NOT rely on process.env.ASAAS_API_KEY.

import { createClient } from "@supabase/supabase-js";

const ASAAS_SANDBOX_URL = "https://api-sandbox.asaas.com/v3";
const ASAAS_PRODUCTION_URL = "https://api.asaas.com/v3";

// ─── Fetch Asaas config from the tenant's database record ───

export interface AsaasTenantConfig {
  apiKey: string;
  baseUrl: string;
  env: "sandbox" | "production";
  webhookUrl?: string;
  webhookSecret?: string;
}

/**
 * Fetch the Asaas configuration for a given tenant from the database.
 * Uses SERVICE_ROLE to bypass RLS.
 */
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

/**
 * Get Asaas config using the user's auth session (profiles -> tenant_id).
 */
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

// ─── HTTP helpers ───

function getHeaders(apiKey: string) {
  return {
    "Content-Type": "application/json",
    "access_token": apiKey,
    "User-Agent": "INVENTOY/1.0.0",
  } as const;
}

// ─── Customers ───

export interface AsaasCustomer {
  id: string;
  name: string;
  email: string;
  cpfCnpj?: string;
  phone?: string;
  mobilePhone?: string;
  address?: string;
  addressNumber?: string;
  complement?: string;
  province?: string;
  postalCode?: string;
  notificationDisabled?: boolean;
}

export async function createAsaasCustomer(
  apiKey: string,
  baseUrl: string,
  data: {
    name: string;
    email: string;
    cpfCnpj?: string;
    phone?: string;
  }
): Promise<AsaasCustomer> {
  const res = await fetch(`${baseUrl}/customers`, {
    method: "POST",
    headers: getHeaders(apiKey),
    body: JSON.stringify(data),
  });

  if (!res.ok) {
    const error = await res.json();
    throw new Error(error.errors?.[0]?.description || "Failed to create ASAAS customer");
  }

  return res.json();
}

export async function getAsaasCustomer(
  apiKey: string,
  baseUrl: string,
  id: string
): Promise<AsaasCustomer> {
  const res = await fetch(`${baseUrl}/customers/${id}`, {
    headers: getHeaders(apiKey),
  });

  if (!res.ok) throw new Error("Failed to fetch ASAAS customer");
  return res.json();
}

// ─── Subscriptions ───

export type BillingType = "PIX" | "BOLETO" | "CREDIT_CARD" | "UNDEFINED";
export type SubscriptionCycle = "WEEKLY" | "BIWEEKLY" | "MONTHLY" | "BIMONTHLY" | "QUARTERLY" | "SEMIANNUALLY" | "YEARLY";

export interface AsaasSubscription {
  id: string;
  customer: string;
  billingType: BillingType;
  value: number;
  nextDueDate: string;
  cycle: SubscriptionCycle;
  description?: string;
  status: "ACTIVE" | "INACTIVE" | "EXPIRED" | "CANCELED";
  paymentLink?: string;
}

export interface CreateSubscriptionData {
  customer: string;
  billingType: BillingType;
  value: number;
  nextDueDate: string;
  cycle: SubscriptionCycle;
  description?: string;
  creditCardToken?: string;
  creditCard?: {
    holderName: string;
    number: string;
    expiryMonth: string;
    expiryYear: string;
    ccv: string;
  };
}

export async function createAsaasSubscription(
  apiKey: string,
  baseUrl: string,
  data: CreateSubscriptionData
): Promise<AsaasSubscription> {
  const res = await fetch(`${baseUrl}/subscriptions`, {
    method: "POST",
    headers: getHeaders(apiKey),
    body: JSON.stringify(data),
  });

  if (!res.ok) {
    const error = await res.json();
    throw new Error(error.errors?.[0]?.description || "Failed to create ASAAS subscription");
  }

  return res.json();
}

export async function cancelAsaasSubscription(
  apiKey: string,
  baseUrl: string,
  id: string
): Promise<void> {
  const res = await fetch(`${baseUrl}/subscriptions/${id}`, {
    method: "DELETE",
    headers: getHeaders(apiKey),
  });

  if (!res.ok) throw new Error("Failed to cancel ASAAS subscription");
}

// ─── Payments ───

export interface AsaasPayment {
  id: string;
  subscription: string;
  customer: string;
  billingType: BillingType;
  value: number;
  netValue: number;
  dueDate: string;
  status: "PENDING" | "RECEIVED" | "CONFIRMED" | "OVERDUE" | "REFUNDED" | "RECEIVED_IN_CASH" | "PARTIAL" | "CANCELED";
  invoiceUrl?: string;
  bankSlipUrl?: string;
  pixQrCodeUrl?: string;
  pixCopiaECola?: string;
}

export async function getAsaasPayment(
  apiKey: string,
  baseUrl: string,
  id: string
): Promise<AsaasPayment> {
  const res = await fetch(`${baseUrl}/payments/${id}`, {
    headers: getHeaders(apiKey),
  });

  if (!res.ok) throw new Error("Failed to fetch ASAAS payment");
  return res.json();
}

export async function listAsaasPayments(
  apiKey: string,
  baseUrl: string,
  subscriptionId: string
): Promise<AsaasPayment[]> {
  const res = await fetch(
    `${baseUrl}/payments?subscription=${subscriptionId}`,
    { headers: getHeaders(apiKey) }
  );

  if (!res.ok) throw new Error("Failed to list ASAAS payments");
  const data = await res.json();
  return data.data || [];
}

// ─── PIX QR Code ───

export interface PixQrCode {
  encodedImage: string;
  payload: string;
  expirationDate: string;
}

export async function getPixQrCode(
  apiKey: string,
  baseUrl: string,
  paymentId: string
): Promise<PixQrCode> {
  const res = await fetch(
    `${baseUrl}/payments/${paymentId}/pixQrCode`,
    { headers: getHeaders(apiKey) }
  );

  if (!res.ok) throw new Error("Failed to generate PIX QR Code");
  return res.json();
}

// ─── Credit Card Tokenization ───

export interface CreditCardToken {
  creditCardToken: string;
}

/**
 * PCI-DSS NON-COMPLIANT — DO NOT USE IN PRODUCTION
 *
 * Esta funcao processa dados brutos de cartao (numero, CVV, titular) no servidor,
 * o que coloca a aplicacao dentro do escopo PCI-DSS (SAQ-D, auditoria anual).
 *
 * Para conformidade, substituir por:
 * - Asaas Transparent Checkout (redirect): https://docs.asaas.com/docs/checkout-transparente
 * - Asaas Card Tokenization (client-side JS): https://docs.asaas.com/docs/cartao-de-credito#tokenizacao
 *
 * @deprecated PCI-risco — remover antes de lancar producao com cartao
 */
export async function tokenizeCreditCard(
  apiKey: string,
  baseUrl: string,
  cardData: {
    customer: string;
    creditCard: {
      holderName: string;
      number: string;
      expiryMonth: string;
      expiryYear: string;
      ccv: string;
    };
  }
): Promise<CreditCardToken> {
  const res = await fetch(`${baseUrl}/creditCard/tokenize`, {
    method: "POST",
    headers: getHeaders(apiKey),
    body: JSON.stringify({
      customer: cardData.customer,
      creditCard: cardData.creditCard,
    }),
  });

  if (!res.ok) throw new Error("Failed to tokenize credit card");
  return res.json();
}

// ─── ASAAS Plan Configuration ───

export const ASAAS_PLANS = {
  starter: {
    value: 49.0,
    description: "INVENTOY Starter - Até 500 produtos",
  },
  pro: {
    value: 149.0,
    description: "INVENTOY Professional - Até 3.000 produtos",
  },
} as const;

export type PlanId = keyof typeof ASAAS_PLANS | "free" | "enterprise";
