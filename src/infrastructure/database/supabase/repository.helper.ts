// ─── Supabase Repository Helper ───
// ✅ Template Method: métodos base para repositórios
// ✅ DRY: paginação, filtro de tenant, tratamento de erro centralizados

import type { PostgrestError } from "@supabase/postgrest-js";
import { getAdminClient } from "./client";
import { AppError } from "@core/errors/app-error";

export interface PaginatedQueryResult<T> {
  data: T[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

export abstract class SupabaseRepository {
  protected getClient() {
    return getAdminClient();
  }

  protected async paginate<T>(
    query: any,
    page: number = 1,
    pageSize: number = 50
  ): Promise<PaginatedQueryResult<T>> {
    const from = (page - 1) * pageSize;
    const to = from + pageSize - 1;

    const { data, count, error } = await query
      .order("created_at", { ascending: false })
      .range(from, to);

    if (error) throw this.handleError(error);

    return {
      data: (data || []) as T[],
      total: count || 0,
      page,
      pageSize,
      totalPages: Math.ceil((count || 0) / pageSize),
    };
  }

  protected applyTenantFilter(query: any, tenantId: string) {
    return query.eq("tenant_id", tenantId);
  }

  protected handleError(error: PostgrestError | Error): AppError {
    console.error("[SupabaseRepository]", error);
    const code = "code" in error ? error.code : "UNKNOWN";
    if (code === "23505") {
      return new AppError("Registro duplicado", 409, "DUPLICATE");
    }
    if (code === "42501") {
      return new AppError("Acesso negado", 403, "FORBIDDEN");
    }
    return new AppError(error.message || "Erro no banco de dados", 500, "DB_ERROR");
  }

  protected async executeRpc<T>(
    rpcName: string,
    params: Record<string, unknown>
  ): Promise<T> {
    const { data, error } = await this.getClient().rpc(rpcName, params);
    if (error) throw this.handleError(error);
    return data as T;
  }
}
