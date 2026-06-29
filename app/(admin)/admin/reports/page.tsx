"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import {
  BarChart3,
  Loader2,
  TrendingUp,
  Building2,
  ArrowRightLeft,
  Package,
  Users,
} from "lucide-react";

interface TenantUsage {
  tenant_id: string;
  tenant_name: string;
  plan: string;
  user_count: number;
  product_count: number;
  location_count: number;
  movement_count: number;
}

interface GrowthPoint {
  month: string;
  tenants: number;
  users: number;
}

export default function AdminReportsPage() {
  const [tenants, setTenants] = useState<TenantUsage[]>([]);
  const [growth, setGrowth] = useState<GrowthPoint[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      setLoading(true);
      try {
        const supabase = createClient();

        const [tenantsRes, usersRes, productsRes, locationsRes, movementsRes] = await Promise.all([
          supabase.from("tenants").select("id, name, plan, created_at"),
          supabase.from("profiles").select("tenant_id, created_at"),
          supabase.from("products").select("tenant_id"),
          supabase.from("locations").select("tenant_id"),
          supabase.from("movements").select("tenant_id"),
        ]);

        if (tenantsRes.error) throw tenantsRes.error;

        const allTenants = (tenantsRes.data || []) as { id: string; name: string; plan: string; created_at: string }[];
        const allUsers = (usersRes.data || []) as { tenant_id: string; created_at: string }[];
        const allProducts = (productsRes.data || []) as { tenant_id: string }[];
        const allLocations = (locationsRes.data || []) as { tenant_id: string }[];
        const allMovements = (movementsRes.data || []) as { tenant_id: string }[];

        const tenantUsage: TenantUsage[] = allTenants.map((t) => {
          return {
            tenant_id: t.id,
            tenant_name: t.name,
            plan: t.plan,
            user_count: allUsers.filter((u) => u.tenant_id === t.id).length,
            product_count: allProducts.filter((p) => p.tenant_id === t.id).length,
            location_count: allLocations.filter((l) => l.tenant_id === t.id).length,
            movement_count: allMovements.filter((m) => m.tenant_id === t.id).length,
          };
        }).sort((a, b) => b.movement_count - a.movement_count);

        // Growth by month (last 6 months)
        const now = new Date();
        const months: GrowthPoint[] = [];
        for (let i = 5; i >= 0; i--) {
          const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
          const key = d.toISOString().slice(0, 7);
          months.push({
            month: key,
            tenants: allTenants.filter((t) => t.created_at?.slice(0, 7) <= key).length,
            users: allUsers.filter((u) => u.created_at?.slice(0, 7) <= key).length,
          });
        }

        if (!cancelled) {
          setTenants(tenantUsage);
          setGrowth(months);
        }
      } catch (err) {
        if (!cancelled) setError(err instanceof Error ? err.message : "Erro ao carregar relatorios");
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    load();
    return () => { cancelled = true; };
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-24">
        <Loader2 className="h-6 w-6 text-text-muted animate-spin" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-[6px] border border-brand-danger-10 bg-brand-danger-dim p-4 text-sm text-brand-danger">{error}</div>
    );
  }

  const maxMovement = Math.max(...tenants.map((t) => t.movement_count), 1);

  // Plan distribution
  const planCounts: Record<string, number> = {};
  tenants.forEach((t) => { planCounts[t.plan] = (planCounts[t.plan] || 0) + 1; });

  // Growth chart
  const maxTenants = Math.max(...growth.map((g) => g.tenants), 1);

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-semibold text-text-primary tracking-tight">Relatorios</h1>
        <p className="text-sm text-text-muted mt-1">Uso do SaaS por empresa</p>
      </div>

      {error && (
        <div className="rounded-[6px] border border-brand-danger-10 bg-brand-danger-dim p-3 text-sm text-brand-danger">{error}</div>
      )}

      {/* Growth chart */}
      <div className="rounded-[6px] border border-border-default bg-bg-card p-4 lg:p-5">
        <div className="flex items-center gap-2 mb-4 lg:mb-5">
          <TrendingUp className="h-4 w-4 shrink-0 text-text-muted" />
          <h2 className="text-sm font-medium text-text-muted uppercase tracking-wider">Crescimento (6 meses)</h2>
        </div>
        <div className="grid grid-cols-6 gap-2 sm:gap-3 h-24 sm:h-32">
          {growth.map((g) => {
            const h = (g.tenants / maxTenants) * 100;
            return (
              <div key={g.month} className="flex flex-col items-center justify-end h-full">
                <span className="text-[10px] text-text-muted mb-1">{g.tenants}</span>
                <div
                  className="w-full bg-brand-20 rounded-t-[2px]"
                  style={{ height: `${Math.max(h, 4)}%` }}
                />
                <span className="text-[10px] text-text-muted mt-1.5">
                  {g.month.slice(5)}
                </span>
              </div>
            );
          })}
        </div>
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 sm:gap-4 mt-4 text-[10px] text-text-muted">
          <span className="flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-brand-20 shrink-0" /> Tenants
          </span>
          <span>Crescimento mensal acumulado</span>
        </div>
      </div>

      {/* Plan distribution + tenant leaderboard */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
        <div className="rounded-[6px] border border-border-default bg-bg-card p-4 lg:p-5">
          <h2 className="text-sm font-medium text-text-muted uppercase tracking-wider mb-4">Planos</h2>
          <div className="space-y-3">
            {Object.entries(planCounts)
              .sort(([, a], [, b]) => b - a)
              .map(([plan, count]) => {
                const pct = tenants.length > 0 ? (count / tenants.length) * 100 : 0;
                const colors: Record<string, string> = {
                  free: "bg-border-default",
                  starter: "bg-brand-info",
                  pro: "bg-brand",
                  enterprise: "bg-brand-warning",
                };
                return (
                  <div key={plan}>
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm text-text-primary capitalize">{plan}</span>
                      <span className="text-xs text-text-muted">{count} ({pct.toFixed(0)}%)</span>
                    </div>
                    <div className="h-1.5 bg-bg-surface rounded-full overflow-hidden">
                      <div className={`h-full rounded-full ${colors[plan] || "bg-border-default"}`} style={{ width: `${pct}%` }} />
                    </div>
                  </div>
                );
              })}
          </div>
        </div>

        {/* Top tenants by activity */}
        <div className="lg:col-span-2 rounded-[6px] border border-border-default bg-bg-card p-5">
          <div className="flex items-center gap-2 mb-4">
            <BarChart3 className="h-4 w-4 text-text-muted" />
            <h2 className="text-sm font-medium text-text-muted uppercase tracking-wider">Empresas Mais Ativas</h2>
          </div>
          <div className="space-y-3">
            {tenants.slice(0, 8).map((t, i) => (                  <div key={t.tenant_id}>
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-1 gap-1">
                  <span className="text-sm text-text-primary">
                    <span className="text-text-muted mr-2 text-xs">#{i + 1}</span>
                    {t.tenant_name}
                  </span>
                  <div className="flex items-center gap-2 sm:gap-3 text-[10px] sm:text-xs text-text-muted flex-wrap">
                    <span>{t.user_count} usuarios</span>
                    <span>{t.product_count} prod</span>
                    <span className="text-brand font-mono">{t.movement_count} movs</span>
                  </div>
                </div>
                <div className="h-1.5 bg-bg-surface rounded-full overflow-hidden">
                  <div
                    className="h-full bg-brand-20 rounded-full"
                    style={{ width: `${(t.movement_count / maxMovement) * 100}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Full tenant table */}
      <div className="rounded-[6px] border border-border-default bg-bg-card p-4 lg:p-5">
        <h2 className="text-sm font-medium text-text-muted uppercase tracking-wider mb-3 lg:mb-4">Todas as Empresas</h2>
        <div className="overflow-x-auto -mx-1">
          <table className="w-full text-sm min-w-[500px]">
            <thead>
              <tr className="border-b border-border-default">
                <th className="text-left py-2 text-text-muted font-medium text-xs whitespace-nowrap">Empresa</th>
                <th className="text-left py-2 text-text-muted font-medium text-xs whitespace-nowrap">Plano</th>
                <th className="text-right py-2 text-text-muted font-medium text-xs whitespace-nowrap">Users</th>
                <th className="text-right py-2 text-text-muted font-medium text-xs whitespace-nowrap">Produtos</th>
                <th className="text-right py-2 text-text-muted font-medium text-xs whitespace-nowrap">Locais</th>
                <th className="text-right py-2 text-text-muted font-medium text-xs whitespace-nowrap">Movimentacoes</th>
              </tr>
            </thead>
            <tbody>
              {tenants.map((t) => (
                <tr key={t.tenant_id} className="border-b border-border-default last:border-0 hover:bg-bg-surface/[0.02]">
                  <td className="py-2 text-text-primary">{t.tenant_name}</td>
                  <td className="py-2">
                    <span className="text-[10px] text-text-muted uppercase">{t.plan}</span>
                  </td>
                  <td className="py-2 text-right text-text-secondary font-mono">{t.user_count}</td>
                  <td className="py-2 text-right text-text-secondary font-mono">{t.product_count}</td>
                  <td className="py-2 text-right text-text-secondary font-mono">{t.location_count}</td>
                  <td className="py-2 text-right text-text-secondary font-mono">{t.movement_count}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
