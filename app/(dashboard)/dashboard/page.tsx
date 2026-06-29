"use client";

import { useState, useEffect } from "react";
import { cn } from "@/lib/utils";
import { TechBadge } from "@/components/tech-badge";
import { createClient } from "@/lib/supabase/client";
import { AlertTriangle, CalendarClock } from "lucide-react";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

interface ChartPoint {
  date: string;
  entries: number;
  exits: number;
}

interface LowStockItem {
  product_id: string;
  sku: string;
  name: string;
  current_quantity: number;
  min_stock: number;
  location_name: string;
}

interface ExpiringItem {
  product_id: string;
  name: string;
  sku: string;
  expiration_date: string;
  quantity: number;
}

interface DashboardMetrics {
  total_items: number;
  total_products: number;
  total_sale_value: number;
  low_stock_count: number;
  movements_today: number;
}

interface TooltipPayload {
  name: string;
  value: number;
  color: string;
}

interface CustomTooltipProps {
  active?: boolean;
  payload?: TooltipPayload[];
  label?: string;
}

const CustomTooltip = ({ active, payload, label }: CustomTooltipProps) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-bg-secondary border border-border-default rounded-[4px] p-3 shadow-lg">
        <p className="text-xs text-text-muted mb-1">{label}</p>
        {payload.map((entry: TooltipPayload, index: number) => (
          <p key={index} className="text-sm font-mono" style={{ color: entry.color }}>
            {entry.name}: {entry.value}
          </p>
        ))}
      </div>
    );
  }
  return null;
};

