import { describe, it, expect, beforeEach } from "vitest";
import { cache } from "./simple-cache";
import { checkKeyRateLimit } from "./rate-limiter";

describe("checkKeyRateLimit", () => {
  beforeEach(() => {
    (cache as any).store.clear();
  });

  it("allows first request within limit", () => {
    const result = checkKeyRateLimit("test-key", 10, 60_000);
    expect(result.remaining).toBe(9);
    expect(result.resetIn).toBeGreaterThan(0);
  });

  it("decrements remaining on each call", () => {
    const key = "decrement-test";
    for (let i = 0; i < 5; i++) {
      const result = checkKeyRateLimit(key, 10, 60_000);
      expect(result.remaining).toBe(10 - i - 1);
    }
  });

  it("blocks when limit is exceeded", () => {
    const key = "block-test";
    for (let i = 0; i < 3; i++) {
      checkKeyRateLimit(key, 3, 60_000);
    }
    const result = checkKeyRateLimit(key, 3, 60_000);
    expect(result.remaining).toBe(0);
  });

  it("resets after window expires", async () => {
    const key = "reset-test";
    checkKeyRateLimit(key, 1, 50);

    await new Promise((resolve) => setTimeout(resolve, 60));

    const result = checkKeyRateLimit(key, 1, 50);
    expect(result.remaining).toBe(0);
  });

  it("treats different keys independently", () => {
    const resultA = checkKeyRateLimit("key-a", 5, 60_000);
    const resultB = checkKeyRateLimit("key-b", 5, 60_000);
    expect(resultA.remaining).toBe(4);
    expect(resultB.remaining).toBe(4);
  });
});
