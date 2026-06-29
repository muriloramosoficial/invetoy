// Asaas Gateway — extraído de lib/asaas.ts
// Responsabilidade ÚNICA: comunicação com API Asaas

const ASAAS_API_URL_SANDBOX = "https://sandbox.asaas.com/api/v3";
const ASAAS_API_URL_PRODUCTION = "https://api.asaas.com/v3";

interface AsaasConfig {
  apiKey: string;
  environment: "sandbox" | "production";
}

function getBaseUrl(env: "sandbox" | "production"): string {
  return env === "sandbox" ? ASAAS_API_URL_SANDBOX : ASAAS_API_URL_PRODUCTION;
}

export class AsaasGateway {
  private config: AsaasConfig;

  constructor(config: AsaasConfig) {
    this.config = config;
  }

  private get headers(): Record<string, string> {
    return {
      "Content-Type": "application/json",
      "access_token": this.config.apiKey,
    };
  }

  private get baseUrl(): string {
    return getBaseUrl(this.config.environment);
  }

  async createCustomer(data: { name: string; email: string; cpfCnpj?: string }): Promise<{ id: string }> {
    const response = await fetch(`${this.baseUrl}/customers`, {
      method: "POST",
      headers: this.headers,
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(`Asaas error: ${error.errors?.[0]?.description || "Unknown error"}`);
    }

    return response.json();
  }

  async createSubscription(data: {
    customer: string;
    billingType: string;
    value: number;
    nextDueDate: string;
    cycle: string;
    description?: string;
  }): Promise<{ id: string; status: string }> {
    const response = await fetch(`${this.baseUrl}/subscriptions`, {
      method: "POST",
      headers: this.headers,
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(`Asaas error: ${error.errors?.[0]?.description || "Unknown error"}`);
    }

    return response.json();
  }

  async getPixQrCode(paymentId: string): Promise<{ encodedImage: string; payload: string; expirationDate: string }> {
    const response = await fetch(`${this.baseUrl}/payments/${paymentId}/pixQrCode`, {
      headers: this.headers,
    });

    if (!response.ok) throw new Error("Failed to fetch PIX QR code");
    return response.json();
  }
}
