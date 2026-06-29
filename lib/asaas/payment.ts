import { getHeaders } from "./http";
import type { BillingType } from "./subscription";

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
