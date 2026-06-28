import { describe, it, expect } from "vitest";
import { MovementStrategyFactory } from "./movement-strategy.factory";
import { InMovementStrategy } from "./in-movement.strategy";
import { OutMovementStrategy } from "./out-movement.strategy";
import { TransferMovementStrategy } from "./transfer-movement.strategy";

describe("MovementStrategyFactory", () => {
  it("returns InMovementStrategy for 'in' type", () => {
    const s = MovementStrategyFactory.getStrategy("in");
    expect(s).toBeInstanceOf(InMovementStrategy);
    expect(s.getType()).toBe("in");
  });

  it("returns OutMovementStrategy for 'out' type", () => {
    const s = MovementStrategyFactory.getStrategy("out");
    expect(s).toBeInstanceOf(OutMovementStrategy);
    expect(s.getType()).toBe("out");
  });

  it("returns TransferMovementStrategy for 'transfer' type", () => {
    const s = MovementStrategyFactory.getStrategy("transfer");
    expect(s).toBeInstanceOf(TransferMovementStrategy);
    expect(s.getType()).toBe("transfer");
  });

  it("throws for unknown type", () => {
    expect(() => MovementStrategyFactory.getStrategy("invalid" as any)).toThrow(
      "Tipo de movimentação inválido"
    );
  });
});

describe("InMovementStrategy", () => {
  it("accepts any positive quantity", () => {
    const s = new InMovementStrategy();
    expect(() => s.validate(10)).not.toThrow();
  });
});

describe("OutMovementStrategy", () => {
  it("rejects when quantity exceeds current stock", () => {
    const s = new OutMovementStrategy();
    expect(() => s.validate(100, 50)).toThrow("excede o estoque disponível");
  });

  it("accepts when quantity is within stock", () => {
    const s = new OutMovementStrategy();
    expect(() => s.validate(50, 100)).not.toThrow();
  });
});

describe("TransferMovementStrategy", () => {
  it("rejects when quantity exceeds stock", () => {
    const s = new TransferMovementStrategy();
    expect(() => s.validate(100, 50)).toThrow("excede o estoque disponível");
  });
});
