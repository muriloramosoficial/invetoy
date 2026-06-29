import { getHeaders } from "./http";

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
