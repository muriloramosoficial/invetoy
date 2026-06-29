"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import { useToast } from "@/components/ui/toast";
import { Button } from "@/components/ui/button";
import { TechBadge } from "@/components/tech-badge";
import {
  Table,
  TableHeader,
  TableBody,
  TableHead,
  TableRow,
  TableCell,
} from "@/components/ui/table";
import {
  Loader2,
  CreditCard,
  Check,
  X,
  ExternalLink,
  Ban,
  Play,
  Search,
  Copy,
} from "lucide-react";

interface SubscriptionRow {
  tenant_id: string;
  tenant_name: string;
  tenant_slug: string;
  plan: string;
  subscription_id: string | null;
  subscription_status: string | null;
  payment_provider: string | null;
  payment_customer_id: string | null;
  created_at: string;
  user_count?: number;
}

export default function AdminSubscriptionsPage() {
  const [data, setData] = useState<SubscriptionRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { success: toastSuccess, error: toastError } = useToast();
  const [search, setSearch] = useState("");
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  useEffect(() => {
    load();
  }, []);

  async function load() {
    setLoading(true);
    try {
      const supabase = createClient();
      const { data: tenants, error } = await supabase
        .from("tenants")
        .select("id, name, slug, plan, subscription_id, subscription_status, payment_provider, payment_customer_id, created_at")
        .order("created_at", { ascending: false });

      if (error) throw error;

      const rows: SubscriptionRow[] = (tenants || []).map((t: Record<string, unknown>) => ({
        tenant_id: t.id as string,
        tenant_name: t.name as string,
        tenant_slug: t.slug as string,
        plan: t.plan as string,
        subscription_id: t.subscription_id as string | null,
        subscription_status: t.subscription_status as string | null,
        payment_provider: t.payment_provider as string | null,
        payment_customer_id: t.payment_customer_id as string | null,
        created_at: t.created_at as string,
      }));

      // Get user counts per tenant
      const { data: profiles } = await supabase
        .from("profiles")
        .select("tenant_id");

      const userCounts: Record<string, number> = {};
      (profiles || []).forEach((p: { tenant_id: string }) => {
        userCounts[p.tenant_id] = (userCounts[p.tenant_id] || 0) + 1;
      });

      rows.forEach((r) => {
        r.user_count = userCounts[r.tenant_id] || 0;
      });

      setData(rows);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro ao carregar assinaturas");
    } finally {
      setLoading(false);
    }
  }

  const toggleStatus = async (tenantId: string, currentStatus: string | null) => {
    setActionLoading(tenantId);
    const newStatus = currentStatus === "active" ? "canceled" : "active";
    try {
      const supabase = createClient();
      const { error } = await supabase
        .from("tenants")
        .update({ subscription_status: newStatus })
        .eq("id", tenantId);
      if (error) throw error;
      load();
    } catch (err) {
      toastError(err instanceof Error ? err.message : "Erro ao alterar status");
    } finally {
      setActionLoading(null);
    }
  };

  const filtered = data.filter(
    (r) =>
      r.tenant_name?.toLowerCase().includes(search.toLowerCase()) ||
      r.tenant_slug?.toLowerCase().includes(search.toLowerCase()) ||
      r.plan?.toLowerCase().includes(search.toLowerCase()) ||
      r.subscription_status?.toLowerCase().includes(search.toLowerCase())
  );

  const statusBadge = (status: string | null) => {
    const variant =
      status === "active" ? "green" :
      status === "trialing" ? "blue" :
      status === "past_due" ? "yellow" :
      status === "canceled" ? "red" :
      "gray";
    return <TechBadge variant={variant}>{status?.toUpperCase() || "NENHUM"}</TechBadge>;
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-text-primary tracking-tight">Assinaturas</h1>
          <p className="text-sm text-text-muted mt-1">
            {loading ? "Carregando..." : `${data.length} assinaturas · ${data.filter((r) => r.subscription_status === "active").length} ativas`}
          </p>
        </div>
        <Button variant="secondary" onClick={load} disabled={loading}>
          {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Atualizar"}
        </Button>
      </div>

      {error && (
        <div className="rounded-[6px] border border-brand-danger-10 bg-brand-danger-dim p-3 text-sm text-brand-danger flex items-center justify-between">
          <span>{error}</span>
          <button onClick={() => setError(null)} className="text-brand-danger font-bold ml-2">&times;</button>
        </div>
      )}

      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-text-muted" />
        <input
          type="text"
          placeholder="Buscar por empresa, plano ou status..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full h-10 pl-10 pr-3 rounded-[6px] border border-border-default bg-bg-surface text-sm text-text-primary placeholder:text-text-muted focus:border-brand-20 focus:ring-1 focus:ring-brand-dim transition-colors outline-none"
        />
      </div>

      <div className="rounded-[6px] border border-border-default overflow-x-auto">
        <Table className="min-w-[700px]">
          <TableHeader>
            <TableRow>
              <TableHead>Empresa</TableHead>
              <TableHead>Plano</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>ID Asaas</TableHead>
              <TableHead>Usuarios</TableHead>
              <TableHead>Provider</TableHead>
              <TableHead>Desde</TableHead>
              <TableHead className="w-24 text-right">Acoes</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={8} className="text-center py-12">
                  <Loader2 className="h-6 w-6 text-text-muted animate-spin mx-auto" />
                </TableCell>
              </TableRow>
            ) : filtered.length === 0 ? (
              <TableRow>
                <TableCell colSpan={8} className="text-center py-12 text-text-muted">
                  Nenhuma assinatura encontrada
                </TableCell>
              </TableRow>
            ) : (
              filtered.map((r) => (
                <TableRow key={r.tenant_id}>
                  <TableCell>
                    <p className="font-medium text-text-primary">{r.tenant_name}</p>
                    <p className="text-[10px] text-text-muted">{r.tenant_slug}</p>
                  </TableCell>
                  <TableCell>
                    <TechBadge variant={r.plan === "pro" ? "green" : r.plan === "starter" ? "blue" : "gray"}>
                      {r.plan?.toUpperCase()}
                    </TechBadge>
                  </TableCell>
                  <TableCell>{statusBadge(r.subscription_status)}</TableCell>
                  <TableCell>
                    {r.subscription_id ? (
                      <div className="flex items-center gap-1">
                        <span className="text-xs font-mono text-text-muted truncate max-w-[100px]" title={r.subscription_id}>
                          {r.subscription_id}
                        </span>
                        <button
                          onClick={() => {
                            navigator.clipboard.writeText(r.subscription_id!);
                            toastSuccess("ID copiado!");
                          }}
                          className="shrink-0 p-0.5 rounded text-text-muted hover:text-text-primary hover:bg-bg-surface transition-colors"
                          title="Copiar ID"
                        >
                          <Copy className="h-3 w-3" />
                        </button>
                      </div>
                    ) : (
                      <span className="text-xs text-text-muted">-</span>
                    )}
                  </TableCell>
                  <TableCell className="text-center font-mono text-sm">{r.user_count}</TableCell>
                  <TableCell className="text-xs text-text-muted">{r.payment_provider || "-"}</TableCell>
                  <TableCell className="text-xs text-text-muted">
                    {r.created_at ? new Date(r.created_at).toLocaleDateString("pt-BR") : "-"}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-1">
                      <Button
                        variant="ghost"
                        size="icon-sm"
                        onClick={() => toggleStatus(r.tenant_id, r.subscription_status)}
                        disabled={actionLoading === r.tenant_id}
                        className={
                          r.subscription_status === "active"
                            ? "text-brand-danger hover:text-brand-danger"
                            : "text-brand hover:text-brand"
                        }
                        title={r.subscription_status === "active" ? "Suspender" : "Ativar"}
                      >
                        {r.subscription_status === "active" ? (
                          <Ban className="h-3.5 w-3.5" />
                        ) : (
                          <Play className="h-3.5 w-3.5" />
                        )}
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: "Ativas", value: data.filter((r) => r.subscription_status === "active").length, color: "text-brand", desc: "assinaturas pagas" },
          { label: "Trial", value: data.filter((r) => r.subscription_status === "trialing").length, color: "text-brand-info", desc: "em periodo de teste" },
          { label: "Canceladas", value: data.filter((r) => r.subscription_status === "canceled").length, color: "text-brand-danger", desc: "assinaturas encerradas" },
          { label: "Pendentes", value: data.filter((r) => r.subscription_status === "past_due" || r.subscription_status === "incomplete").length, color: "text-brand-warning", desc: "com pagamento pendente" },
        ].map((card) => (
          <div key={card.label} className="rounded-[6px] border border-border-default bg-bg-card p-4">
            <p className="text-xs font-medium text-text-muted uppercase tracking-wider">{card.label}</p>
            <p className={`text-2xl font-bold mt-1 ${card.color}`}>{card.value}</p>
            <p className="text-[10px] text-text-muted mt-1">{card.desc}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
