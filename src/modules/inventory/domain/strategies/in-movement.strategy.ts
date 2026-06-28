import { Quantity } from "../quantity.value-object";
import type { MovementValidationStrategy } from "./movement-strategy.interface";

export class InMovementStrategy implements MovementValidationStrategy {
  getType() {
    return "in" as const;
  }

  validate(quantity: number, _currentQuantity?: number): void {
    Quantity.create(quantity);
  }
}
