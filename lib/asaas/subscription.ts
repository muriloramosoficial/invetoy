import { getHeaders } from "./http";

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
