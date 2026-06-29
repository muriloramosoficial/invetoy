import type { MovementType } from "../movement.types";
import type { MovementValidationStrategy } from "./movement-strategy.interface";
import { InMovementStrategy } from "./in-movement.strategy";
import { OutMovementStrategy } from "./out-movement.strategy";
import { TransferMovementStrategy } from "./transfer-movement.strategy";
import { AdjustmentMovementStrategy } from "./adjustment-movement.strategy";
import { CountMovementStrategy } from "./count-movement.strategy";

const strategies: Record<string, MovementValidationStrategy> = {
  in: new InMovementStrategy(),
  out: new OutMovementStrategy(),
  transfer: new TransferMovementStrategy(),
  adjustment: new AdjustmentMovementStrategy(),
  count: new CountMovementStrategy(),
};

export class MovementStrategyFactory {
  static getStrategy(type: MovementType): MovementValidationStrategy {
    const strategy = strategies[type];
    if (!strategy) {
      throw new Error(`Tipo de movimentação inválido: ${type}`);
    }
    return strategy;
  }
}
