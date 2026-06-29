export type AsaasEvent =
  | "PAYMENT_CREATED"
  | "PAYMENT_CONFIRMED"
  | "PAYMENT_RECEIVED"
  | "PAYMENT_OVERDUE"
  | "PAYMENT_REFUNDED"
  | "PAYMENT_FAILED"
  | "PAYMENT_DELETED"
  | "SUBSCRIPTION_CANCELED"
  | "SUBSCRIPTION_UPDATED";

export interface AsaasWebhookPayload {
  event: AsaasEvent;
  payment?: {
    id: string;
    subscription: string;
    status: string;
    value?: number;
    netValue?: number;
    dueDate?: string;
    paymentDate?: string;
  };
  subscription?: {
    id: string;
    customer: string;
    status?: string;
    cycle?: string;
  };
}
