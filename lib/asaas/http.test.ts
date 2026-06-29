import { describe, it, expect } from "vitest";
import { getHeaders } from "./http";

describe("getHeaders", () => {
  it("returns correct content type", () => {
    const headers = getHeaders("test-key");
    expect(headers["Content-Type"]).toBe("application/json");
  });

  it("sets access_token from apiKey", () => {
    const headers = getHeaders("sk_test_123");
    expect(headers.access_token).toBe("sk_test_123");
  });

  it("sets user agent", () => {
    const headers = getHeaders("test-key");
    expect(headers["User-Agent"]).toBe("INVENTOY/1.0.0");
  });
});
