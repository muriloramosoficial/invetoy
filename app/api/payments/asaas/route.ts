import { NextRequest, NextResponse } from "next/server";
import { createAsaasCustomer, createAsaasSubscription, ASAAS_PLANS } from "@/lib/asaas";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { action, ...data } = body;

    switch (action) {
      case "create-customer": {
        const customer = await createAsaasCustomer({
          name: data.name,
          email: data.email,
          cpfCnpj: data.cpfCnpj,
          phone: data.phone,
        });
        return NextResponse.json(customer);
      }

      case "create-subscription": {
        const planKey = data.plan as keyof typeof ASAAS_PLANS;
        const plan = ASAAS_PLANS[planKey];

        if (!plan) {
          return NextResponse.json({ error: "Invalid plan" }, { status: 400 });
        }

        const subscription = await createAsaasSubscription({
          customer: data.customerId,
          billingType: data.billingType || "CREDIT_CARD",
          value: plan.value,
          nextDueDate: data.nextDueDate || new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
          cycle: "MONTHLY",
          description: plan.description,
          creditCardToken: data.creditCardToken,
        });

        return NextResponse.json(subscription);
      }

      case "get-pix-qrcode": {
        const { getPixQrCode } = await import("@/lib/asaas");
        const qrCode = await getPixQrCode(data.paymentId);
        return NextResponse.json(qrCode);
      }

      default:
        return NextResponse.json({ error: "Invalid action" }, { status: 400 });
    }
  } catch (error) {
    console.error("ASAAS API error:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to process ASAAS request" },
      { status: 500 }
    );
  }
}
