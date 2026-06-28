"use client";

import { useState, useEffect, useCallback } from "react";
import { createClient } from "@/lib/supabase/client";
import type { Product, InventoryItem } from "@/types";

function isInventoryWithProduct(item: unknown): item is InventoryWithProduct {
  if (!item || typeof item !== "object") return false;
  const i = item as Record<string, unknown>;
  return "product_id" in i || "quantity" in i || "id" in i;
}

interface UseInventoryOptions {
  search?: string;
  categoryId?: string;
  status?: "ok" | "low" | "critical";
  page?: number;
  pageSize?: number;
}

interface InventoryWithProduct extends InventoryItem {
  product: Product;
}

export function useInventory(options: UseInventoryOptions = {}) {
  const [data, setData] = useState<InventoryWithProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchInventory = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const supabase = createClient();

      let query = supabase
        .from("inventory_items")
        .select(`
          *,
          product:products(*),
          location:locations(*)
        `);

      // Apply filters
      if (options.search) {
        const { data: matchingProducts } = await supabase
          .from("products")
          .select("id")
          .or(`name.ilike.%${options.search}%,sku.ilike.%${options.search}%`);

        if (matchingProducts && matchingProducts.length > 0) {
          query = query.in("product_id", matchingProducts.map((p: { id: string }) => p.id));
        } else {
          setData([]);
          setLoading(false);
          return;
        }
      }

      if (options.categoryId) {
        query = query.eq("product.category_id", options.categoryId);
      }

      // Order by latest
      query = query.order("inventory_items.updated_at", { ascending: false });

      // Paginate
      if (options.page && options.pageSize) {
        const from = (options.page - 1) * options.pageSize;
        const to = from + options.pageSize - 1;
        query = query.range(from, to);
      }

      const { data: result, error: queryError } = await query;

      if (queryError) throw queryError;

      setData(Array.isArray(result) ? result.filter(isInventoryWithProduct) : []);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to fetch inventory");
    } finally {
      setLoading(false);
    }
  }, [options.search, options.categoryId, options.page, options.pageSize]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchInventory();
  }, [fetchInventory]);

  return {
    data,
    loading,
    error,
    refetch: fetchInventory,
  };
}
