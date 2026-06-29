export type PaymentStatus = "pending" | "confirmed" | "received" | "overdue" | "refunded" | "failed";

export interface Payment {
  id: string;
  tenant_id: string;
  asaas_payment_id: string;
  subscription_id: string | null;
  status: PaymentStatus;
  value: number;
  due_date: string;
  paid_at: string | null;
  created_at: string;
}
