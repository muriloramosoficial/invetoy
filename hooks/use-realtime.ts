"use client";

import { useEffect, useCallback, useRef } from "react";
import { createClient } from "@/lib/supabase/client";
import { RealtimePostgresChangesPayload } from "@supabase/supabase-js";

type TableName = "inventory_items" | "movements" | "products";

interface UseRealtimeOptions {
  table: TableName;
  onChange?: (payload: RealtimePostgresChangesPayload<Record<string, unknown>>) => void;
  filter?: string;
  enabled?: boolean;
}

export function useRealtimeSubscription({
  table,
  onChange,
  filter,
  enabled = true,
}: UseRealtimeOptions) {
  const callbackRef = useRef(onChange);

  useEffect(() => {
    callbackRef.current = onChange;
  });

  const handleChange = useCallback(
    (payload: RealtimePostgresChangesPayload<Record<string, unknown>>) => {
      callbackRef.current?.(payload);
    },
    []
  );

  useEffect(() => {
    if (!enabled) return;

    const supabase = createClient();

    const channel = supabase
      .channel(`realtime-${table}`)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table,
          filter,
        },
        handleChange
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [table, filter, enabled, handleChange]);
}

// Hook to receive realtime updates on inventory changes
export function useInventoryRealtime(onInventoryChange?: () => void) {
  useRealtimeSubscription({
    table: "inventory_items",
    onChange: () => {
      onInventoryChange?.();
    },
  });

  useRealtimeSubscription({
    table: "movements",
    onChange: () => {
      onInventoryChange?.();
    },
  });
}
