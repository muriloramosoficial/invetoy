"use client";

import { useEffect, useRef, useCallback } from "react";
import { getBrowserClient } from "@infra/database/supabase/client";
import { RealtimePostgresChangesPayload } from "@supabase/supabase-js";

type TableName = "products" | "inventory_items" | "movements";

export function useRealtimeSubscription(
  table: TableName,
  onEvent: (payload: RealtimePostgresChangesPayload<any>) => void,
  filter?: string
) {
  const callbackRef = useRef(onEvent);
  callbackRef.current = onEvent;

  const setup = useCallback(async () => {
    const supabase = getBrowserClient();
    const channel = supabase
      .channel(`realtime:${table}`)
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table, filter },
        (payload) => callbackRef.current(payload)
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [table, filter]);

  useEffect(() => {
    const cleanup = setup();
    return () => { cleanup.then((fn) => fn()); };
  }, [setup]);
}
