import { Quantity } from "../quantity.value-object";
import type { MovementValidationStrategy } from "./movement-strategy.interface";

export class OutMovementStrategy implements MovementValidationStrategy {
  getType() {
    return "out" as const;
  }

  validate(quantity: number, currentQuantity?: number): void {
    Quantity.create(quantity);
    if (currentQuantity !== undefined && quantity > currentQuantity) {
      throw new Error("Quantidade de saída excede o estoque disponível");
    }
  }
}
