import { logger } from "@core/logger";

type MetricName = "signups" | "products_created" | "inventory_adjustments" | "api_requests" | "webhooks_processed";

export function trackMetric(name: MetricName, value: number = 1, tags?: Record<string, string>): void {
  logger.info("metric", {
    metric: name,
    value,
    ...tags,
  });
}
