import { SupabaseClient } from "@supabase/supabase-js";
import type { AsaasWebhookPayload, AsaasEvent } from "../domain/asaas.types";

const EVENT_STATUS_MAP: Record<string, string> = {
  PAYMENT_CONFIRMED: "active",
  PAYMENT_RECEIVED: "active",
  PAYMENT_OVERDUE: "past_due",
  PAYMENT_REFUNDED: "canceled",
  PAYMENT_FAILED: "incomplete",
  SUBSCRIPTION_CANCELED: "canceled",
};

export async function handleWebhookUseCase(
  supabase: SupabaseClient,
  payload: AsaasWebhookPayload
): Promise<void> {
  const event = payload.event as AsaasEvent;
  const subId = payload.subscription?.id || payload.payment?.subscription;

  if (!subId) return;

  const { data: tenant } = await supabase
    .from("tenants")
    .select("id, plan, pending_plan, subscription_status")
    .eq("subscription_id", subId)
    .single();

  if (!tenant) return;

  if (event === "SUBSCRIPTION_UPDATED" && payload.subscription?.status) {
    const statusMap: Record<string, string> = {
      ACTIVE: "active", OVERDUE: "past_due",
      CANCELED: "canceled", EXPIRED: "canceled",
    };
    const mappedStatus = statusMap[payload.subscription.status] || "active";

    if (mappedStatus === "canceled" && tenant.pending_plan) {
      // Subscription canceled — reset plan to free
      const { error } = await supabase.rpc("cancel_tenant_plan", {
        p_tenant_id: tenant.id,
      });
      if (error) {
        console.error("[webhook] Failed to cancel tenant plan:", error);
      }
    } else {
      await supabase.from("tenants").update({ subscription_status: mappedStatus }).eq("id", tenant.id);
    }
  } else if (event === "SUBSCRIPTION_CANCELED") {
    // Subscription canceled — reset plan to free
    const { error } = await supabase.rpc("cancel_tenant_plan", {
      p_tenant_id: tenant.id,
    });
    if (error) {
      console.error("[webhook] Failed to cancel tenant plan:", error);
    }
  } else if (event === "PAYMENT_CONFIRMED" || event === "PAYMENT_RECEIVED") {
    // Payment confirmed — activate pending plan if exists
    if (tenant.pending_plan) {
      const { error } = await supabase.rpc("activate_tenant_plan", {
        p_tenant_id: tenant.id,
        p_plan: tenant.pending_plan,
        p_subscription_id: subId,
        p_subscription_status: "active",
      });
      if (error) {
        console.error("[webhook] Failed to activate tenant plan:", error);
      }
    } else {
      // Legacy fallback: just update status
      await supabase.from("tenants").update({ subscription_status: "active" }).eq("id", tenant.id);
    }
  } else if (event === "PAYMENT_CREATED") {
    // Payment created — activate if currently incomplete
    if (tenant.subscription_status === "incomplete" || !tenant.subscription_status) {
      if (tenant.pending_plan) {
        const { error } = await supabase.rpc("activate_tenant_plan", {
          p_tenant_id: tenant.id,
          p_plan: tenant.pending_plan,
          p_subscription_id: subId,
          p_subscription_status: "active",
        });
        if (error) {
          console.error("[webhook] Failed to activate tenant plan via PAYMENT_CREATED:", error);
        }
      } else {
        await supabase.from("tenants").update({ subscription_status: "active" }).eq("id", tenant.id);
      }
    }
  } else {
    const status = EVENT_STATUS_MAP[event];
    if (status) {
      await supabase.from("tenants").update({ subscription_status: status }).eq("id", tenant.id);
    }
  }
}
