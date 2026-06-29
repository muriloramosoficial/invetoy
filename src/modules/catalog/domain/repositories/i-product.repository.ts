import type { Product } from "../product.types";

export interface IProductRepository {
  findById(id: string): Promise<Product | null>;
  findByTenant(
    tenantId: string,
    options?: { page?: number; pageSize?: number; search?: string; showArchived?: boolean; categoryId?: string }
  ): Promise<{ data: Product[]; total: number; page: number; pageSize: number; totalPages: number }>;
  create(data: Partial<Product>): Promise<Product>;
  update(id: string, data: Partial<Product>): Promise<Product>;
  archive(id: string): Promise<void>;
}
