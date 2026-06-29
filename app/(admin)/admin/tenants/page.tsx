"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import { TechBadge } from "@/components/tech-badge";
import { useToast } from "@/components/ui/toast";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableHeader,
  TableBody,
  TableHead,
  TableRow,
  TableCell,
} from "@/components/ui/table";
import { Dialog, DialogFooter } from "@/components/ui/dialog";
import {
  Building2,
  Search,
  Loader2,
  Users,
  Package,
  ArrowRightLeft,
  MapPin,
  MoreHorizontal,
  Shield,
  Ban,
  Play,
  ExternalLink,
} from "lucide-react";
import { useDropdownMenu, MenuBackdrop, MenuPanel, MenuItem } from "@/hooks/use-dropdown-menu";

interface TenantRow {
  id: string;
  name: string;
  slug: string;
  plan: string;
  subscription_status: string;
  payment_provider: string | null;
  created_at: string;
  user_count?: number;
  product_count?: number;
  movement_count?: number;
  location_count?: number;
}

export default function AdminTenantsPage() {
  const [tenants, setTenants] = useState<TenantRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { error: toastError } = useToast();
  const [search, setSearch] = useState("");
  const menu = useDropdownMenu();
  const [editModal, setEditModal] = useState<TenantRow | null>(null);
  const [editPlan, setEditPlan] = useState("free");
  const [editStatus, setEditStatus] = useState("active");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    load();
  }, []);

  async function load() {
    setLoading(true);
    try {
      const supabase = createClient();
      const { data, error } = await supabase
        .from("tenants")
        .select("id, name, slug, plan, subscription_status, payment_provider, created_at")
        .order("created_at", { ascending: false });

      if (error) throw error;

      const tenantsList = (data || []) as TenantRow[];

      // Get counts per tenant
      const ids = tenantsList.map((t) => t.id);
      if (ids.length > 0) {
        const [usersRes, productsRes, locationsRes, movementsRes] = await Promise.all([
          supabase.from("profiles").select("tenant_id"),
          supabase.from("products").select("tenant_id"),
          supabase.from("locations").select("tenant_id"),
          supabase.from("movements").select("tenant_id"),
        ]);

        const userCounts: Record<string, number> = {};
        const prodCounts: Record<string, number> = {};
        const locCounts: Record<string, number> = {};
        const movCounts: Record<string, number> = {};

        (usersRes.data || []).forEach((r: any) => { userCounts[r.tenant_id] = (userCounts[r.tenant_id] || 0) + 1; });
        (productsRes.data || []).forEach((r: any) => { prodCounts[r.tenant_id] = (prodCounts[r.tenant_id] || 0) + 1; });
        (locationsRes.data || []).forEach((r: any) => { locCounts[r.tenant_id] = (locCounts[r.tenant_id] || 0) + 1; });
        (movementsRes.data || []).forEach((r: any) => { movCounts[r.tenant_id] = (movCounts[r.tenant_id] || 0) + 1; });

        tenantsList.forEach((t) => {
          t.user_count = userCounts[t.id] || 0;
          t.product_count = prodCounts[t.id] || 0;
          t.location_count = locCounts[t.id] || 0;
          t.movement_count = movCounts[t.id] || 0;
        });
      }

      setTenants(tenantsList);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro ao carregar empresas");
    } finally {
      setLoading(false);
    }
  }

  const filtered = tenants.filter(
    (t) =>
      t.name?.toLowerCase().includes(search.toLowerCase()) ||
      t.slug?.toLowerCase().includes(search.toLowerCase())
  );

  const openEdit = (t: TenantRow) => {
    setEditModal(t);
    setEditPlan(t.plan);
    setEditStatus(t.subscription_status);
    menu.close();
  };

  const handleSaveTenant = async () => {
    if (!editModal) return;
    setSaving(true);
    try {
      const supabase = createClient();
      const { error } = await supabase
        .from("tenants")
        .update({ plan: editPlan, subscription_status: editStatus })
        .eq("id", editModal.id);
      if (error) throw error;
      setEditModal(null);
      load();
    } catch (err) {
      toastError(err instanceof Error ? err.message : "Erro ao salvar");
    } finally {
      setSaving(false);
    }
  };

  const toggleStatus = async (t: TenantRow) => {
    menu.close();
    const newStatus = t.subscription_status === "active" ? "canceled" : "active";
    try {
      const supabase = createClient();
      const { error } = await supabase
        .from("tenants")
        .update({ subscription_status: newStatus })
        .eq("id", t.id);
      if (error) throw error;
      load();
    } catch (err) {
      toastError(err instanceof Error ? err.message : "Erro ao alterar status");
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-text-primary tracking-tight">Empresas</h1>
        <p className="text-sm text-text-muted mt-1">
          {loading ? "Carregando..." : `${tenants.length} tenants · ${tenants.filter((t) => t.subscription_status === "active").length} ativos`}
        </p>
      </div>

      {error && (
        <div className="rounded-[6px] border border-brand-danger-10 bg-brand-danger-dim p-3 text-sm text-brand-danger">
          {error}
        </div>
      )}

      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-text-muted" />
        <input
          type="text"
          placeholder="Buscar empresa..."
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
              <TableHead className="text-center">Usuarios</TableHead>
              <TableHead className="text-center">Produtos</TableHead>
              <TableHead className="text-center">Movs</TableHead>
              <TableHead>Criada em</TableHead>
              <TableHead className="w-10"></TableHead>
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
                  Nenhuma empresa encontrada
                </TableCell>
              </TableRow>
            ) : (
              filtered.map((t) => (
                <TableRow key={t.id}>
                  <TableCell>
                    <div>
                      <p className="font-medium text-text-primary">{t.name}</p>
                      <p className="text-[10px] text-text-muted">{t.slug}</p>
                    </div>
                  </TableCell>
                  <TableCell>
                    <TechBadge variant={t.plan === "pro" ? "green" : t.plan === "starter" ? "blue" : "gray"}>
                      {t.plan?.toUpperCase()}
                    </TechBadge>
                  </TableCell>
                  <TableCell>
                    <TechBadge variant={
                      t.subscription_status === "active" ? "green" :
                      t.subscription_status === "trialing" ? "blue" :
                      t.subscription_status === "canceled" ? "red" :
                      t.subscription_status === "past_due" ? "yellow" :
                      "gray"
                    }>
                      {t.subscription_status?.toUpperCase()}
                    </TechBadge>
                  </TableCell>
                  <TableCell className="text-center font-mono text-sm text-text-secondary">{t.user_count || 0}</TableCell>
                  <TableCell className="text-center font-mono text-sm text-text-secondary">{t.product_count || 0}</TableCell>
                  <TableCell className="text-center font-mono text-sm text-text-secondary">{t.movement_count || 0}</TableCell>
                  <TableCell className="text-xs text-text-muted">
                    {t.created_at ? new Date(t.created_at).toLocaleDateString("pt-BR") : "-"}
                  </TableCell>                    <TableCell>
                      <div className="relative">
                        <Button
                          variant="ghost"
                          size="icon-sm"
                          onClick={(e) => menu.toggle(t.id, e)}
                        >
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* Edit modal */}
      <Dialog
        open={!!editModal}
        onClose={() => setEditModal(null)}
        title={`Gerenciar: ${editModal?.name}`}
        description="Altere o plano e status desta empresa"
      >
        <div className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-text-muted mb-1.5 uppercase tracking-wider">Plano</label>
            <select
              value={editPlan}
              onChange={(e) => setEditPlan(e.target.value)}
              className="flex h-10 w-full rounded-[6px] border border-border-default bg-bg-surface px-3 py-2 text-sm text-text-primary appearance-none focus:border-brand-20 focus:ring-1 focus:ring-brand-dim transition-colors outline-none"
            >
              <option value="free">Free</option>
              <option value="starter">Starter</option>
              <option value="pro">Pro</option>
              <option value="enterprise">Enterprise</option>
            </select>
          </div>
          <div>
            <label className="block text-xs font-medium text-text-muted mb-1.5 uppercase tracking-wider">Status</label>
            <select
              value={editStatus}
              onChange={(e) => setEditStatus(e.target.value)}
              className="flex h-10 w-full rounded-[6px] border border-border-default bg-bg-surface px-3 py-2 text-sm text-text-primary appearance-none focus:border-brand-20 focus:ring-1 focus:ring-brand-dim transition-colors outline-none"
            >
              <option value="active">Ativo</option>
              <option value="trialing">Trial</option>
              <option value="past_due">Pagamento Pendente</option>
              <option value="canceled">Cancelado</option>
            </select>
          </div>
          <DialogFooter>
            <Button variant="secondary" onClick={() => setEditModal(null)} disabled={saving}>
              Cancelar
            </Button>
            <Button onClick={handleSaveTenant} disabled={saving}>
              {saving ? "Salvando..." : "Salvar"}
            </Button>
          </DialogFooter>
        </div>
      </Dialog>
      {/* Dropdown menu using useDropdownMenu hook */}
      {menu.openId && menu.menuPos && (() => {
        const t = tenants.find((x) => x.id === menu.openId);
        if (!t) return null;
        return (
          <>
            <MenuBackdrop onClick={menu.close} />
            <MenuPanel menuPos={menu.menuPos} direction={menu.direction} width="w-48">
              <MenuItem
                onClick={() => { menu.close(); openEdit(t); }}
              >
                <Shield className="h-3.5 w-3.5" />
                Gerenciar plano
              </MenuItem>
              <MenuItem
                onClick={() => { menu.close(); toggleStatus(t); }}
                className={t.subscription_status === "active"
                  ? "text-brand-danger hover:bg-brand-danger-dim"
                  : "text-brand hover:bg-brand-dim"
                }
              >
                {t.subscription_status === "active" ? (
                  <><Ban className="h-3.5 w-3.5" /> Suspender</>
                ) : (
                  <><Play className="h-3.5 w-3.5" /> Ativar</>
                )}
              </MenuItem>
            </MenuPanel>
          </>
        );
      })()}
    </div>
  );
}
