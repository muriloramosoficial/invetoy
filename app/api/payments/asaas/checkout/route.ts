import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";
import {
  createAsaasCustomer,
  createAsaasSubscription,
  getAsaasConfig,
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
      .select("id, name, email, cpf, tenant_id")
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
      .select("id, name, cnpj, payment_customer_id, plan, pending_plan, subscription_status")
      .eq("id", profile.tenant_id)
      .single();

    if (tenantError || !tenant) {
      return NextResponse.redirect(
        new URL("/subscription?error=tenant_not_found", request.url)
      );
    }

    // 🛡️ Security: Check if user already has an active paid subscription
    if (tenant.subscription_status === "active" && tenant.plan !== "free") {
      return NextResponse.redirect(
        new URL("/subscription?error=already_active", request.url)
      );
    }

    // 🛡️ Security: If there's a pending subscription, prevent creating another
    if (tenant.subscription_status === "incomplete" && tenant.pending_plan) {
      return NextResponse.redirect(
        new URL("/subscription?error=pending_exists", request.url)
      );
    }

    // Fetch the Platform Owner's (System Admin) tenant to get the Asaas credentials
    const { data: adminProfile } = await supabase
      .from("profiles")
      .select("tenant_id")
      .eq("is_system_admin", true)
      .maybeSingle();

    if (!adminProfile?.tenant_id) {
      return NextResponse.redirect(
        new URL("/subscription?error=platform_config_missing", request.url)
      );
    }

    const asaasConfig = await getAsaasConfig(adminProfile.tenant_id);

    // Create ASAAS customer if doesn't exist
    let asaasCustomerId = tenant.payment_customer_id;
    if (!asaasCustomerId) {
      const cpfCnpj = profile.cpf || tenant.cnpj || user.user_metadata?.cpf || undefined;
      const customer = await createAsaasCustomer(
        asaasConfig.apiKey,
        asaasConfig.baseUrl,
        {
          name: profile.name,
          email: profile.email,
          cpfCnpj,
        }
      );
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
    const nextDueDate = new Date();
    nextDueDate.setDate(nextDueDate.getDate() + 1);

    const subscription = await createAsaasSubscription(
      asaasConfig.apiKey,
      asaasConfig.baseUrl,
      {
        customer: asaasCustomerId,
        billingType: "UNDEFINED",
        value: planConfig.value,
        nextDueDate: nextDueDate.toISOString().split("T")[0],
        cycle: "MONTHLY",
        description: planConfig.description,
      }
    );

    // 🛡️ Security: Use service_role client for critical updates
    // This ensures:
    // 1. The plan is NOT changed before payment (uses pending_plan instead)
    // 2. The update bypasses RLS (which restricts regular users from changing plan)
    const adminClient = createAdminClient();
    await adminClient
      .from("tenants")
      .update({
        subscription_id: subscription.id,
        subscription_status: "incomplete",
        pending_plan: planId, // Store the plan as pending — only activated on payment confirmation
      })
      .eq("id", tenant.id);

    // Redirect to ASAAS checkout
    const checkoutUrl = subscription.paymentLink ||
      `${asaasConfig.env === "sandbox" ? "https://sandbox.asaas.com" : "https://asaas.com"}/subscription/${subscription.id}/checkout`;

    return NextResponse.redirect(checkoutUrl);
  } catch (error: unknown) {
    console.error("[ASAAS Checkout Error]", error);
    const errorMsg = encodeURIComponent(error instanceof Error ? error.message : "checkout_failed");
    return NextResponse.redirect(
      new URL(`/subscription?error=${errorMsg}`, request.url)
    );
  }
}
