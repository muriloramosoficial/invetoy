import { NextRequest, NextResponse } from "next/server";

// ASAAS webhook events documentation:
// https://docs.asaas.com/docs/eventos-para-assinaturas

interface AsaasWebhookEvent {
  event: string;
  payment?: {
    id: string;
    subscription: string;
    customer: string;
    value: number;
    status: string;
    dueDate: string;
    billingType: string;
  };
  subscription?: {
    id: string;
    customer: string;
    status: string;
  };
}

export async function POST(req: NextRequest) {
  try {
    const body: AsaasWebhookEvent = await req.json();

    // Validate webhook token
    const token = req.headers.get("asaas-webhook-token");
    if (token !== process.env.ASAAS_WEBHOOK_TOKEN) {
      return NextResponse.json({ error: "Invalid webhook token" }, { status: 401 });
    }

    const { event, payment, subscription } = body;

    switch (event) {
      // Payment events
      case "PAYMENT_CREATED":
        // Payment was created (linked to a subscription)
        break;

      case "PAYMENT_RECEIVED":
        // Payment was successfully received
        if (payment) {
          // TODO: Update tenant's subscription status to active
          // const supabase = createAdminClient();
          // Update tenant's subscription status
        }
        break;

      case "PAYMENT_OVERDUE":
        // Payment is overdue
        if (payment) {
          // TODO: Notify tenant about overdue payment
        }
        break;

      case "PAYMENT_FAILED":
        // Payment failed
        break;

      case "PAYMENT_REFUNDED":
        // Payment was refunded
        break;

      // Subscription events
      case "SUBSCRIPTION_CREATED":
        // New subscription was created
        break;

      case "SUBSCRIPTION_UPDATED":
        // Subscription was updated
        break;

      case "SUBSCRIPTION_CANCELED":
        // Subscription was canceled
        break;

      default:
        console.log(`Unhandled ASAAS webhook event: ${event}`);
    }

    // Always return 200 OK to acknowledge receipt
    return NextResponse.json({ received: true });
  } catch (error) {
    console.error("ASAAS webhook error:", error);
    return NextResponse.json({ received: true }); // Still return 200 to avoid retries
  }
}
