import { describe, it, expect } from "vitest";
import { formatDate, formatDateShort, calculateDaysUntil } from "./date";

describe("formatDate", () => {
  it("formats a date string", () => {
    const result = formatDate("2026-06-27T12:00:00Z");
    expect(result).toContain("27/06/2026");
  });
});

describe("formatDateShort", () => {
  it("formats a date without time", () => {
    const result = formatDateShort("2026-06-27T12:00:00Z");
    expect(result).toBe("27/06/2026");
  });
});

describe("calculateDaysUntil", () => {
  it("returns 0 for past dates", () => {
    const result = calculateDaysUntil("2020-01-01");
    expect(result).toBe(0);
  });

  it("returns positive number for future dates", () => {
    const future = new Date();
    future.setDate(future.getDate() + 5);
    const result = calculateDaysUntil(future.toISOString());
    expect(result).toBeGreaterThanOrEqual(4);
    expect(result).toBeLessThanOrEqual(6);
  });
});
