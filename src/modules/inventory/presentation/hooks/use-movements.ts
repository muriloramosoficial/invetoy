"use client";

import { useState, useEffect, useCallback } from "react";
import { getBrowserClient } from "@infra/database/supabase/client";
import type { Movement } from "../../domain/movement.types";

export function useMovements(limit = 50) {
  const [movements, setMovements] = useState<Movement[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [refreshKey, setRefreshKey] = useState(0);
  const refresh = useCallback(() => setRefreshKey((k) => k + 1), []);

  useEffect(() => {
    let mounted = true;
    async function load() {
      try {
        const supabase = getBrowserClient();
        const { data, error } = await supabase
          .from("movements")
          .select("*, product:products(*), from_location:locations(*), to_location:locations(*)")
          .order("created_at", { ascending: false })
          .limit(limit);
        if (error) throw error;
        if (mounted) setMovements((data || []) as Movement[]);
      } catch (err: unknown) {
        if (mounted) setError(err instanceof Error ? err.message : "Erro desconhecido");
      } finally {
        if (mounted) setLoading(false);
      }
    }
    load();
    return () => { mounted = false; };
  }, [refreshKey, limit]);

  return { movements, loading, error, refresh };
}
