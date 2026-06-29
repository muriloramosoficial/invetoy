"use client";

import { useState, useEffect, useCallback } from "react";
import { getBrowserClient } from "@infra/database/supabase/client";
import type { InventoryItem } from "../../domain/inventory.types";

export function useInventory() {
  const [items, setItems] = useState<InventoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;
    async function load() {
      try {
        const supabase = getBrowserClient();
        const { data, error } = await supabase
          .from("inventory_items")
          .select("*, product:products(*), location:locations(*)");
        if (error) throw error;
        if (mounted) setItems((data || []) as InventoryItem[]);
      } catch (err: unknown) {
        if (mounted) setError(err instanceof Error ? err.message : "Erro desconhecido");
      } finally {
        if (mounted) setLoading(false);
      }
    }
    load();
    return () => { mounted = false; };
  }, []);

  return { items, loading, error };
}
