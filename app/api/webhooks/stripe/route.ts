import { NextRequest, NextResponse } from "next/server";
import { stripe } from "@/lib/stripe";

export async function POST(req: NextRequest) {
  const body = await req.text();
  const signature = req.headers.get("stripe-signature");

  if (!signature) {
    return NextResponse.json({ error: "Missing signature" }, { status: 400 });
  }

  try {
    const event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET!
    );

    switch (event.type) {
      case "checkout.session.completed": {
        const session = event.data.object;
        // Update tenant's subscription status
        const tenantId = session.metadata?.tenant_id;
        if (tenantId) {
          // TODO: Update tenant subscription in database
          // await supabase.from("tenants").update({...}).eq("id", tenantId);
        }
        break;
      }

      case "customer.subscription.updated":
      case "customer.subscription.deleted": {
        const subscription = event.data.object;
        // Handle subscription updates
        break;
      }

      case "invoice.payment_succeeded": {
        const invoice = event.data.object;
        // Update payment status
        break;
      }

      case "invoice.payment_failed": {
        const invoice = event.data.object;
        // Send notification to user about failed payment
        break;
      }
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error("Stripe webhook error:", error);
    return NextResponse.json(
      { error: "Webhook signature verification failed" },
      { status: 400 }
    );
  }
}
