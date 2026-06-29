import type { Movement } from "../movement.types";

export interface IMovementRepository {
  findByTenant(
    tenantId: string,
    options?: { page?: number; pageSize?: number; productId?: string; type?: string }
  ): Promise<{ data: Movement[]; total: number; page: number; pageSize: number; totalPages: number }>;
  create(data: Partial<Movement>): Promise<Movement>;
}
