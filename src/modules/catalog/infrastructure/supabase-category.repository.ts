import { SupabaseRepository } from "@infra/database/supabase/repository.helper";
import type { Category } from "../domain/category.types";

export class SupabaseCategoryRepository extends SupabaseRepository {
  async findByTenant(tenantId: string): Promise<Category[]> {
    const { data, error } = await this.getClient()
      .from("categories")
      .select("*")
      .eq("tenant_id", tenantId)
      .is("archived_at", null)
      .order("name");

    if (error) throw this.handleError(error);
    return (data || []) as Category[];
  }

  async create(data: Partial<Category>): Promise<Category> {
    const { data: result, error } = await this.getClient()
      .from("categories")
      .insert(data)
      .select()
      .single();

    if (error) throw this.handleError(error);
    return result as Category;
  }
}
