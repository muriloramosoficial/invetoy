export class ProductId {
  private constructor(public readonly value: string) {
    if (!value || value.length === 0) {
      throw new Error("ProductId cannot be empty");
    }
  }

  static create(value: string): ProductId {
    return new ProductId(value);
  }

  equals(other: ProductId): boolean {
    return this.value === other.value;
  }
}
