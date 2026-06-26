import { NextRequest, NextResponse } from "next/server";
import { stripe, createStripeCustomer, getStripePublishableKey } from "@/lib/stripe";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { priceId, customerId, email, name, successUrl, cancelUrl } = body;

    // If no customer ID, create one
    let stripeCustomerId = customerId;
    if (!stripeCustomerId) {
      const customer = await createStripeCustomer(email, name);
      stripeCustomerId = customer.id;
    }

    // Create checkout session
    const session = await stripe.checkout.sessions.create({
      customer: stripeCustomerId,
      mode: "subscription",
      line_items: [{ price: priceId, quantity: 1 }],
      success_url: successUrl || `${req.headers.get("origin")}/settings?success=true`,
      cancel_url: cancelUrl || `${req.headers.get("origin")}/settings?canceled=true`,
      metadata: {
        tenant_id: body.tenantId,
      },
    });

    return NextResponse.json({ url: session.url, sessionId: session.id });
  } catch (error) {
    console.error("Stripe checkout error:", error);
    return NextResponse.json(
      { error: "Failed to create checkout session" },
      { status: 500 }
    );
  }
}
