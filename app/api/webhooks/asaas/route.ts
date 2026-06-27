import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

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
    .select("id, plan, subscription_status")
    .eq("subscription_id", subscriptionId)
    .single();
  return data;
}

export async function POST(req: NextRequest) {
  try {
    const token = req.headers.get("asaas-webhook-token");
    if (token !== process.env.ASAAS_WEBHOOK_TOKEN) {
      return NextResponse.json({ error: "Invalid webhook token" }, { status: 401 });
    }

    const body: AsaasWebhookBody = await req.json();
    const { event, payment, subscription } = body;

    console.log(`[ASAAS Webhook] Event: ${event}`, {
      paymentId: payment?.id,
      subscriptionId: subscription?.id || payment?.subscription,
    });

    const supabase = getAdminClient();

    switch (event) {
      // Payment confirmed/received - activate subscription
      case "PAYMENT_CONFIRMED":
      case "PAYMENT_RECEIVED": {
        if (payment?.subscription) {
          const tenant = await findTenantBySubscriptionId(payment.subscription);
          if (tenant) {
            await supabase
              .from("tenants")
              .update({ subscription_status: "active" })
              .eq("id", tenant.id);
            console.log(`[ASAAS] Tenant ${tenant.id} subscription activated (${event})`);
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
              await supabase
                .from("tenants")
                .update({ subscription_status: "active" })
                .eq("id", tenant.id);
              console.log(`[ASAAS] Tenant ${tenant.id} subscription activated via PAYMENT_CREATED`);
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
            console.log(`[ASAAS] Tenant ${tenant.id} subscription past due`);
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
            console.log(`[ASAAS] Tenant ${tenant.id} payment failed/refunded`);
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
            console.log(`[ASAAS] Tenant ${tenant.id} payment deleted, subscription canceled`);
          }
        }
        break;
      }

      // Subscription canceled
      case "SUBSCRIPTION_CANCELED": {
        if (subscription?.id) {
          const tenant = await findTenantBySubscriptionId(subscription.id);
          if (tenant) {
            await supabase
              .from("tenants")
              .update({ subscription_status: "canceled" })
              .eq("id", tenant.id);
            console.log(`[ASAAS] Tenant ${tenant.id} subscription canceled`);
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
            console.log(`[ASAAS] Tenant ${tenant.id} subscription status updated to ${mappedStatus}`);
          }
        }
        break;
      }
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error("ASAAS webhook error:", error);
    return NextResponse.json({ received: true });
  }
}
