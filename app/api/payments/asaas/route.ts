import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { getAsaasConfigForUser, createAsaasCustomer, createAsaasSubscription, ASAAS_PLANS } from "@/lib/asaas";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { action, ...data } = body;

    // Get authenticated user's tenant config
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: "Nao autenticado" }, { status: 401 });
    }

    const { data: profile } = await supabase
      .from("profiles")
      .select("tenant_id")
      .eq("id", user.id)
      .single();

    if (!profile?.tenant_id) {
      return NextResponse.json({ error: "Perfil nao encontrado" }, { status: 404 });
    }

    const asaasConfig = await getAsaasConfigForUser(user.id);

    switch (action) {
      case "create-customer": {
        const customer = await createAsaasCustomer(
          asaasConfig.apiKey,
          asaasConfig.baseUrl,
          {
            name: data.name,
            email: data.email,
            cpfCnpj: data.cpfCnpj,
            phone: data.phone,
          }
        );
        return NextResponse.json(customer);
      }

      case "create-subscription": {
        const planKey = data.plan as keyof typeof ASAAS_PLANS;
        const plan = ASAAS_PLANS[planKey];

        if (!plan) {
          return NextResponse.json({ error: "Invalid plan" }, { status: 400 });
        }

        const subscription = await createAsaasSubscription(
          asaasConfig.apiKey,
          asaasConfig.baseUrl,
          {
            customer: data.customerId,
            billingType: data.billingType || "CREDIT_CARD",
            value: plan.value,
            nextDueDate: data.nextDueDate || new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
            cycle: "MONTHLY",
            description: plan.description,
            creditCardToken: data.creditCardToken,
          }
        );

        return NextResponse.json(subscription);
      }

      case "get-pix-qrcode": {
        const { getPixQrCode } = await import("@/lib/asaas");
        const qrCode = await getPixQrCode(asaasConfig.apiKey, asaasConfig.baseUrl, data.paymentId);
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
