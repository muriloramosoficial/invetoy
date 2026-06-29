import { AppError } from "@core/errors/app-error";

export class PlanUpgradeRequiredError extends AppError {
  constructor(feature: string) {
    super(`Plano atual não suporta: ${feature}. Faça upgrade.`, 403, "PLAN_UPGRADE_REQUIRED");
  }
}

export class PaymentFailedError extends AppError {
  constructor(details?: string) {
    super(`Pagamento falhou: ${details || "erro desconhecido"}`, 402, "PAYMENT_FAILED");
  }
}
