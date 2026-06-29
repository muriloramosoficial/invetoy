export class TenantId {
  private constructor(public readonly value: string) {
    if (!value || value.length === 0) {
      throw new Error("TenantId cannot be empty");
    }
  }

  static create(value: string): TenantId {
    return new TenantId(value);
  }

  equals(other: TenantId): boolean {
    return this.value === other.value;
  }
}
