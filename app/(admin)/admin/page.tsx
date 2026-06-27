"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import {
  TrendingUp,
  TrendingDown,
  Users,
  Building2,
  DollarSign,
  Activity,
  Loader2,
  ArrowUpRight,
  ArrowDownRight,
  AlertTriangle,
  UserPlus,
} from "lucide-react";

interface OverviewData {
  total_tenants: number;
  active_tenants: number;
  trial_tenants: number;
  canceled_tenants: number;
  total_users: number;
  new_users_30d: number;
  new_users_7d: number;
  total_products: number;
  total_movements: number;
  recent_activity: { date: string; signups: number }[];
}

export default function AdminDashboardPage() {
  const [data, setData] = useState<OverviewData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      setLoading(true);
      try {
        const supabase = createClient();

        const now = new Date();
        const d7 = new Date(now.getTime() - 7 * 86400000);
        const d30 = new Date(now.getTime() - 30 * 86400000);

        const [tenantsRes, usersRes, productsRes, movementsRes, profilesRes] = await Promise.all([
          supabase.from("tenants").select("id, subscription_status, created_at"),
          supabase.from("profiles").select("id, created_at"),
          supabase.from("products").select("id"),
          supabase.from("movements").select("id, created_at"),
          supabase.from("profiles").select("id, created_at").gte("created_at", d30.toISOString()),
        ]);

        if (tenantsRes.error) throw tenantsRes.error;

        const tenants = (tenantsRes.data || []) as { id: string; subscription_status: string; created_at: string }[];
        const allUsers = (usersRes.data || []) as { id: string; created_at: string }[];
        const recentUsers = (profilesRes.data || []) as { id: string; created_at: string }[];

        const active = tenants.filter((t) => t.subscription_status === "active").length;
        const trial = tenants.filter((t) => t.subscription_status === "trialing").length;
        const canceled = tenants.filter((t) => t.subscription_status === "canceled").length;

        const new7 = allUsers.filter((u) => new Date(u.created_at) >= d7).length;
        const new30 = recentUsers.length;

        // Daily signups for last 14 days
        const dailyMap: Record<string, number> = {};
        for (let i = 13; i >= 0; i--) {
          const d = new Date(now.getTime() - i * 86400000);
          dailyMap[d.toISOString().slice(0, 10)] = 0;
        }
        allUsers.forEach((u) => {
          const day = u.created_at?.slice(0, 10);
          if (day && dailyMap[day] !== undefined) dailyMap[day]++;
        });

        if (!cancelled) {
          setData({
            total_tenants: tenants.length,
            active_tenants: active,
            trial_tenants: trial,
            canceled_tenants: canceled,
            total_users: allUsers.length,
            new_users_30d: new30,
            new_users_7d: new7,
            total_products: productsRes.data?.length || 0,
            total_movements: movementsRes.data?.length || 0,
            recent_activity: Object.entries(dailyMap).map(([date, signups]) => ({ date, signups })),
          });
        }
      } catch (err) {
        if (!cancelled) setError(err instanceof Error ? err.message : "Erro ao carregar overview");
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
        <Loader2 className="h-6 w-6 text-gray-400 animate-spin" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-[6px] border border-red-500/20 bg-red-500/5 p-4 text-sm text-red-400">
        {error}
      </div>
    );
  }

  if (!data) return null;

  const churnRate = data.total_tenants > 0
    ? ((data.canceled_tenants / data.total_tenants) * 100).toFixed(1)
    : "0";

  const conversionRate = data.total_tenants > 0
    ? ((data.active_tenants / data.total_tenants) * 100).toFixed(0)
    : "0";

  const maxDaily = Math.max(...data.recent_activity.map((d) => d.signups), 1);

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-semibold text-white tracking-tight">Overview</h1>
        <p className="text-sm text-gray-500 mt-1">Health do SaaS em tempo real</p>
      </div>

      {/* North star metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard
          label="Tenants Ativos"
          value={data.active_tenants}
          total={data.total_tenants}
          suffix={`de ${data.total_tenants}`}
          icon={<Building2 className="h-4 w-4" />}
          color="text-emerald-400"
          bg="bg-emerald-500/10"
        />
        <MetricCard
          label="Usuarios Totais"
          value={data.total_users}
          suffix={`+${data.new_users_30d} mes`}
          icon={<Users className="h-4 w-4" />}
          color="text-blue-400"
          bg="bg-blue-500/10"
          trend={data.new_users_7d > 0 ? "up" : "down"}
          trendValue={`+${data.new_users_7d} sem`}
        />
        <MetricCard
          label="Conversao"
          value={parseInt(conversionRate)}
          suffix="%"
          suffixLabel="trial → active"
          icon={<TrendingUp className="h-4 w-4" />}
          color="text-violet-400"
          bg="bg-violet-500/10"
        />
        <MetricCard
          label="Churn"
          value={parseFloat(churnRate)}
          suffix="%"
          suffixLabel="cancelados"
          icon={<AlertTriangle className="h-4 w-4" />}
          color="text-amber-400"
          bg="bg-amber-500/10"
          trend={parseFloat(churnRate) > 10 ? "down" : "up"}
        />
      </div>

      {/* Signup trend */}
      <div className="rounded-[6px] border border-border-default bg-bg-card p-5">
        <div className="flex items-center justify-between mb-5">
          <div className="flex items-center gap-2">
            <Activity className="h-4 w-4 text-gray-400" />
            <h2 className="text-sm font-medium text-gray-400 uppercase tracking-wider">Cadastros (14 dias)</h2>
          </div>
          <span className="text-xs text-gray-500">+{data.new_users_7d} esta semana</span>
        </div>
        <div className="flex items-end gap-1 h-28">
          {data.recent_activity.map((d) => {
            const height = (d.signups / maxDaily) * 100;
            return (
              <div key={d.date} className="flex-1 flex flex-col items-center gap-1 group relative">
                <div className="absolute -top-8 hidden group-hover:block bg-gray-800 text-white text-[10px] px-2 py-1 rounded whitespace-nowrap z-10">
                  {d.date.slice(5, 10)}: {d.signups} cadastro{d.signups !== 1 ? "s" : ""}
                </div>
                <div
                  className="w-full bg-blue-500/30 hover:bg-blue-500/50 rounded-t-[2px] transition-colors cursor-default"
                  style={{ height: `${Math.max(height, d.signups > 0 ? 8 : 2)}%` }}
                />
                {d.date.endsWith("-01") || d.date.endsWith("-08") || d.date.endsWith("-15") || d.date.endsWith("-22") ? (
                  <span className="text-[9px] text-gray-600">{d.date.slice(5, 10)}</span>
                ) : (
                  <span className="text-[9px] text-gray-700">{d.date.slice(8, 10)}</span>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Quick stats */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="rounded-[6px] border border-border-default bg-bg-card p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-[4px] bg-emerald-500/10">
              <DollarSign className="h-4 w-4 text-emerald-400" />
            </div>
            <div>
              <p className="text-xs text-gray-500">Trial</p>
              <p className="text-xl font-bold text-white">{data.trial_tenants}</p>
            </div>
          </div>
          <p className="text-[10px] text-gray-600 mt-2">Empresas em periodo de teste</p>
        </div>
        <div className="rounded-[6px] border border-border-default bg-bg-card p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-[4px] bg-blue-500/10">
              <UserPlus className="h-4 w-4 text-blue-400" />
            </div>
            <div>
              <p className="text-xs text-gray-500">Produtos Total</p>
              <p className="text-xl font-bold text-white">{data.total_products.toLocaleString("pt-BR")}</p>
            </div>
          </div>
          <p className="text-[10px] text-gray-600 mt-2">Itens cadastrados no sistema</p>
        </div>
        <div className="rounded-[6px] border border-border-default bg-bg-card p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-[4px] bg-violet-500/10">
              <Activity className="h-4 w-4 text-violet-400" />
            </div>
            <div>
              <p className="text-xs text-gray-500">Movimentacoes</p>
              <p className="text-xl font-bold text-white">{data.total_movements.toLocaleString("pt-BR")}</p>
            </div>
          </div>
          <p className="text-[10px] text-gray-600 mt-2">Total de operacoes registradas</p>
        </div>
      </div>
    </div>
  );
}

function MetricCard({
  label,
  value,
  total,
  suffix,
  suffixLabel,
  icon,
  color,
  bg,
  trend,
  trendValue,
}: {
  label: string;
  value: number;
  total?: number;
  suffix?: string;
  suffixLabel?: string;
  icon: React.ReactNode;
  color: string;
  bg: string;
  trend?: "up" | "down";
  trendValue?: string;
}) {
  return (
    <div className="rounded-[6px] border border-border-default bg-bg-card p-4">
      <div className="flex items-center justify-between mb-3">
        <span className="text-xs font-medium text-gray-500 uppercase tracking-wider">{label}</span>
        <div className={`p-1.5 rounded-[4px] ${bg}`}>{icon}</div>
      </div>
      <div className="flex items-baseline gap-2">
        <span className={`text-2xl font-bold text-white`}>{typeof value === "number" && value % 1 !== 0 ? value.toFixed(1) : value}</span>
        {suffix && <span className="text-sm text-gray-500">{suffix}</span>}
      </div>
      <div className="flex items-center gap-2 mt-2">
        {trend && (
          <span className={`flex items-center gap-0.5 text-[10px] font-medium ${trend === "up" ? "text-emerald-400" : "text-red-400"}`}>
            {trend === "up" ? <ArrowUpRight className="h-3 w-3" /> : <ArrowDownRight className="h-3 w-3" />}
            {trendValue}
          </span>
        )}
        {suffixLabel && <span className="text-[10px] text-gray-600">{suffixLabel}</span>}
      </div>
    </div>
  );
}
