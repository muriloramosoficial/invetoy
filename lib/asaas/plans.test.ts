import { describe, it, expect } from "vitest";
import { ASAAS_PLANS } from "./plans";

describe("ASAAS_PLANS", () => {
  it("defines starter plan with correct value", () => {
    expect(ASAAS_PLANS.starter.value).toBe(49.0);
  });

  it("defines pro plan with correct value", () => {
    expect(ASAAS_PLANS.pro.value).toBe(149.0);
  });

  it("has description for each plan", () => {
    const ids = Object.keys(ASAAS_PLANS);
    expect(ids.length).toBeGreaterThan(0);
    for (const id of ids) {
      expect(ASAAS_PLANS[id as keyof typeof ASAAS_PLANS].description).toBeTruthy();
    }
  });
});
