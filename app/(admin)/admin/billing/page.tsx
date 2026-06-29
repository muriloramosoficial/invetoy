"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import {
  DollarSign,
  TrendingUp,
  TrendingDown,
  CreditCard,
  AlertTriangle,
  Loader2,
  ArrowUpRight,
  ArrowDownRight,
  Receipt,
  Wallet,
  PieChart,
} from "lucide-react";

interface BillingData {
  total_tenants: number;
  tenants_by_plan: Record<string, number>;
  mrr: number;
  arr: number;
  active_paid: number;
  trial_count: number;
  canceled_count: number;
  churn_rate: number;
  estimated_supabase_cost: number;
  estimated_profit: number;
  plan_prices: Record<string, number>;
}

export default function AdminBillingPage() {
  const [data, setData] = useState<BillingData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      setLoading(true);
      try {
        const supabase = createClient();

        const { data: tenants, error: tenantsErr } = await supabase
          .from("tenants")
          .select("id, plan, subscription_status, created_at");

        if (tenantsErr) throw tenantsErr;

        const all = (tenants || []) as { id: string; plan: string; subscription_status: string }[];

        // NOTA: Precos hardcoded como estimativa de MRR (faturamento recorrente).
        // ATENCAO: Os precos reais cobrados no checkout sao:
        //   Starter = R$ 49,00 | Pro = R$ 149,00 (definidos em lib/asaas.ts)
        //   Enterprise = R$ 399,90 (NÃO é um plano real no Asaas - é um valor estimado)
        // Os precos podem ser editados em /admin/plans (plan_configs)
        const planPrices: Record<string, number> = {
          free: 0,
          starter: 49,      // Preco real do Asaas
          pro: 149,          // Preco real do Asaas
          enterprise: 399.90, // Apenas estimativa - nao existe no Asaas
        };

        const planCounts: Record<string, number> = { free: 0, starter: 0, pro: 0, enterprise: 0 };
        all.forEach((t) => {
          planCounts[t.plan] = (planCounts[t.plan] || 0) + 1;
        });

        const activePaid = all.filter(
          (t) => t.subscription_status === "active" && t.plan !== "free"
        );
        const trial = all.filter((t) => t.subscription_status === "trialing");
        const canceled = all.filter((t) => t.subscription_status === "canceled");

        const mrr = activePaid.reduce((sum, t) => sum + (planPrices[t.plan] || 0), 0);
        const arr = mrr * 12;
        const churnRate = all.length > 0 ? (canceled.length / all.length) * 100 : 0;

        // Supabase free tier: 50k MAU, 500MB DB, 1GB storage
        // Pro tier (if needed): ~$25/mo
        // Estimate: $0 for free tier, $25 for pro if > 50k MAU or > 500MB
        const estimatedSupabaseCost = all.length > 20 ? 25 : 0;
        const profit = mrr - estimatedSupabaseCost;

        if (!cancelled) {
          setData({
            total_tenants: all.length,
            tenants_by_plan: planCounts,
            mrr,
            arr,
            active_paid: activePaid.length,
            trial_count: trial.length,
            canceled_count: canceled.length,
            churn_rate: churnRate,
            estimated_supabase_cost: estimatedSupabaseCost,
            estimated_profit: profit,
            plan_prices: planPrices,
          });
        }
      } catch (err) {
        if (!cancelled) setError(err instanceof Error ? err.message : "Erro ao carregar dados financeiros");
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

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-semibold text-text-primary tracking-tight">Financeiro</h1>
        <p className="text-sm text-text-muted mt-1">MRR, receita e custos do SaaS</p>
      </div>

      {/* Revenue cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <div className="rounded-[6px] border border-border-default bg-bg-card p-3 lg:p-4">
          <div className="flex items-center justify-between mb-2 lg:mb-3">
            <span className="text-[10px] lg:text-xs font-medium text-text-muted uppercase tracking-wider">MRR</span>
            <div className="p-1.5 rounded-[4px] bg-brand-8">
              <DollarSign className="h-3.5 w-3.5 lg:h-4 lg:w-4 text-brand" />
            </div>
          </div>
          <div className="text-xl lg:text-2xl font-bold text-text-primary">
            R$ {data.mrr.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
          </div>
          <p className="text-[10px] text-text-muted mt-1">Receita recorrente mensal</p>
        </div>

        <div className="rounded-[6px] border border-border-default bg-bg-card p-3 lg:p-4">
          <div className="flex items-center justify-between mb-2 lg:mb-3">
            <span className="text-[10px] lg:text-xs font-medium text-text-muted uppercase tracking-wider">ARR</span>
            <div className="p-1.5 rounded-[4px] bg-brand-info-8">
              <TrendingUp className="h-3.5 w-3.5 lg:h-4 lg:w-4 text-brand-info" />
            </div>
          </div>
          <div className="text-xl lg:text-2xl font-bold text-text-primary">
            R$ {data.arr.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
          </div>
          <p className="text-[10px] text-text-muted mt-1">Receita recorrente anual</p>
        </div>

        <div className="rounded-[6px] border border-border-default bg-bg-card p-3 lg:p-4">
          <div className="flex items-center justify-between mb-2 lg:mb-3">
            <span className="text-[10px] lg:text-xs font-medium text-text-muted uppercase tracking-wider">Custo Supabase</span>
            <div className="p-1.5 rounded-[4px] bg-brand-danger-10">
              <Receipt className="h-3.5 w-3.5 lg:h-4 lg:w-4 text-brand-danger" />
            </div>
          </div>
          <div className="text-xl lg:text-2xl font-bold text-text-primary">
            R$ {data.estimated_supabase_cost.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
          </div>
          <p className="text-[10px] text-text-muted mt-1">Estimativa mensal</p>
        </div>

        <div className="rounded-[6px] border border-border-default bg-bg-card p-3 lg:p-4">
          <div className="flex items-center justify-between mb-2 lg:mb-3">
            <span className="text-[10px] lg:text-xs font-medium text-text-muted uppercase tracking-wider">Lucro Estimado</span>
            <div className="p-1.5 rounded-[4px] bg-brand-8">
              <Wallet className="h-3.5 w-3.5 lg:h-4 lg:w-4 text-brand" />
            </div>
          </div>
          <div className={`text-xl lg:text-2xl font-bold ${data.estimated_profit >= 0 ? "text-brand" : "text-brand-danger"}`}>
            R$ {data.estimated_profit.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
          </div>
          <p className="text-[10px] text-text-muted mt-1">MRR - custos estimados</p>
        </div>
      </div>

      {/* Plan breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
        <div className="rounded-[6px] border border-border-default bg-bg-card p-4 lg:p-5">
          <div className="flex items-center gap-2 mb-4">
            <PieChart className="h-4 w-4 text-text-muted" />
            <h2 className="text-sm font-medium text-text-muted uppercase tracking-wider">Planos Ativos</h2>
          </div>
          <div className="space-y-4">
            {Object.entries(data.tenants_by_plan)
              .sort(([, a], [, b]) => b - a)
              .map(([plan, count]) => {
                const revenue = count * (data.plan_prices[plan] || 0);
                const pct = data.total_tenants > 0 ? (count / data.total_tenants) * 100 : 0;
                return (
                  <div key={plan}>
                    <div className="flex items-center justify-between mb-1">
                      <div className="flex items-center gap-2">
                        <span className="text-sm text-text-primary capitalize font-medium">{plan}</span>
                        <span className="text-xs text-text-muted">R$ {data.plan_prices[plan]}/mês</span>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="text-xs text-text-secondary font-mono">{count}</span>
                        <span className="text-xs text-brand font-mono">
                          R$ {revenue.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
                        </span>
                      </div>
                    </div>
                    <div className="h-1.5 bg-bg-surface rounded-full overflow-hidden">
                      <div className="h-full bg-brand-20 rounded-full" style={{ width: `${pct}%` }} />
                    </div>
                  </div>
                );
              })}
          </div>
        </div>

        <div className="rounded-[6px] border border-border-default bg-bg-card p-5">
          <div className="flex items-center gap-2 mb-4">
            <AlertTriangle className="h-4 w-4 text-text-muted" />
            <h2 className="text-sm font-medium text-text-muted uppercase tracking-wider">Saude da Base</h2>
          </div>
          <div className="space-y-4">
            <div className="flex items-center justify-between py-3 border-b border-border-default gap-3">
              <div className="min-w-0 flex-1">
                <p className="text-sm text-text-primary">Tenants Pagantes</p>
                <p className="text-[10px] text-text-muted">Plano Starter, Pro ou Enterprise</p>
              </div>
              <span className="text-lg lg:text-xl font-bold shrink-0 text-brand">{data.active_paid}</span>
            </div>
            <div className="flex items-center justify-between py-3 border-b border-border-default gap-3">
              <div className="min-w-0 flex-1">
                <p className="text-sm text-text-primary">Em Trial</p>
                <p className="text-[10px] text-text-muted">Periodo de teste gratuito</p>
              </div>
              <span className="text-lg lg:text-xl font-bold shrink-0 text-brand-info">{data.trial_count}</span>
            </div>
            <div className="flex items-center justify-between py-3 border-b border-border-default gap-3">
              <div className="min-w-0 flex-1">
                <p className="text-sm text-text-primary">Cancelados</p>
                <p className="text-[10px] text-text-muted">Assinaturas encerradas</p>
              </div>
              <span className="text-lg lg:text-xl font-bold shrink-0 text-brand-danger">{data.canceled_count}</span>
            </div>
            <div className="flex items-center justify-between py-3 gap-3">
              <div className="min-w-0 flex-1">
                <p className="text-sm text-text-primary">Taxa de Cancelamento</p>
                <p className="text-[10px] text-text-muted">Churn rate mensal</p>
              </div>
              <span className={`text-lg lg:text-xl font-bold shrink-0 ${data.churn_rate > 10 ? "text-brand-danger" : "text-brand"}`}>
                {data.churn_rate.toFixed(1)}%
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Cost breakdown table */}
      <div className="rounded-[6px] border border-border-default bg-bg-card p-5">
        <h2 className="text-sm font-medium text-text-muted uppercase tracking-wider mb-3 lg:mb-4">Detalhamento de Custos</h2>
        <div className="overflow-x-auto -mx-1">
          <table className="w-full text-sm min-w-[400px] lg:min-w-[500px]">
            <thead>
              <tr className="border-b border-border-default">
                <th className="text-left py-2 text-text-muted font-medium text-xs">Item</th>
                <th className="text-left py-2 text-text-muted font-medium text-xs">Provider</th>
                <th className="text-right py-2 text-text-muted font-medium text-xs">Custo Mensal</th>
                <th className="text-right py-2 text-text-muted font-medium text-xs">Limite</th>
              </tr>
            </thead>
            <tbody>
              <tr className="border-b border-border-default">
                <td className="py-2 text-text-primary">Supabase (Free Tier)</td>
                <td className="py-2 text-text-muted">Supabase</td>
                <td className="py-2 text-right text-brand font-mono">$0.00</td>
                <td className="py-2 text-right text-text-muted text-xs">50k MAU, 500MB DB</td>
              </tr>
              <tr className="border-b border-border-default">
                <td className="py-2 text-text-primary">Vercel (Hobby)</td>
                <td className="py-2 text-text-muted">Vercel</td>
                <td className="py-2 text-right text-brand font-mono">$0.00</td>
                <td className="py-2 text-right text-text-muted text-xs">100GB bandwidth</td>
              </tr>
              <tr className="border-b border-border-default">
                <td className="py-2 text-text-primary">Dominio</td>
                <td className="py-2 text-text-muted">Registro.br</td>
                <td className="py-2 text-right text-text-secondary font-mono">~R$ 8/mes</td>
                <td className="py-2 text-right text-text-muted text-xs">.com.br</td>
              </tr>
              <tr>
                <td className="py-2 text-text-primary font-medium">Total Estimado</td>
                <td className="py-2"></td>
                <td className="py-2 text-right text-brand font-mono font-bold">
                  R$ {data.estimated_supabase_cost.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
                </td>
                <td className="py-2"></td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
