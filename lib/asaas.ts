// ─── ASAAS - Brazilian Payment Gateway Integration ───
// Sandbox: https://sandbox.asaas.com
// Docs: https://docs.asaas.com

const ASAAS_API_URL = process.env.ASAAS_SANDBOX
  ? "https://sandbox.asaas.com/api/v3"
  : "https://www.asaas.com/api/v3";

function getHeaders() {
  return {
    "Content-Type": "application/json",
    access_token: process.env.ASAAS_API_KEY!,
  };
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

export async function createAsaasCustomer(data: {
  name: string;
  email: string;
  cpfCnpj?: string;
  phone?: string;
}): Promise<AsaasCustomer> {
  const res = await fetch(`${ASAAS_API_URL}/customers`, {
    method: "POST",
    headers: getHeaders(),
    body: JSON.stringify(data),
  });

  if (!res.ok) {
    const error = await res.json();
    throw new Error(error.errors?.[0]?.description || "Failed to create ASAAS customer");
  }

  return res.json();
}

export async function getAsaasCustomer(id: string): Promise<AsaasCustomer> {
  const res = await fetch(`${ASAAS_API_URL}/customers/${id}`, {
    headers: getHeaders(),
  });

  if (!res.ok) throw new Error("Failed to fetch ASAAS customer");
  return res.json();
}

// ─── Subscriptions ───

export type BillingType = "PIX" | "BOLETO" | "CREDIT_CARD";
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
  data: CreateSubscriptionData
): Promise<AsaasSubscription> {
  const res = await fetch(`${ASAAS_API_URL}/subscriptions`, {
    method: "POST",
    headers: getHeaders(),
    body: JSON.stringify(data),
  });

  if (!res.ok) {
    const error = await res.json();
    throw new Error(error.errors?.[0]?.description || "Failed to create ASAAS subscription");
  }

  return res.json();
}

export async function cancelAsaasSubscription(id: string): Promise<void> {
  const res = await fetch(`${ASAAS_API_URL}/subscriptions/${id}`, {
    method: "DELETE",
    headers: getHeaders(),
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

export async function getAsaasPayment(id: string): Promise<AsaasPayment> {
  const res = await fetch(`${ASAAS_API_URL}/payments/${id}`, {
    headers: getHeaders(),
  });

  if (!res.ok) throw new Error("Failed to fetch ASAAS payment");
  return res.json();
}

export async function listAsaasPayments(subscriptionId: string): Promise<AsaasPayment[]> {
  const res = await fetch(
    `${ASAAS_API_URL}/payments?subscription=${subscriptionId}`,
    { headers: getHeaders() }
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

export async function getPixQrCode(paymentId: string): Promise<PixQrCode> {
  const res = await fetch(
    `${ASAAS_API_URL}/payments/${paymentId}/pixQrCode`,
    { headers: getHeaders() }
  );

  if (!res.ok) throw new Error("Failed to generate PIX QR Code");
  return res.json();
}

// ─── Credit Card Tokenization ───

export interface CreditCardToken {
  creditCardToken: string;
}

export async function tokenizeCreditCard(cardData: {
  customer: string;
  creditCard: {
    holderName: string;
    number: string;
    expiryMonth: string;
    expiryYear: string;
    ccv: string;
  };
}): Promise<CreditCardToken> {
  const res = await fetch(`${ASAAS_API_URL}/creditCard/tokenize`, {
    method: "POST",
    headers: getHeaders(),
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
    description: "INVENTOY Starter - Até 1.000 produtos",
  },
  pro: {
    value: 149.0,
    description: "INVENTOY Professional - Até 10.000 produtos",
  },
  enterprise: {
    value: 499.0,
    description: "INVENTOY Enterprise - Produtos ilimitados",
  },
} as const;