export default function DashboardPage() {
  const [metrics, setMetrics] = useState<DashboardMetrics | null>(null);
  const [chartData, setChartData] = useState<ChartPoint[]>([]);
  const [lowStockItems, setLowStockItems] = useState<LowStockItem[]>([]);
  const [expiringItems, setExpiringItems] = useState<ExpiringItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadDashboard() {
      try {
        const supabase = createClient();

        // Get inventory summary from view
        const { data: summary } = await supabase
          .from("inventory_summary")
          .select("*")
          .single();

        // Get low stock products
        const { data: lowStock } = await supabase
          .from("low_stock_products")
          .select("*")
          .limit(10);

        // Get movements for chart (last 15 days)
        const fifteenDaysAgo = new Date();
        fifteenDaysAgo.setDate(fifteenDaysAgo.getDate() - 15);

        const { data: movements } = await supabase
          .from("movements")
          .select("created_at, type, quantity")
          .gte("created_at", fifteenDaysAgo.toISOString())
          .order("created_at", { ascending: true });

        // Build chart data from movements
        const dailyMap: Record<string, { entries: number; exits: number }> = {};
        for (let i = 0; i < 15; i++) {
          const d = new Date();
          d.setDate(d.getDate() - (14 - i));
          const key = d.toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit" });
          dailyMap[key] = { entries: 0, exits: 0 };
        }

        if (movements) {
          for (const m of movements) {
            const dateStr = new Date(m.created_at).toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit" });
            if (dailyMap[dateStr]) {
              if (m.type === "in" || m.type === "count") {
                dailyMap[dateStr].entries += m.quantity;
              } else if (m.type === "out") {
                dailyMap[dateStr].exits += m.quantity;
              }
            }
          }
        }

        const chartArray = Object.entries(dailyMap).map(([date, val]) => ({
          date,
          entries: val.entries,
          exits: val.exits,
        }));

        // Get expiring items (inventory with expiration in next 30 days)
        const thirtyDaysFromNow = new Date();
        thirtyDaysFromNow.setDate(thirtyDaysFromNow.getDate() + 30);

        const { data: expiring } = await supabase
          .from("inventory_items")
          .select("product_id, expiration_date, quantity, product:products(name, sku)")
          .not("expiration_date", "is", null)
          .lte("expiration_date", thirtyDaysFromNow.toISOString().split("T")[0])
          .gte("expiration_date", new Date().toISOString().split("T")[0])
          .order("expiration_date", { ascending: true })
          .limit(5);

        if (summary) {
          setMetrics({
            total_items: Number(summary.total_quantity) || 0,
            total_products: Number(summary.total_products) || 0,
            total_sale_value: Number(summary.total_sale_value) || 0,
            low_stock_count: Number(summary.low_stock_count) || 0,
            movements_today: movements?.filter((m: { created_at: string }) =>
              new Date(m.created_at).toDateString() === new Date().toDateString()
            ).length || 0,
          });
        }

        setChartData(chartArray);
        setLowStockItems((lowStock || []) as LowStockItem[]);
        setExpiringItems((expiring?.map((e: { product_id: string; expiration_date: string; quantity: number; product: unknown }) => {
          const p = e.product as { name?: string; sku?: string } | null;
          return {
            product_id: e.product_id,
            name: p?.name || "Desconhecido",
            sku: p?.sku || "",
            expiration_date: e.expiration_date,
            quantity: e.quantity,
          };
        })) || []);
      } catch {
        // Use empty state on error
      } finally {
        setLoading(false);
      }
    }

    loadDashboard();
  }, []);

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-24 rounded-[6px] bg-bg-surface border border-border-default animate-pulse" />
          ))}
        </div>
        <div className="h-[320px] rounded-[6px] bg-bg-surface border border-border-default animate-pulse" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-text-primary tracking-tight">
          Painel
        </h1>
        <p className="text-sm text-text-muted mt-1">
          Visao geral das operacoes de inventario
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4">
        {[
          { label: "Total de Itens", value: metrics ? metrics.total_items.toLocaleString() : "-", accent: "border-t-brand", subtitle: "cadastrados" },
          { label: "Valor Total", value: metrics ? `R$ ${(metrics.total_sale_value / 1000).toFixed(1)}K` : "-", accent: "border-t-brand-info", subtitle: "valor de venda" },
          { label: "Manutencao Pendente", value: metrics ? String(metrics.low_stock_count) : "-", accent: "border-t-brand-warning", subtitle: "pendencias" },
          { label: "Movimentacoes Hoje", value: metrics ? String(metrics.movements_today) : "-", accent: "border-t-brand", subtitle: "hoje" },
        ].map((kpi) => (
          <div key={kpi.label} className={cn("rounded-[6px] bg-bg-surface border border-border-default p-4 lg:p-5 border-t-2", kpi.accent)}>
            <p className="text-[11px] font-medium tracking-[0.12em] uppercase text-text-muted mb-1.5 lg:mb-2">{kpi.label}</p>
            <p className="text-3xl lg:text-4xl font-semibold leading-none text-text-primary tracking-tight font-mono">{kpi.value}</p>
            <p className="text-xs text-text-muted mt-1.5 lg:mt-2">{kpi.subtitle}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="min-h-[280px] lg:min-h-[320px] lg:col-span-2 rounded-[6px] bg-bg-surface border border-border-default p-4 lg:p-5">
          <div className="h-full flex flex-col">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-4 gap-2">
              <div>
                <h3 className="text-sm font-medium text-text-primary">
                  Entradas x Saidas (15 Dias)
                </h3>
                <p className="text-xs text-text-muted mt-0.5">
                  Volume diario de movimentacao de inventario
                </p>
              </div>
                <div className="flex items-center gap-3 text-xs">
                <div className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-brand" />
                  <span className="text-text-muted">Entradas</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-brand-danger" />
                  <span className="text-text-muted">Saidas</span>
                </div>
              </div>
            </div>
            <div className="flex-1 min-h-0">
              {chartData.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={chartData} margin={{ top: 5, right: 5, left: -20, bottom: 0 }}>
                    <defs>
                      <linearGradient id="entriesGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#3ECF8E" stopOpacity={0.15} />
                        <stop offset="95%" stopColor="#3ECF8E" stopOpacity={0} />
                      </linearGradient>
                      <linearGradient id="exitsGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#E5484D" stopOpacity={0.1} />
                        <stop offset="95%" stopColor="#E5484D" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#2a2a2a" />
                    <XAxis dataKey="date" tick={{ fill: "#52525B", fontSize: 11 }} tickLine={false} axisLine={{ stroke: "#333" }} />
                    <YAxis tick={{ fill: "#52525B", fontSize: 11 }} tickLine={false} axisLine={false} />
                    <Tooltip content={<CustomTooltip />} />
                    <Area type="monotone" dataKey="entries" stroke="#3ECF8E" strokeWidth={2} fill="url(#entriesGrad)" dot={false} activeDot={{ r: 4, fill: "#3ECF8E", stroke: "#121212", strokeWidth: 2 }} />
                    <Area type="monotone" dataKey="exits" stroke="#E5484D" strokeWidth={2} fill="url(#exitsGrad)" dot={false} activeDot={{ r: 4, fill: "#E5484D", stroke: "#121212", strokeWidth: 2 }} />
                  </AreaChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-full flex items-center justify-center text-text-muted text-sm">
                  Nenhum dado de movimentacao ainda
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="min-h-[280px] lg:min-h-[320px] rounded-[6px] bg-bg-surface border border-border-default p-4 lg:p-5">
          <div className="h-full flex flex-col">
            <div className="flex items-center gap-2 mb-3 lg:mb-4">
              <AlertTriangle className="h-4 w-4 text-brand-warning shrink-0" />
              <h3 className="text-sm font-medium text-text-primary">Manutencoes Pendentes</h3>
              <TechBadge variant="yellow" className="ml-auto">{lowStockItems.length} itens</TechBadge>
            </div>
            <div className="flex-1 overflow-y-auto space-y-2 -mx-1">
              {lowStockItems.length > 0 ? lowStockItems.map((item) => (
                <div key={item.product_id} className="flex items-center justify-between p-2 rounded-[4px] hover:bg-bg-surface-hover transition-colors">
                  <div className="min-w-0 flex-1">
                    <p className="text-xs font-mono text-brand truncate">{item.sku}</p>
                    <p className="text-sm text-text-primary truncate">{item.name}</p>
                  </div>
                  <div className="text-right shrink-0 ml-3">
                    <p className="text-sm font-semibold text-brand-danger">{item.current_quantity}</p>
                    <p className="text-[10px] text-text-muted">min: {item.min_stock}</p>
                  </div>
                </div>
              )) : (
                <div className="flex items-center justify-center h-full text-text-muted text-sm">
                  Todos os produtos bem abastecidos
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="min-h-[280px] lg:min-h-[320px] rounded-[6px] bg-bg-surface border border-border-default p-4 lg:p-5">
          <div className="h-full flex flex-col">
            <div className="flex items-center gap-2 mb-3 lg:mb-4">
              <CalendarClock className="h-4 w-4 text-brand-info shrink-0" />
              <h3 className="text-sm font-medium text-text-primary">Vencimento Proximo</h3>
              <TechBadge variant="blue" className="ml-auto">{expiringItems.length} itens</TechBadge>
            </div>
            <div className="flex-1 overflow-y-auto space-y-2 -mx-1">
              {expiringItems.length > 0 ? expiringItems.map((item) => {
                const daysLeft = Math.ceil((new Date(item.expiration_date).getTime() - Date.now()) / (1000 * 60 * 60 * 24)); // eslint-disable-line react-hooks/purity
                return (
                  <div key={item.product_id} className="flex items-center justify-between p-2 rounded-[4px] hover:bg-bg-surface-hover transition-colors">
                    <div className="min-w-0 flex-1">
                      <p className="text-xs font-mono text-brand-info truncate">{item.sku}</p>
                      <p className="text-sm text-text-primary truncate">{item.name}</p>
                    </div>
                    <div className="text-right shrink-0 ml-3">
                      <p className="text-sm font-semibold text-brand-info">{daysLeft}d</p>
                      <p className="text-[10px] text-text-muted">{item.quantity} unidades</p>
                    </div>
                  </div>
                );
              }) : (
                <div className="flex items-center justify-center h-full text-text-muted text-sm">
                  Nenhum item vencendo em breve
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
