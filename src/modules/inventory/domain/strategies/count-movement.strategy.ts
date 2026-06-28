import { Quantity } from "../quantity.value-object";
import type { MovementValidationStrategy } from "./movement-strategy.interface";

export class CountMovementStrategy implements MovementValidationStrategy {
  getType() {
    return "count" as const;
  }

  validate(quantity: number, _currentQuantity?: number): void {
    Quantity.create(quantity);
  }
}
