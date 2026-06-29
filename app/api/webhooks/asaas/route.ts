import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { asaasWebhookSchema } from "@/lib/validations";
import { logger } from "@core/logger";

// ASAAS Webhook Implementation
// Docs: https://docs.asaas.com/docs/eventos-para-assinaturas
//
// To configure in ASAAS Sandbox:
// 1. Go to https://sandbox.asaas.com/configuracoes/webhooks
// 2. Add webhook URL: https://www.invetoy.com.br/api/webhooks/asaas
// 3. Select events: PAYMENT_CREATED, PAYMENT_CONFIRMED, PAYMENT_RECEIVED,
//    PAYMENT_OVERDUE, PAYMENT_REFUNDED, PAYMENT_FAILED, PAYMENT_DELETED,
//    SUBSCRIPTION_CANCELED, SUBSCRIPTION_UPDATED
// 4. Generate a webhook token and set as ASAAS_WEBHOOK_TOKEN in .env.local
//
// NOTE: Asaas sends the token in the "asaas-access-token" header, NOT "asaas-webhook-token".
// When configuring in Asaas, paste the same token value in the "Token de Autenticacao" field.

interface AsaasPayment {
  id: string;
  subscription: string;
  customer: string;
  value: number;
  netValue: number;
  status: string;
  dueDate: string;
  billingType: string;
  invoiceUrl?: string;
}

interface AsaasSubscription {
  id: string;
  customer: string;
  status: string;
  plan?: string;
}

interface AsaasWebhookBody {
  event: string;
  payment?: AsaasPayment;
  subscription?: AsaasSubscription;
}

function getAdminClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } }
  );
}

async function findTenantBySubscriptionId(subscriptionId: string) {
  const supabase = getAdminClient();
  const { data } = await supabase
    .from("tenants")
    .select("id, plan, pending_plan, subscription_status")
    .eq("subscription_id", subscriptionId)
    .single();
  return data;
}

