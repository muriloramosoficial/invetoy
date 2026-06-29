"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import { TechBadge } from "@/components/tech-badge";
import {
  Activity,
  Loader2,
  ArrowRightLeft,
  Building2,
  User,
  Package,
} from "lucide-react";

interface AuditEntry {
  id: string;
  type: string;
  description: string;
  tenant_name: string;
  user_name: string;
  details: string;
  created_at: string;
}

const typeConfig: Record<string, { label: string; color: "green" | "red" | "blue" | "yellow" | "gray"; icon: React.ReactNode }> = {
  in: { label: "Entrada", color: "green", icon: <Package className="h-3 w-3" /> },
  out: { label: "Saida", color: "red", icon: <Package className="h-3 w-3" /> },
  transfer: { label: "Transferencia", color: "blue", icon: <ArrowRightLeft className="h-3 w-3" /> },
  adjustment: { label: "Ajuste", color: "yellow", icon: <ArrowRightLeft className="h-3 w-3" /> },
  count: { label: "Contagem", color: "gray", icon: <ArrowRightLeft className="h-3 w-3" /> },
  signup: { label: "Cadastro", color: "green", icon: <User className="h-3 w-3" /> },
  plan_change: { label: "Plano", color: "blue", icon: <Building2 className="h-3 w-3" /> },
};

