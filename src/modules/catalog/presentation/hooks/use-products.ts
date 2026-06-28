"use client";

import { useState, useEffect, useCallback } from "react";
import { getBrowserClient } from "@infra/database/supabase/client";
import type { PostgrestError } from "@supabase/supabase-js";
import type { Product } from "../../domain/product.types";
import type { Category } from "../../domain/category.types";

type ProductWithCategory = Product & { category?: Category };
type ProductInsert = Omit<Product, "id" | "created_at" | "updated_at" | "archived_at">;
type ProductUpdate = Partial<ProductInsert>;

export function useProducts(tenantId?: string) {
  const [products, setProducts] = useState<ProductWithCategory[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [filterCategory, setFilterCategory] = useState("all");
  const [showArchived, setShowArchived] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);
  const refresh = useCallback(() => setRefreshKey((k) => k + 1), []);

  useEffect(() => {
    let mounted = true;
    async function load() {
      setLoading(true);
      setError(null);
      try {
        const supabase = getBrowserClient();
        const query = supabase.from("products").select("*, category:categories(*)");
        if (!showArchived) query.is("archived_at", null);
        const [productResult, categoryResult] = await Promise.all([
          query,
          supabase.from("categories").select("*"),
        ]);
        if (productResult.error) throw productResult.error;
        if (categoryResult.error) throw categoryResult.error;
        if (mounted) {
          setProducts((productResult.data || []) as ProductWithCategory[]);
          setCategories(categoryResult.data || []);
        }
      } catch (err: unknown) {
        if (mounted) setError(err instanceof Error ? err.message : "Erro desconhecido");
      } finally {
        if (mounted) setLoading(false);
      }
    }
    load();
    return () => { mounted = false; };
  }, [refreshKey, showArchived]);

  const create = useCallback(async (data: ProductInsert) => {
    const { error } = await getBrowserClient().from("products").insert(data);
    if (error) throw error;
    refresh();
  }, [refresh]);

  const update = useCallback(async (id: string, data: ProductUpdate) => {
    const { error } = await getBrowserClient().from("products").update(data).eq("id", id);
    if (error) throw error;
    refresh();
  }, [refresh]);

  const archive = useCallback(async (id: string) => {
    await getBrowserClient()
      .from("products")
      .update({ archived_at: new Date().toISOString() })
      .eq("id", id);
    refresh();
  }, [refresh]);

  const filtered = products.filter(
    (p) =>
      (p.name.toLowerCase().includes(search) || p.sku.toLowerCase().includes(search)) &&
      (filterCategory === "all" || p.category_id === filterCategory)
  );

  return {
    products: filtered,
    categories,
    loading,
    error,
    search,
    setSearch,
    filterCategory,
    setFilterCategory,
    showArchived,
    setShowArchived,
    refresh,
    create,
    update,
    archive,
  };
}
