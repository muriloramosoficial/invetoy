"use client";

import { useState, useEffect, useCallback } from "react";
import { createClient } from "@/lib/supabase/client";
import type { Movement } from "@/types";

function isMovement(item: unknown): item is Movement {
  if (!item || typeof item !== "object") return false;
  const m = item as Record<string, unknown>;
  return typeof m.id === "string" && typeof m.type === "string";
}

interface UseMovementsOptions {
  limit?: number;
  productId?: string;
  type?: string;
}

export function useMovements(options: UseMovementsOptions = {}) {
  const [data, setData] = useState<Movement[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchMovements = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const supabase = createClient();

      let query = supabase
        .from("movements")
        .select(`
          *,
          product:products(*),
          from_location:locations!from_location_id(*),
          to_location:locations!to_location_id(*),
          user:profiles(*)
        `)
        .order("created_at", { ascending: false })
        .limit(options.limit || 50);

      if (options.productId) {
        query = query.eq("product_id", options.productId);
      }

      if (options.type) {
        query = query.eq("type", options.type);
      }

      const { data: result, error: queryError } = await query;

      if (queryError) throw queryError;

      setData(Array.isArray(result) ? result.filter(isMovement) : []);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to fetch movements");
    } finally {
      setLoading(false);
    }
  }, [options.limit, options.productId, options.type]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchMovements();
  }, [fetchMovements]);

  return {
    data,
    loading,
    error,
    refetch: fetchMovements,
  };
}
