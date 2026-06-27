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
import { Dialog, DialogFooter } from "@/components/ui/dialog";
import {
  Users,
  Search,
  Loader2,
  Shield,
  ShieldOff,
  Building2,
  MoreHorizontal,
  Check,
  X,
  Key,
  Ban,
  UserX,
  UserCheck,
  Lock,
  AlertTriangle,
} from "lucide-react";
import { useDropdownMenu, MenuBackdrop, MenuPanel, MenuItem } from "@/hooks/use-dropdown-menu";
import { Input } from "@/components/ui/input";

interface UserRow {
  id: string;
  name: string;
  email: string;
  role: string;
  is_system_admin: boolean;
  is_staff: boolean;
  status: string;
  suspended_at: string | null;
  banned_at: string | null;
  created_at: string;
  tenant_id: string;
  tenants?: { name: string; plan: string; slug: string } | null;
}

type ModalType = "password" | "suspend" | "unsuspend" | "ban" | "unban" | null;

export default function AdminUsersPage() {
  const [users, setUsers] = useState<UserRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [updating, setUpdating] = useState<string | null>(null);
  const [editingRole, setEditingRole] = useState<string | null>(null);
  const [newRole, setNewRole] = useState("user");
  const [modalUser, setModalUser] = useState<UserRow | null>(null);
  const [modalType, setModalType] = useState<ModalType>(null);
  const [modalValue, setModalValue] = useState("");
  const menu = useDropdownMenu();

  useEffect(() => {
    load();
  }, []);

  async function load() {
    setLoading(true);
    try {
      const supabase = createClient();
      const { data, error } = await supabase
        .from("profiles")
        .select("id, name, email, role, is_system_admin, is_staff, status, suspended_at, banned_at, created_at, tenant_id, tenants(name, plan, slug)")
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
      menu.close();
    }
  };

  const toggleStaff = async (userId: string, currentValue: boolean) => {
    setUpdating(userId);
    try {
      const supabase = createClient();
      const { error } = await supabase
        .from("profiles")
        .update({ is_staff: !currentValue })
        .eq("id", userId);
      if (error) throw error;
      setSuccess(`Funcionario ${!currentValue ? "adicionado" : "removido"} com sucesso`);
      setTimeout(() => setSuccess(null), 3000);
      setUsers((prev) =>
        prev.map((u) => u.id === userId ? { ...u, is_staff: !currentValue } : u)
      );
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro ao atualizar");
    } finally {
      setUpdating(null);
      menu.close();
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

  const openModal = (u: UserRow, type: ModalType) => {
    setModalUser(u);
    setModalType(type);
    setModalValue("");
    menu.close();
  };

  const handleModalAction = async () => {
    if (!modalUser || !modalType) return;
    setUpdating(modalUser.id);
    setError(null);

    try {
      const res = await fetch("/api/admin/users/manage", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: modalType,
          userId: modalUser.id,
          newPassword: modalType === "password" ? modalValue : undefined,
          reason: modalType !== "password" ? modalValue : undefined,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error);

      setSuccess(data.message);
      setTimeout(() => setSuccess(null), 4000);
      setModalType(null);
      setModalUser(null);
      load();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro ao executar acao");
    } finally {
      setUpdating(null);
    }
  };

  const getTenant = (u: UserRow) => {
    if (!u.tenants || typeof u.tenants !== "object") return { name: "-", plan: "-", slug: "" };
    return u.tenants as { name: string; plan: string; slug: string };
  };

  const getStatusBadge = (u: UserRow) => {
    if (u.status === "banned") return <TechBadge variant="red">BANIDO</TechBadge>;
    if (u.status === "suspended") return <TechBadge variant="yellow">SUSPENSO</TechBadge>;
    return null;
  };

  const isUserDisabled = (u: UserRow) => u.status === "banned" || u.status === "suspended";

  const filtered = users.filter(
    (u) =>
      u.name?.toLowerCase().includes(search.toLowerCase()) ||
      u.email?.toLowerCase().includes(search.toLowerCase()) ||
      getTenant(u).name.toLowerCase().includes(search.toLowerCase())
  );

  const adminCount = users.filter((u) => u.is_system_admin).length;
  const staffCount = users.filter((u) => u.is_staff).length;
  const activeCount = users.filter((u) => u.status === "active" || !u.status).length;
  const bannedCount = users.filter((u) => u.status === "banned").length;
  const suspendedCount = users.filter((u) => u.status === "suspended").length;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-text-primary tracking-tight">Usuarios</h1>
        <p className="text-sm text-text-muted mt-1">
          {loading ? "Carregando..." : `${activeCount} ativos · ${suspendedCount} suspensos · ${bannedCount} banidos · ${adminCount} admins · ${staffCount} staff`}
        </p>
      </div>

      {/* Legenda - no topo */}
      <div className="rounded-[6px] border border-border-default bg-bg-card p-4">
        <h3 className="text-xs font-medium text-text-muted uppercase tracking-wider mb-3">Legenda</h3>
        <div className="grid grid-cols-2 md:grid-cols-5 gap-3 text-xs">
          <div className="flex items-center gap-2">
            <TechBadge variant="gray">USUARIO</TechBadge>
            <span className="text-text-muted">Acesso basico</span>
          </div>
          <div className="flex items-center gap-2">
            <TechBadge variant="blue">GERENTE</TechBadge>
            <span className="text-text-muted">Gerencia equipe</span>
          </div>
          <div className="flex items-center gap-2">
            <TechBadge variant="green">ADMINISTRADOR</TechBadge>
            <span className="text-text-muted">Admin do tenant</span>
          </div>
          <div className="flex items-center gap-2">
            <TechBadge variant="red">ADMIN SISTEMA</TechBadge>
            <span className="text-text-muted">Admin SaaS</span>
          </div>
          <div className="flex items-center gap-2">
            <TechBadge variant="yellow">SUSPENSO</TechBadge>
            <span className="text-text-muted">Temporario</span>
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
              <TableHead>Funcao</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Admin</TableHead>
              <TableHead>Cadastro</TableHead>
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
                  Nenhum usuario encontrado
                </TableCell>
              </TableRow>
            ) : (
              filtered.map((u) => {
                const tenant = getTenant(u);
                const disabled = isUserDisabled(u);
                return (
                  <TableRow key={u.id} className={disabled ? "opacity-60" : ""}>
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
                      {u.status === "banned" ? (
                        <TechBadge variant="red">BANIDO</TechBadge>
                      ) : u.status === "suspended" ? (
                        <TechBadge variant="yellow">SUSPENSO</TechBadge>
                      ) : (
                        <TechBadge variant="green">ATIVO</TechBadge>
                      )}
                    </TableCell>
                    <TableCell>
                      {u.is_system_admin ? (
                        <TechBadge variant="red">ADMIN</TechBadge>
                      ) : u.is_staff ? (
                        <TechBadge variant="blue">STAFF</TechBadge>
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
                          onClick={(e) => menu.toggle(u.id, e)}
                        >
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
      </div>

      {/* Dropdown menu */}
      {menu.openId && menu.menuPos && (() => {
        const u = users.find((x) => x.id === menu.openId);
        if (!u) return null;
        const disabled = isUserDisabled(u);
        return (
          <>
            <MenuBackdrop onClick={menu.close} />
            <MenuPanel menuPos={menu.menuPos} width="w-56">
              {/* Toggle system admin */}
              <MenuItem
                onClick={() => { menu.close(); toggleAdmin(u.id, u.is_system_admin); }}
                disabled={updating === u.id || disabled}
              >
                {u.is_system_admin ? (
                  <><ShieldOff className="h-3.5 w-3.5" /> Remover admin do sistema</>
                ) : (
                  <><Shield className="h-3.5 w-3.5" /> Tornar admin do sistema</>
                )}
              </MenuItem>

              {/* Toggle staff */}
              <MenuItem
                onClick={() => { menu.close(); toggleStaff(u.id, u.is_staff); }}
                disabled={updating === u.id || disabled}
              >
                {u.is_staff ? (
                  <><UserX className="h-3.5 w-3.5" /> Remover funcionario</>
                ) : (
                  <><UserCheck className="h-3.5 w-3.5" /> Tornar funcionario</>
                )}
              </MenuItem>

              {/* Change password */}
              <MenuItem
                onClick={() => openModal(u, "password")}
                disabled={disabled}
              >
                <Lock className="h-3.5 w-3.5" /> Alterar senha
              </MenuItem>

              {/* Divider */}
              <div className="border-t border-border-default my-1" />

              {/* Suspend / Unsuspend */}
              {u.status === "suspended" ? (
                <MenuItem
                  onClick={() => openModal(u, "unsuspend")}
                  className="text-brand hover:bg-brand-dim"
                >
                  <UserCheck className="h-3.5 w-3.5" /> Reativar usuario
                </MenuItem>
              ) : (
                <MenuItem
                  onClick={() => openModal(u, "suspend")}
                  className="text-brand-warning hover:bg-brand-warning-8"
                  disabled={disabled}
                >
                  <UserX className="h-3.5 w-3.5" /> Suspender
                </MenuItem>
              )}

              {/* Ban / Unban */}
              {u.status === "banned" ? (
                <MenuItem
                  onClick={() => openModal(u, "unban")}
                  className="text-brand hover:bg-brand-dim"
                >
                  <UserCheck className="h-3.5 w-3.5" /> Remover banimento
                </MenuItem>
              ) : (
                <MenuItem
                  onClick={() => openModal(u, "ban")}
                  className="text-brand-danger hover:bg-brand-danger-dim"
                  disabled={disabled}
                >
                  <Ban className="h-3.5 w-3.5" /> Banir
                </MenuItem>
              )}
            </MenuPanel>
          </>
        );
      })()}

      {/* Action Modal */}
      <Dialog
        open={!!modalUser && !!modalType}
        onClose={() => { setModalType(null); setModalUser(null); }}
        title={
          modalType === "password" ? "Alterar Senha" :
          modalType === "suspend" ? "Suspender Usuario" :
          modalType === "unsuspend" ? "Reativar Usuario" :
          modalType === "ban" ? "Banir Usuario" :
          modalType === "unban" ? "Remover Banimento" : ""
        }
        description={
          modalUser ? `${modalUser.name} (${modalUser.email})` : ""
        }
      >
        <div className="space-y-4">
          {modalType === "password" && (
            <div>
              <div className="rounded-[6px] border border-brand-warning-20 bg-brand-warning-8 p-3 text-xs text-brand-warning flex items-start gap-2 mb-4">
                <AlertTriangle className="h-4 w-4 shrink-0 mt-0.5" />
                <span>A senha sera alterada imediatamente. O usuario precisara usar a nova senha no proximo login.</span>
              </div>
              <Input
                label="Nova Senha"
                type="password"
                placeholder="Minimo 6 caracteres"
                value={modalValue}
                onChange={(e) => setModalValue(e.target.value)}
              />
            </div>
          )}

          {(modalType === "suspend" || modalType === "ban") && (
            <div>
              <p className="text-sm text-text-secondary mb-3">
                {modalType === "suspend"
                  ? "O usuario ficara impossibilitado de acessar o sistema ate que a suspensao seja removida."
                  : "O usuario sera permanentemente banido do sistema. Esta acao pode ser desfeita posteriormente."}
              </p>
              <Input
                label="Motivo (opcional)"
                placeholder="Descreva o motivo..."
                value={modalValue}
                onChange={(e) => setModalValue(e.target.value)}
              />
            </div>
          )}

          {(modalType === "unsuspend") && (
            <p className="text-sm text-text-secondary">
              O usuario voltara a ter acesso normal ao sistema.
            </p>
          )}

          {(modalType === "unban") && (
            <p className="text-sm text-text-secondary">
              O banimento sera removido e o usuario podera acessar o sistema novamente.
            </p>
          )}

          <DialogFooter>
            <Button variant="secondary" onClick={() => { setModalType(null); setModalUser(null); }} disabled={!!updating}>
              Cancelar
            </Button>
            <Button
              onClick={handleModalAction}
              disabled={updating === modalUser?.id || (modalType === "password" && modalValue.length < 6)}
              variant={
                modalType === "ban" ? "primary" :
                modalType === "suspend" ? "primary" :
                "primary"
              }
              className={
                modalType === "ban" ? "bg-brand-danger hover:bg-brand-danger text-white" :
                modalType === "suspend" ? "bg-brand-warning hover:bg-brand-warning text-white" :
                ""
              }
            >
              {updating === modalUser?.id ? "Aguarde..." :
                modalType === "password" ? "Alterar Senha" :
                modalType === "suspend" ? "Suspender" :
                modalType === "unsuspend" ? "Reativar" :
                modalType === "ban" ? "Banir" :
                modalType === "unban" ? "Remover Banimento" : "Confirmar"}
            </Button>
          </DialogFooter>
        </div>
      </Dialog>
    </div>
  );
}
