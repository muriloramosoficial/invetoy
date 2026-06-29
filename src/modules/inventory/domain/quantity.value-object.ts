export class Quantity {
  private constructor(public readonly value: number) {
    if (!Number.isInteger(value)) {
      throw new Error("Quantity must be an integer");
    }
    if (value < 0) {
      throw new Error("Quantity cannot be negative");
    }
  }

  static create(value: number): Quantity {
    return new Quantity(value);
  }

  add(other: Quantity): Quantity {
    return new Quantity(this.value + other.value);
  }

  subtract(other: Quantity): Quantity {
    const result = this.value - other.value;
    if (result < 0) throw new Error("Insufficient quantity");
    return new Quantity(result);
  }

  equals(other: Quantity): boolean {
    return this.value === other.value;
  }
}
