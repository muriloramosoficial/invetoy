import type { MovementType } from "../movement.types";

export interface MovementValidationStrategy {
  validate(quantity: number, currentQuantity?: number): void;
  getType(): MovementType;
}
