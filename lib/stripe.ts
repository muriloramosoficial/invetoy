import Stripe from "stripe";

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  typescript: true,
});

export function getStripePublishableKey(): string {
  return process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!;
}

// Plan configuration
export const STRIPE_PLANS = {
  starter: {
    price_id: process.env.STRIPE_STARTER_PRICE_ID!,
    name: "Starter",
    description: "Up to 1,000 products",
    features: ["1,000 products", "5 users", "Locations", "Basic reports"],
  },
  pro: {
    price_id: process.env.STRIPE_PRO_PRICE_ID!,
    name: "Professional",
    description: "Up to 10,000 products",
    features: ["10,000 products", "Unlimited users", "Advanced reports", "API access"],
  },
  enterprise: {
    price_id: process.env.STRIPE_ENTERPRISE_PRICE_ID!,
    name: "Enterprise",
    description: "Unlimited products",
    features: ["Unlimited products", "Unlimited users", "Custom integrations", "Priority support"],
  },
} as const;

export async function createStripeCheckoutSession(
  customerId: string,
  priceId: string,
  successUrl: string,
  cancelUrl: string
) {
  return stripe.checkout.sessions.create({
    customer: customerId,
    mode: "subscription",
    line_items: [{ price: priceId, quantity: 1 }],
    success_url: successUrl,
    cancel_url: cancelUrl,
  });
}

export async function createStripeCustomer(
  email: string,
  name: string,
  metadata?: Record<string, string>
) {
  return stripe.customers.create({
    email,
    name,
    metadata,
  });
}
