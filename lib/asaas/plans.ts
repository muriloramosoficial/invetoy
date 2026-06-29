export const ASAAS_PLANS = {
  starter: {
    value: 49.0,
    description: "INVENTOY Starter - Até 500 produtos",
  },
  pro: {
    value: 149.0,
    description: "INVENTOY Professional - Até 3.000 produtos",
  },
} as const;

export type PlanId = keyof typeof ASAAS_PLANS | "free" | "enterprise";