export default function AdminActivityPage() {
  const [entries, setEntries] = useState<AuditEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState("all");

  useEffect(() => {
    let cancelled = false;
    async function load() {
      setLoading(true);
      try {
        const supabase = createClient();

        // Load movements
        const { data: movements, error: movErr } = await supabase
          .from("movements")
          .select("id, type, quantity, notes, created_at, tenant_id, user_id, product_id")
          .order("created_at", { ascending: false })
          .limit(100);

        if (movErr) throw movErr;

        // Load profiles (for names)
        const allTenantIds = [...new Set((movements || []).map((m: any) => m.tenant_id).filter(Boolean))];
        const allUserIds = [...new Set((movements || []).map((m: any) => m.user_id).filter(Boolean))];
        const allProductIds = [...new Set((movements || []).map((m: any) => m.product_id).filter(Boolean))];

        const [tenantsRes, usersRes, productsRes] = await Promise.all([
          allTenantIds.length ? supabase.from("tenants").select("id, name").in("id", allTenantIds) : { data: [] },
          allUserIds.length ? supabase.from("profiles").select("id, name").in("id", allUserIds) : { data: [] },
          allProductIds.length ? supabase.from("products").select("id, name").in("id", allProductIds) : { data: [] },
        ]);

        const tenantMap: Record<string, string> = {};
        const userMap: Record<string, string> = {};
        const productMap: Record<string, string> = {};
        (tenantsRes.data || []).forEach((t: any) => { tenantMap[t.id] = t.name; });
        (usersRes.data || []).forEach((u: any) => { userMap[u.id] = u.name; });
        (productsRes.data || []).forEach((p: any) => { productMap[p.id] = p.name; });

        const entries: AuditEntry[] = (movements || []).map((m: any) => {
          const productName = productMap[m.product_id] || "Item desconhecido";
          const userName = userMap[m.user_id] || "Sistema";
          const tenantName = tenantMap[m.tenant_id] || "-";

          let description = "";
          let details = "";
          switch (m.type) {
            case "in":
              description = `${userName} adicionou ${m.quantity}x ${productName}`;
              details = m.notes || `Entrada de ${m.quantity} unidades`;
              break;
            case "out":
              description = `${userName} removeu ${m.quantity}x ${productName}`;
              details = m.notes || `Saida de ${m.quantity} unidades`;
              break;
            case "transfer":
              description = `${userName} transferiu ${m.quantity}x ${productName}`;
              details = m.notes || "Transferencia entre locais";
              break;
            case "adjustment":
              description = `${userName} ajustou estoque de ${productName}`;
              details = m.notes || `Ajuste de ${m.quantity} unidades`;
              break;
            case "count":
              description = `${userName} contou ${m.quantity}x ${productName}`;
              details = m.notes || "Contagem de inventario";
              break;
            default:
              description = `${userName} realizou operacao em ${productName}`;
              details = m.notes || "-";
          }

          return {
            id: m.id,
            type: m.type,
            description,
            tenant_name: tenantName,
            user_name: userName,
            details,
            created_at: m.created_at,
          };
        });

        if (!cancelled) setEntries(entries);
      } catch (err) {
        if (!cancelled) setError(err instanceof Error ? err.message : "Erro ao carregar atividade");
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    load();
    return () => { cancelled = true; };
  }, []);

  const filtered = filter === "all" ? entries : entries.filter((e) => e.type === filter);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-text-primary tracking-tight">Registro de Atividades</h1>
        <p className="text-sm text-text-muted mt-1">
          {loading ? "Carregando..." : `${entries.length} movimentacoes no historico`}
        </p>
      </div>

      {error && (
        <div className="rounded-[6px] border border-brand-danger-10 bg-brand-danger-dim p-3 text-sm text-brand-danger">{error}</div>
      )}

      {/* Filters */}
      <div className="flex gap-2 flex-wrap">
        {[
          { value: "all", label: "Todas" },
          { value: "in", label: "Entradas" },
          { value: "out", label: "Saidas" },
          { value: "transfer", label: "Transferencias" },
          { value: "adjustment", label: "Ajustes" },
        ].map((f) => (
          <button
            key={f.value}
            onClick={() => setFilter(f.value)}
            className={`px-3 py-1.5 text-xs rounded-[4px] border transition-colors ${
              filter === f.value
                ? "bg-brand-dim border-brand-20 text-brand"
                : "border-border-default text-text-muted hover:text-text-primary hover:border-border-default"
            }`}
          >
            {f.label}
          </button>
        ))}
      </div>

      {/* Timeline */}
      <div className="rounded-[6px] border border-border-default overflow-hidden">
        {loading ? (
          <div className="py-12 text-center">
            <Loader2 className="h-6 w-6 text-text-muted animate-spin mx-auto" />
          </div>
        ) : filtered.length === 0 ? (
          <div className="py-12 text-center text-text-muted">Nenhuma atividade encontrada</div>
        ) : (
          <div className="divide-y divide-border-default">
            {filtered.map((entry) => {
              const config = typeConfig[entry.type] || { label: entry.type, color: "gray" as const, icon: <Activity className="h-3 w-3" /> };
              return (
                <div key={entry.id} className="px-3 sm:px-5 py-3 hover:bg-bg-surface/[0.02] transition-colors">
                  <div className="flex items-start gap-2 sm:gap-3">
                    <div className={`p-1.5 rounded-[4px] mt-0.5 shrink-0 ${
                      config.color === "green" ? "bg-brand-8" :
                      config.color === "red" ? "bg-brand-danger-10" :
                      config.color === "blue" ? "bg-brand-info-8" :
                      config.color === "yellow" ? "bg-brand-warning-8" :
                      "bg-bg-surface"
                    }`}>
                      {config.icon}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start sm:items-center gap-2 flex-col sm:flex-row">
                        <p className="text-sm text-text-primary min-w-0">{entry.description}</p>
                        <TechBadge variant={config.color} className="shrink-0 self-start sm:self-auto">{config.label}</TechBadge>
                      </div>
                      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-1 sm:gap-2 mt-1 text-[10px] text-text-muted">
                        <span className="flex items-center gap-1">
                          <Building2 className="h-3 w-3 shrink-0" />
                          {entry.tenant_name}
                        </span>
                        <span className="hidden sm:inline">·</span>
                        <span>{entry.created_at ? new Date(entry.created_at).toLocaleString("pt-BR") : "-"}</span>
                      </div>
                      {entry.details && entry.details !== entry.description && (
                        <p className="text-xs text-text-muted mt-1 italic">{entry.details}</p>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
