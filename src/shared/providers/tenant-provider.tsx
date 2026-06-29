"use client";

import { createContext, useContext, useEffect, useState, useCallback } from "react";
import { getBrowserClient } from "@infra/database/supabase/client";

interface Tenant {
  id: string;
  name: string;
  plan: string;
  subscription_status: string | null;
  logo_url?: string | null;
}

interface Profile {
  id: string;
  name: string;
  email: string;
  role: string;
  tenant_id: string;
}

interface TenantContextValue {
  tenant: Tenant | null;
  profile: Profile | null;
  isLoading: boolean;
  refresh: () => void;
}

const TenantContext = createContext<TenantContextValue | undefined>(undefined);

export function TenantProvider({ children }: { children: React.ReactNode }) {
  const [tenant, setTenant] = useState<Tenant | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [refreshKey, setRefreshKey] = useState(0);

  const refresh = useCallback(() => setRefreshKey((k) => k + 1), []);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      setIsLoading(true);
      try {
        const supabase = getBrowserClient();
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
          if (!cancelled) {
            setTenant(null);
            setProfile(null);
            setIsLoading(false);
          }
          return;
        }

        const { data: profileData } = await supabase
          .from("profiles")
          .select("*")
          .eq("id", user.id)
          .single();

        if (!cancelled && profileData) {
          setProfile(profileData);

          const { data: tenantData } = await supabase
            .from("tenants")
            .select("*")
            .eq("id", profileData.tenant_id)
            .single();

          if (!cancelled && tenantData) {
            setTenant(tenantData);
          }
        }
      } catch {
        // silent
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    }

    load();
    return () => { cancelled = true; };
  }, [refreshKey]);

  return (
    <TenantContext.Provider value={{ tenant, profile, isLoading, refresh }}>
      {children}
    </TenantContext.Provider>
  );
}

export function useTenant(): TenantContextValue {
  const ctx = useContext(TenantContext);
  if (!ctx) throw new Error("useTenant must be used within TenantProvider");
  return ctx;
}
