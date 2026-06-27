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
  Eye,
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
  const [search, setSearch] = useState("");
  const [updating, setUpdating] = useState<string | null>(null);
  const [menuOpen, setMenuOpen] = useState<string | null>(null);

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

  const getTenant = (u: UserRow) => {
    if (!u.tenants || typeof u.tenants !== "object") return { name: "-", plan: "-", slug: "" };
    const t = u.tenants as { name: string; plan: string; slug: string };
    return t;
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
        <div className="rounded-[6px] border border-red-500/20 bg-red-500/5 p-3 text-sm text-red-400">
          {error}
        </div>
      )}

      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500" />
        <input
          type="text"
          placeholder="Buscar por nome, email, empresa..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full h-10 pl-10 pr-3 rounded-[6px] border border-border-default bg-bg-surface text-sm text-white placeholder:text-gray-500 focus:border-emerald-500/40 focus:ring-1 focus:ring-emerald-500/20 transition-colors outline-none"
        />
      </div>

      <div className="rounded-[6px] border border-border-default overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Usuario</TableHead>
              <TableHead>Empresa</TableHead>
              <TableHead>Plano</TableHead>
              <TableHead>Role</TableHead>
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
                      <TechBadge variant={u.role === "admin" ? "green" : "gray"}>
                        {u.role?.toUpperCase() || "USER"}
                      </TechBadge>
                    </TableCell>
                    <TableCell>
                      {u.is_system_admin && <TechBadge variant="red">SYS ADMIN</TechBadge>}
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
                                onClick={() => { window.location.href = `/${tenant.slug}/dashboard`; setMenuOpen(null); }}
                              >
                                <LogIn className="h-3.5 w-3.5" />
                                Acessar como este tenant
                              </button>
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
    </div>
  );
}
