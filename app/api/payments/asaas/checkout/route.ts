import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import {
  createAsaasCustomer,
  createAsaasSubscription,
  ASAAS_PLANS,
} from "@/lib/asaas";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const planId = searchParams.get("plan");

    if (!planId) {
      return NextResponse.redirect(
        new URL("/subscription?error=missing_params", request.url)
      );
    }

    // Validate plan
    const planConfig = ASAAS_PLANS[planId as keyof typeof ASAAS_PLANS];
    if (!planConfig) {
      return NextResponse.redirect(
        new URL("/subscription?error=invalid_plan", request.url)
      );
    }

    // Authenticate user
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.redirect(new URL("/login", request.url));
    }

    // Get profile + tenant
    const { data: profile, error: profileError } = await supabase
      .from("profiles")
      .select("id, name, email, tenant_id")
      .eq("id", user.id)
      .single();

    if (profileError || !profile) {
      return NextResponse.redirect(
        new URL("/subscription?error=profile_not_found", request.url)
      );
    }

    // Get tenant info
    const { data: tenant, error: tenantError } = await supabase
      .from("tenants")
      .select("id, name, payment_customer_id")
      .eq("id", profile.tenant_id)
      .single();

    if (tenantError || !tenant) {
      return NextResponse.redirect(
        new URL("/subscription?error=tenant_not_found", request.url)
      );
    }

    // Create ASAAS customer if doesn't exist
    let asaasCustomerId = tenant.payment_customer_id;
    if (!asaasCustomerId) {
      const customer = await createAsaasCustomer({
        name: profile.name,
        email: profile.email,
      });
      asaasCustomerId = customer.id;

      await supabase
        .from("tenants")
        .update({
          payment_provider: "asaas",
          payment_customer_id: asaasCustomerId,
        })
        .eq("id", tenant.id);
    }

    // Create subscription with UNDEFINED billing type
    // The customer chooses payment method (PIX/Boleto/Cartão) at ASAAS checkout
    const nextDueDate = new Date();
    nextDueDate.setDate(nextDueDate.getDate() + 1);

    const subscription = await createAsaasSubscription({
      customer: asaasCustomerId,
      billingType: "UNDEFINED",
      value: planConfig.value,
      nextDueDate: nextDueDate.toISOString().split("T")[0],
      cycle: "MONTHLY",
      description: planConfig.description,
    });

    // Save subscription info — status stays "incomplete" until webhook confirms payment
    await supabase
      .from("tenants")
      .update({
        subscription_id: subscription.id,
        subscription_status: "incomplete",
        plan: planId,
      })
      .eq("id", tenant.id);

    // Use paymentLink from ASAAS API response, or fallback to constructed URL
    const checkoutUrl = subscription.paymentLink ||
      `https://sandbox.asaas.com/subscription/${subscription.id}/checkout`;

    return NextResponse.redirect(checkoutUrl);
  } catch (error: any) {
    console.error("[ASAAS Checkout Error]", error);
    const errorMsg = encodeURIComponent(error?.message || "checkout_failed");
    return NextResponse.redirect(
      new URL(`/subscription?error=${errorMsg}`, request.url)
    );
  }
}
