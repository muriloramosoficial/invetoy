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
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

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
        <Loader2 className="h-6 w-6 text-text-muted animate-spin" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-[6px] border border-brand-danger-10 bg-brand-danger-dim p-4 text-sm text-brand-danger">
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

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-semibold text-text-primary tracking-tight">Visao Geral</h1>
        <p className="text-sm text-text-muted mt-1">Health do SaaS em tempo real</p>
      </div>

      {/* North star metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard
          label="Tenants Ativos"
          value={data.active_tenants}
          total={data.total_tenants}
          suffix={`de ${data.total_tenants}`}
          icon={<Building2 className="h-4 w-4" />}
          color="text-brand"
          bg="bg-brand-8"
        />
        <MetricCard
          label="Usuarios Totais"
          value={data.total_users}
          suffix={`+${data.new_users_30d} mes`}
          icon={<Users className="h-4 w-4" />}
          color="text-brand-info"
          bg="bg-brand-info-8"
          trend={data.new_users_7d > 0 ? "up" : "down"}
          trendValue={`+${data.new_users_7d} sem`}
        />
        <MetricCard
          label="Conversao"
          value={parseInt(conversionRate)}
          suffix="%"
          suffixLabel="trial → active"
          icon={<TrendingUp className="h-4 w-4" />}
          color="text-brand"
          bg="bg-brand-8"
        />
        <MetricCard
          label="Churn"
          value={parseFloat(churnRate)}
          suffix="%"
          suffixLabel="cancelados"
          icon={<AlertTriangle className="h-4 w-4" />}
          color="text-brand-warning"
          bg="bg-brand-warning-8"
          trend={parseFloat(churnRate) > 10 ? "down" : "up"}
        />
      </div>

      {/* Signup trend - line chart */}
      <div className="rounded-[6px] border border-border-default bg-bg-card p-5">
        <div className="flex items-center justify-between mb-5">
          <div className="flex items-center gap-2">
            <Activity className="h-4 w-4 text-text-muted" />
            <h2 className="text-sm font-medium text-text-muted uppercase tracking-wider">Cadastros (14 dias)</h2>
          </div>
          <span className="text-xs text-text-muted">+{data.new_users_7d} esta semana</span>
        </div>
        <div className="h-40">
          {data.recent_activity.length > 0 ? (
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={data.recent_activity} margin={{ top: 5, right: 5, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="signupGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3ECF8E" stopOpacity={0.15} />
                    <stop offset="95%" stopColor="#3ECF8E" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#2a2a2a" />
                <XAxis
                  dataKey="date"
                  tick={{ fill: "#52525B", fontSize: 11 }}
                  tickLine={false}
                  axisLine={{ stroke: "#333" }}
                  tickFormatter={(val: string) => val.slice(5, 10)}
                />
                <YAxis tick={{ fill: "#52525B", fontSize: 11 }} tickLine={false} axisLine={false} allowDecimals={false} />
                <Tooltip
                  contentStyle={{ background: "#1a1a1a", border: "1px solid #333", borderRadius: "4px", fontSize: "12px" }}
                  labelFormatter={(label) => `Data: ${String(label).slice(5, 10)}`}
                  formatter={(value) => [`${Number(value)} cadastro${Number(value) !== 1 ? "s" : ""}`, "Cadastros"]}
                />
                <Area type="monotone" dataKey="signups" stroke="#3ECF8E" strokeWidth={2} fill="url(#signupGrad)" dot={{ r: 3, fill: "#3ECF8E", stroke: "#1a1a1a", strokeWidth: 2 }} activeDot={{ r: 5, fill: "#3ECF8E", stroke: "#121212", strokeWidth: 2 }} />
              </AreaChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-full flex items-center justify-center text-text-muted text-sm">
              Nenhum cadastro nos ultimos 14 dias
            </div>
          )}
        </div>
      </div>

      {/* Quick stats */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="rounded-[6px] border border-border-default bg-bg-card p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-[4px] bg-brand-8">
              <DollarSign className="h-4 w-4 text-brand" />
            </div>
            <div>
              <p className="text-xs text-text-muted">Trial</p>
              <p className="text-xl font-bold text-text-primary">{data.trial_tenants}</p>
            </div>
          </div>
          <p className="text-[10px] text-text-muted mt-2">Empresas em periodo de teste</p>
        </div>
        <div className="rounded-[6px] border border-border-default bg-bg-card p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-[4px] bg-brand-info-8">
              <UserPlus className="h-4 w-4 text-brand-info" />
            </div>
            <div>
              <p className="text-xs text-text-muted">Produtos Total</p>
              <p className="text-xl font-bold text-text-primary">{data.total_products.toLocaleString("pt-BR")}</p>
            </div>
          </div>
          <p className="text-[10px] text-text-muted mt-2">Itens cadastrados no sistema</p>
        </div>
        <div className="rounded-[6px] border border-border-default bg-bg-card p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-[4px] bg-brand-8">
              <Activity className="h-4 w-4 text-brand" />
            </div>
            <div>
              <p className="text-xs text-text-muted">Movimentacoes</p>
              <p className="text-xl font-bold text-text-primary">{data.total_movements.toLocaleString("pt-BR")}</p>
            </div>
          </div>
          <p className="text-[10px] text-text-muted mt-2">Total de operacoes registradas</p>
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
        <span className="text-xs font-medium text-text-muted uppercase tracking-wider">{label}</span>
        <div className={`p-1.5 rounded-[4px] ${bg}`}>{icon}</div>
      </div>
      <div className="flex items-baseline gap-2">
        <span className={`text-2xl font-bold text-text-primary`}>{typeof value === "number" && value % 1 !== 0 ? value.toFixed(1) : value}</span>
        {suffix && <span className="text-sm text-text-muted">{suffix}</span>}
      </div>
      <div className="flex items-center gap-2 mt-2">
        {trend && (
          <span className={`flex items-center gap-0.5 text-[10px] font-medium ${trend === "up" ? "text-brand" : "text-brand-danger"}`}>
            {trend === "up" ? <ArrowUpRight className="h-3 w-3" /> : <ArrowDownRight className="h-3 w-3" />}
            {trendValue}
          </span>
        )}
        {suffixLabel && <span className="text-[10px] text-text-muted">{suffixLabel}</span>}
      </div>
    </div>
  );
}
