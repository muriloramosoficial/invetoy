import { z } from "zod";

export const asaasWebhookSchema = z.object({
  event: z.string(),
  payment: z.object({
    id: z.string(),
    subscription: z.string(),
    status: z.string(),
  }).optional(),
  subscription: z.object({
    id: z.string(),
    customer: z.string(),
    status: z.string().optional(),
  }).optional(),
});

export type AsaasWebhookInput = z.infer<typeof asaasWebhookSchema>;
