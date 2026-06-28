import { Quantity } from "../quantity.value-object";
import type { MovementValidationStrategy } from "./movement-strategy.interface";

export class TransferMovementStrategy implements MovementValidationStrategy {
  getType() {
    return "transfer" as const;
  }

  validate(quantity: number, currentQuantity?: number): void {
    Quantity.create(quantity);
    if (currentQuantity !== undefined && quantity > currentQuantity) {
      throw new Error("Quantidade de transferência excede o estoque disponível");
    }
  }
}
