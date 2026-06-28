import { Quantity } from "../quantity.value-object";
import type { MovementValidationStrategy } from "./movement-strategy.interface";

export class AdjustmentMovementStrategy implements MovementValidationStrategy {
  getType() {
    return "adjustment" as const;
  }

  validate(quantity: number, _currentQuantity?: number): void {
    Quantity.create(quantity);
  }
}
