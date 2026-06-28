import { SupabaseRepository } from "@infra/database/supabase/repository.helper";
import type { Product } from "../domain/product.types";
import type { IProductRepository } from "../domain/repositories/i-product.repository";

export class SupabaseProductRepository extends SupabaseRepository implements IProductRepository {
  async findById(id: string): Promise<Product | null> {
    const { data, error } = await this.getClient()
      .from("products")
      .select("*, category:categories(*)")
      .eq("id", id)
      .single();

    if (error) return null;
    return data as Product;
  }

  async findByTenant(
    tenantId: string,
    options: { page?: number; pageSize?: number; search?: string; showArchived?: boolean; categoryId?: string } = {}
  ) {
    let query = this.getClient()
      .from("products")
      .select("*, category:categories(*)", { count: "exact" })
      .eq("tenant_id", tenantId);

    if (!options.showArchived) {
      query = query.is("archived_at", null);
    }
    if (options.search) {
      query = query.or(`name.ilike.%${options.search}%,sku.ilike.%${options.search}%`);
    }
    if (options.categoryId) {
      query = query.eq("category_id", options.categoryId);
    }

    return this.paginate<Product>(query.order("created_at", { ascending: false }), options.page, options.pageSize);
  }

  async create(data: Partial<Product>): Promise<Product> {
    const { data: result, error } = await this.getClient()
      .from("products")
      .insert(data)
      .select()
      .single();

    if (error) throw this.handleError(error);
    return result as Product;
  }

  async update(id: string, data: Partial<Product>): Promise<Product> {
    const { data: result, error } = await this.getClient()
      .from("products")
      .update(data)
      .eq("id", id)
      .select()
      .single();

    if (error) throw this.handleError(error);
    return result as Product;
  }

  async archive(id: string): Promise<void> {
    const { error } = await this.getClient()
      .from("products")
      .update({ archived_at: new Date().toISOString() })
      .eq("id", id);

    if (error) throw this.handleError(error);
  }
}
