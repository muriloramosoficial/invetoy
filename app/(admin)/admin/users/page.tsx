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
      setSuccess(`Sys admin ${!currentValue ? "adicionado" : "removido"} com sucesso`);
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
      setSuccess(`Role alterada para "${role}" com sucesso`);
      setTimeout(() => setSuccess(null), 3000);
      setUsers((prev) =>
        prev.map((u) => u.id === userId ? { ...u, role } : u)
      );
      setEditingRole(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro ao alterar role");
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
        <h1 className="text-2xl font-semibold text-white tracking-tight">Usuarios</h1>
        <p className="text-sm text-gray-500 mt-1">
          {loading ? "Carregando..." : `${users.length} usuarios · ${adminCount} system admins`}
        </p>
      </div>

      {error && (
        <div className="rounded-[6px] border border-red-500/20 bg-red-500/5 p-3 text-sm text-red-400 flex items-center justify-between">
          <span>{error}</span>
          <button onClick={() => setError(null)} className="text-red-400 hover:text-red-300">
            <X className="h-4 w-4" />
          </button>
        </div>
      )}

      {success && (
        <div className="rounded-[6px] border border-emerald-500/20 bg-emerald-500/5 p-3 text-sm text-emerald-400 flex items-center gap-2">
          <Check className="h-4 w-4" />
          {success}
        </div>
      )}

      <div className="flex items-center gap-4">
        <div className="relative max-w-sm flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500" />
          <input
            type="text"
            placeholder="Buscar por nome, email, empresa..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full h-10 pl-10 pr-3 rounded-[6px] border border-border-default bg-bg-surface text-sm text-white placeholder:text-gray-500 focus:border-emerald-500/40 focus:ring-1 focus:ring-emerald-500/20 transition-colors outline-none"
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
              <TableHead>Role (clique para editar)</TableHead>
              <TableHead>Sys Admin</TableHead>
              <TableHead>Cadastro</TableHead>
              <TableHead className="w-10"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-12">
                  <Loader2 className="h-6 w-6 text-gray-400 animate-spin mx-auto" />
                </TableCell>
              </TableRow>
            ) : filtered.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-12 text-gray-500">
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
                        <p className="font-medium text-white">{u.name || "-"}</p>
                        <p className="text-[10px] text-gray-600">{u.email}</p>
                      </div>
                    </TableCell>
                    <TableCell>
                      <span className="text-xs text-gray-400 flex items-center gap-1">
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
                            className="h-8 px-2 rounded-[4px] border border-border-default bg-bg-surface text-xs text-white outline-none focus:border-emerald-500/40"
                          >
                            <option value="user">User</option>
                            <option value="admin">Admin</option>
                            <option value="manager">Manager</option>
                            <option value="operator">Operator</option>
                          </select>
                          <button
                            onClick={() => changeRole(u.id, newRole)}
                            disabled={updating === u.id}
                            className="p-1 rounded text-emerald-400 hover:bg-emerald-500/10"
                          >
                            <Check className="h-3.5 w-3.5" />
                          </button>
                          <button
                            onClick={() => setEditingRole(null)}
                            className="p-1 rounded text-gray-500 hover:bg-white/5"
                          >
                            <X className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      ) : (
                        <button
                          onClick={() => { setEditingRole(u.id); setNewRole(u.role || "user"); }}
                          className="group flex items-center gap-1.5 hover:bg-white/5 rounded px-2 py-1 -mx-2 transition-colors"
                        >
                          <TechBadge variant={u.role === "admin" ? "green" : u.role === "manager" ? "blue" : "gray"}>
                            {u.role?.toUpperCase() || "USER"}
                          </TechBadge>
                          <span className="text-[10px] text-gray-600 group-hover:text-gray-400">editar</span>
                        </button>
                      )}
                    </TableCell>
                    <TableCell>
                      {u.is_system_admin ? (
                        <TechBadge variant="red">SYS ADMIN</TechBadge>
                      ) : (
                        <span className="text-[10px] text-gray-600">-</span>
                      )}
                    </TableCell>
                    <TableCell className="text-xs text-gray-500">
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
                            <div className="fixed inset-0 z-40" onClick={() => setMenuOpen(null)} />
                            <div className="absolute right-0 top-full mt-1 z-50 w-52 bg-gray-900 border border-border-default rounded-[6px] shadow-xl py-1">
                              <button
                                className="w-full text-left px-3 py-2 text-sm text-gray-300 hover:bg-white/5 flex items-center gap-2"
                                onClick={() => toggleAdmin(u.id, u.is_system_admin)}
                                disabled={updating === u.id}
                              >
                                {u.is_system_admin ? (
                                  <><ShieldOff className="h-3.5 w-3.5" /> Remover sys admin</>
                                ) : (
                                  <><Shield className="h-3.5 w-3.5" /> Tornar sys admin</>
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

      <div className="rounded-[6px] border border-border-default bg-bg-card p-4">
        <h3 className="text-xs font-medium text-gray-400 uppercase tracking-wider mb-3">Legenda</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-xs">
          <div className="flex items-center gap-2">
            <TechBadge variant="gray">USER</TechBadge>
            <span className="text-gray-500">Acesso basico ao sistema</span>
          </div>
          <div className="flex items-center gap-2">
            <TechBadge variant="blue">MANAGER</TechBadge>
            <span className="text-gray-500">Pode gerenciar equipe</span>
          </div>
          <div className="flex items-center gap-2">
            <TechBadge variant="green">ADMIN</TechBadge>
            <span className="text-gray-500">Admin do tenant</span>
          </div>
          <div className="flex items-center gap-2">
            <TechBadge variant="red">SYS ADMIN</TechBadge>
            <span className="text-gray-500">Admin do SaaS (area /admin)</span>
          </div>
        </div>
      </div>
    </div>
  );
}
