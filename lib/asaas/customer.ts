import { getHeaders } from "./http";

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
