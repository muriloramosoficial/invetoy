"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import { TechBadge } from "@/components/tech-badge";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableHeader,
  TableBody,
  TableHead,
  TableRow,
  TableCell,
} from "@/components/ui/table";
import {
  Users,
  Search,
  Loader2,
  Shield,
  ShieldOff,
  Building2,
  MoreHorizontal,
  LogIn,
  Check,
  X,
  Key,
} from "lucide-react";

interface UserRow {
  id: string;
  name: string;
  email: string;
  role: string;
  is_system_admin: boolean;
  created_at: string;
  tenant_id: string;
  tenants?: { name: string; plan: string; slug: string } | null;
}

export default function AdminUsersPage() {
  const [users, setUsers] = useState<UserRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [updating, setUpdating] = useState<string | null>(null);
  const [menuOpen, setMenuOpen] = useState<string | null>(null);
  const [editingRole, setEditingRole] = useState<string | null>(null);
  const [newRole, setNewRole] = useState("user");

  useEffect(() => {
    load();
  }, []);

  async function load() {
    setLoading(true);
    try {
      const supabase = createClient();
      const { data, error } = await supabase
        .from("profiles")
        .select("id, name, email, role, is_system_admin, created_at, tenant_id, tenants(name, plan, slug)")
        .order("created_at", { ascending: false });

      if (error) throw error;
      setUsers((data || []) as unknown as UserRow[]);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro ao carregar usuarios");
    } finally {
      setLoading(false);
    }
  }

  const toggleAdmin = async (userId: string, currentValue: boolean) => {
    setUpdating(userId);
    try {
      const supabase = createClient();
      const { error } = await supabase
        .from("profiles")
        .update({ is_system_admin: !currentValue })
        .eq("id", userId);
      if (error) throw error;
      setSuccess(`Admin do sistema ${!currentValue ? "adicionado" : "removido"} com sucesso`);
      setTimeout(() => setSuccess(null), 3000);
      setUsers((prev) =>
        prev.map((u) => u.id === userId ? { ...u, is_system_admin: !currentValue } : u)
      );
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro ao atualizar");
    } finally {
      setUpdating(null);
      setMenuOpen(null);
    }
  };

  const changeRole = async (userId: string, role: string) => {
    setUpdating(userId);
    try {
      const supabase = createClient();
      const { error } = await supabase
        .from("profiles")
        .update({ role })
        .eq("id", userId);
      if (error) throw error;
      setSuccess(`Funcao alterada para "${role}" com sucesso`);
      setTimeout(() => setSuccess(null), 3000);
      setUsers((prev) =>
        prev.map((u) => u.id === userId ? { ...u, role } : u)
      );
      setEditingRole(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro ao alterar funcao");
    } finally {
      setUpdating(null);
    }
  };

  const getTenant = (u: UserRow) => {
    if (!u.tenants || typeof u.tenants !== "object") return { name: "-", plan: "-", slug: "" };
    return u.tenants as { name: string; plan: string; slug: string };
  };

  const filtered = users.filter(
    (u) =>
      u.name?.toLowerCase().includes(search.toLowerCase()) ||
      u.email?.toLowerCase().includes(search.toLowerCase()) ||
      getTenant(u).name.toLowerCase().includes(search.toLowerCase())
  );

  const adminCount = users.filter((u) => u.is_system_admin).length;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-text-primary tracking-tight">Usuarios</h1>
        <p className="text-sm text-text-muted mt-1">
          {loading ? "Carregando..." : `${users.length} usuarios · ${adminCount} admins do sistema`}
        </p>
      </div>

      {/* Legenda - no topo */}
      <div className="rounded-[6px] border border-border-default bg-bg-card p-4">
        <h3 className="text-xs font-medium text-text-muted uppercase tracking-wider mb-3">Legenda</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-xs">
          <div className="flex items-center gap-2">
            <TechBadge variant="gray">USUARIO</TechBadge>
            <span className="text-text-muted">Acesso basico ao sistema</span>
          </div>
          <div className="flex items-center gap-2">
            <TechBadge variant="blue">GERENTE</TechBadge>
            <span className="text-text-muted">Pode gerenciar equipe</span>
          </div>
          <div className="flex items-center gap-2">
            <TechBadge variant="green">ADMINISTRADOR</TechBadge>
            <span className="text-text-muted">Admin do tenant</span>
          </div>
          <div className="flex items-center gap-2">
            <TechBadge variant="red">ADMIN DO SISTEMA</TechBadge>
            <span className="text-text-muted">Admin do SaaS (area /admin)</span>
          </div>
        </div>
      </div>

      {error && (
        <div className="rounded-[6px] border border-brand-danger-10 bg-brand-danger-dim p-3 text-sm text-brand-danger flex items-center justify-between">
          <span>{error}</span>
          <button onClick={() => setError(null)} className="text-brand-danger hover:text-brand-danger">
            <X className="h-4 w-4" />
          </button>
        </div>
      )}

      {success && (
        <div className="rounded-[6px] border border-brand-10 bg-brand-dim p-3 text-sm text-brand flex items-center gap-2">
          <Check className="h-4 w-4" />
          {success}
        </div>
      )}

      <div className="flex items-center gap-4">
        <div className="relative max-w-sm flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-text-muted" />
          <input
            type="text"
            placeholder="Buscar por nome, email, empresa..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full h-10 pl-10 pr-3 rounded-[6px] border border-border-default bg-bg-surface text-sm text-text-primary placeholder:text-text-muted focus:border-brand-20 focus:ring-1 focus:ring-brand-dim transition-colors outline-none"
          />
        </div>
        <Button variant="secondary" onClick={load} disabled={loading}>
          {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Atualizar"}
        </Button>
      </div>

      <div className="rounded-[6px] border border-border-default overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Usuario</TableHead>
              <TableHead>Empresa</TableHead>
              <TableHead>Plano</TableHead>
              <TableHead>Funcao (clique para editar)</TableHead>
              <TableHead>Admin do Sistema</TableHead>
              <TableHead>Cadastro</TableHead>
              <TableHead className="w-10"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-12">
                  <Loader2 className="h-6 w-6 text-text-muted animate-spin mx-auto" />
                </TableCell>
              </TableRow>
            ) : filtered.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-12 text-text-muted">
                  Nenhum usuario encontrado
                </TableCell>
              </TableRow>
            ) : (
              filtered.map((u) => {
                const tenant = getTenant(u);
                return (
                  <TableRow key={u.id}>
                    <TableCell>
                      <div>
                        <p className="font-medium text-text-primary">{u.name || "-"}</p>
                        <p className="text-[10px] text-text-muted">{u.email}</p>
                      </div>
                    </TableCell>
                    <TableCell>
                      <span className="text-xs text-text-muted flex items-center gap-1">
                        <Building2 className="h-3 w-3" />
                        {tenant.name}
                      </span>
                    </TableCell>
                    <TableCell>
                      <TechBadge variant={tenant.plan === "pro" ? "green" : tenant.plan === "starter" ? "blue" : "gray"}>
                        {tenant.plan?.toUpperCase()}
                      </TechBadge>
                    </TableCell>
                    <TableCell>
                      {editingRole === u.id ? (
                        <div className="flex items-center gap-2">
                          <select
                            value={newRole}
                            onChange={(e) => setNewRole(e.target.value)}
                            className="h-8 px-2 rounded-[4px] border border-border-default bg-bg-surface text-xs text-text-primary outline-none focus:border-brand-20"
                          >
                            <option value="user">Usuario</option>
                            <option value="admin">Administrador</option>
                            <option value="manager">Gerente</option>
                            <option value="operator">Operador</option>
                          </select>
                          <button
                            onClick={() => changeRole(u.id, newRole)}
                            disabled={updating === u.id}
                            className="p-1 rounded text-brand hover:bg-brand-8"
                          >
                            <Check className="h-3.5 w-3.5" />
                          </button>
                          <button
                            onClick={() => setEditingRole(null)}
                            className="p-1 rounded text-text-muted hover:bg-bg-surface"
                          >
                            <X className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      ) : (
                        <button
                          onClick={() => { setEditingRole(u.id); setNewRole(u.role || "user"); }}
                          className="group flex items-center gap-1.5 hover:bg-bg-surface rounded px-2 py-1 -mx-2 transition-colors"
                        >
                          <TechBadge variant={u.role === "admin" ? "green" : u.role === "manager" ? "blue" : "gray"}>
                            {u.role?.toUpperCase() || "USUARIO"}
                          </TechBadge>
                          <span className="text-[10px] text-text-muted group-hover:text-text-muted">editar</span>
                        </button>
                      )}
                    </TableCell>
                    <TableCell>
                      {u.is_system_admin ? (
                        <TechBadge variant="red">ADMIN DO SISTEMA</TechBadge>
                      ) : (
                        <span className="text-[10px] text-text-muted">-</span>
                      )}
                    </TableCell>
                    <TableCell className="text-xs text-text-muted">
                      {u.created_at ? new Date(u.created_at).toLocaleDateString("pt-BR") : "-"}
                    </TableCell>
                    <TableCell>
                      <div className="relative">
                        <Button
                          variant="ghost"
                          size="icon-sm"
                          onClick={() => setMenuOpen(menuOpen === u.id ? null : u.id)}
                        >
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                        {menuOpen === u.id && (
                          <>
                            <div className="fixed inset-0 z-[60]" onClick={() => setMenuOpen(null)} />
                            <div className="absolute right-0 top-full mt-1 z-[70] w-52 bg-bg-surface border border-border-default rounded-[6px] shadow-xl py-1">
                              <button
                                className="w-full text-left px-3 py-2 text-sm text-text-secondary hover:bg-bg-surface flex items-center gap-2"
                                onClick={() => toggleAdmin(u.id, u.is_system_admin)}
                                disabled={updating === u.id}
                              >
                                {u.is_system_admin ? (
                                  <><ShieldOff className="h-3.5 w-3.5" /> Remover admin do sistema</>
                                ) : (
                                  <><Shield className="h-3.5 w-3.5" /> Tornar admin do sistema</>
                                )}
                              </button>
                            </div>
                          </>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
      </div>

    </div>
  );
}