export async function POST(req: NextRequest) {
  try {
    const token = req.headers.get("asaas-access-token");

    const supabase = getAdminClient();

    // Try to fetch the webhook secret from the Platform Owner's tenant in the DB
    let expectedToken = process.env.ASAAS_WEBHOOK_TOKEN;

    const { data: adminProfile } = await supabase
      .from("profiles")
      .select("tenant_id")
      .eq("is_system_admin", true)
      .maybeSingle();

    if (adminProfile?.tenant_id) {
      const { data: adminTenant } = await supabase
        .from("tenants")
        .select("asaas_env, asaas_webhook_secret_sandbox, asaas_webhook_secret_production")
        .eq("id", adminProfile.tenant_id)
        .single();

      if (adminTenant) {
        const dbSecret = adminTenant.asaas_env === "production"
          ? adminTenant.asaas_webhook_secret_production
          : adminTenant.asaas_webhook_secret_sandbox;
        if (dbSecret) expectedToken = dbSecret;
      }
    }

    if (!expectedToken || token !== expectedToken) {
      logger.warn("Invalid webhook token", { path: "asaas" });
      return NextResponse.json({ error: "Invalid webhook token" }, { status: 401 });
    }

    const rawBody = await req.json();
    const parsed = asaasWebhookSchema.safeParse(rawBody);
    if (!parsed.success) {
      logger.warn("Invalid webhook payload", { path: "asaas", issues: parsed.error.issues });
      return NextResponse.json({ received: true });
    }

    const { event, payment, subscription } = parsed.data;

    logger.info("Webhook event received", {
      path: "asaas",
      event,
      payment_id: payment?.id,
      subscription_id: subscription?.id || payment?.subscription,
    });

    switch (event) {
      // Payment confirmed/received - activate subscription
      // 🛡️ Moves pending_plan → plan only after payment is confirmed
      case "PAYMENT_CONFIRMED":
      case "PAYMENT_RECEIVED": {
        if (payment?.subscription) {
          const tenant = await findTenantBySubscriptionId(payment.subscription);
          if (tenant) {
            if (tenant.pending_plan) {
              // Activate plan: move pending_plan to plan
              const { error: activateError } = await supabase.rpc(
                "activate_tenant_plan",
                {
                  p_tenant_id: tenant.id,
                  p_plan: tenant.pending_plan,
                  p_subscription_id: payment.subscription,
                  p_subscription_status: "active",
                }
              );
              if (activateError) {
                logger.error("Failed to activate tenant plan", { tenant_id: tenant.id, error: activateError });
              } else {
                logger.info("Tenant plan activated", { tenant_id: tenant.id, plan: tenant.pending_plan, event });
              }
            } else {
              // No pending plan — just update status (legacy fallback)
              await supabase
                .from("tenants")
                .update({ subscription_status: "active" })
                .eq("id", tenant.id);
              logger.info("Tenant subscription activated (legacy)", { tenant_id: tenant.id, event });
            }
          }
        }
        break;
      }

      // Payment created - first event when payment is generated
      case "PAYMENT_CREATED": {
        if (payment?.subscription) {
          const tenant = await findTenantBySubscriptionId(payment.subscription);
          if (tenant) {
            // Only update if currently incomplete (first payment)
            if (tenant.subscription_status === "incomplete" || !tenant.subscription_status) {
              if (tenant.pending_plan) {
                const { error: activateError } = await supabase.rpc(
                  "activate_tenant_plan",
                  {
                    p_tenant_id: tenant.id,
                    p_plan: tenant.pending_plan,
                    p_subscription_id: payment.subscription,
                    p_subscription_status: "active",
                  }
                );
                if (activateError) {
                  logger.error("Failed to activate tenant plan via PAYMENT_CREATED", { tenant_id: tenant.id, error: activateError });
                } else {
                  logger.info("Tenant activated via PAYMENT_CREATED", { tenant_id: tenant.id, plan: tenant.pending_plan });
                }
              } else {
                await supabase
                  .from("tenants")
                  .update({ subscription_status: "active" })
                  .eq("id", tenant.id);
                logger.info("Tenant activated via PAYMENT_CREATED (legacy)", { tenant_id: tenant.id });
              }
            }
          }
        }
        break;
      }

      // Payment overdue
      case "PAYMENT_OVERDUE": {
        if (payment?.subscription) {
          const tenant = await findTenantBySubscriptionId(payment.subscription);
          if (tenant) {
            await supabase
              .from("tenants")
              .update({ subscription_status: "past_due" })
              .eq("id", tenant.id);
            logger.warn("Tenant subscription past due", { tenant_id: tenant.id });
          }
        }
        break;
      }

      // Payment failed or refunded
      case "PAYMENT_REFUNDED":
      case "PAYMENT_FAILED": {
        if (payment?.subscription) {
          const tenant = await findTenantBySubscriptionId(payment.subscription);
          if (tenant) {
            await supabase
              .from("tenants")
              .update({ subscription_status: "incomplete" })
              .eq("id", tenant.id);
            logger.warn("Tenant payment failed/refunded", { tenant_id: tenant.id });
          }
        }
        break;
      }

      // Payment deleted
      case "PAYMENT_DELETED": {
        if (payment?.subscription) {
          const tenant = await findTenantBySubscriptionId(payment.subscription);
          if (tenant) {
            await supabase
              .from("tenants")
              .update({ subscription_status: "canceled" })
              .eq("id", tenant.id);
            logger.warn("Tenant payment deleted, subscription canceled", { tenant_id: tenant.id });
          }
        }
        break;
      }

      // Subscription canceled — reset plan to free
      case "SUBSCRIPTION_CANCELED": {
        if (subscription?.id) {
          const tenant = await findTenantBySubscriptionId(subscription.id);
          if (tenant) {
            const { error: cancelError } = await supabase.rpc(
              "cancel_tenant_plan",
              { p_tenant_id: tenant.id }
            );
            if (cancelError) {
              logger.error("Failed to cancel tenant plan", { tenant_id: tenant.id, error: cancelError });
            } else {
              logger.info("Tenant plan reset to free", { tenant_id: tenant.id });
            }
          }
        }
        break;
      }

      // Subscription updated (status changes)
      case "SUBSCRIPTION_UPDATED": {
        if (subscription?.id) {
          const tenant = await findTenantBySubscriptionId(subscription.id);
          if (tenant && subscription.status) {
            const statusMap: Record<string, string> = {
              ACTIVE: "active",
              OVERDUE: "past_due",
              CANCELED: "canceled",
              EXPIRED: "canceled",
            };
            const mappedStatus = statusMap[subscription.status] || "active";
            await supabase
              .from("tenants")
              .update({ subscription_status: mappedStatus })
              .eq("id", tenant.id);
            logger.info("Tenant subscription status updated", { tenant_id: tenant.id, status: mappedStatus });
          }
        }
        break;
      }
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    logger.error("ASAAS webhook error", { error: error instanceof Error ? error.message : String(error) });
    return NextResponse.json({ received: true });
  }
  
}
