"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { TechBadge } from "@/components/tech-badge";
import { Users, Loader2, Check, X, Plus } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { useToast } from "@/components/ui/toast";

interface TeamMember {
  id: string;
  name: string;
  email: string;
  role: string;
  status: string;
  created_at: string;
}

interface TeamMemberListProps {
  members: TeamMember[];
  loading: boolean;
  currentUserId: string;
  isAdmin: boolean;
  onAddClick: () => void;
}

export function TeamMemberList({ members, loading, currentUserId, isAdmin, onAddClick }: TeamMemberListProps) {
  const [editingRole, setEditingRole] = useState<string | null>(null);
  const [newRole, setNewRole] = useState("");
  const { success: toastSuccess, error: toastError } = useToast();

  const handleRoleChange = async (userId: string, role: string) => {
    try {
      const supabase = createClient();
      const { error } = await supabase.from("profiles").update({ role }).eq("id", userId);
      if (error) throw error;
      toastSuccess(`Funcao alterada para "${role}"`);
      setEditingRole(null);
    } catch (err) {
      toastError(err instanceof Error ? err.message : "Erro ao alterar funcao");
    }
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-2">
          <Users className="h-4 w-4 text-text-muted" />
          <CardTitle>Equipe</CardTitle>
          <span className="text-xs text-text-muted ml-1">({members.length} membros)</span>
        </div>
        <CardDescription>
          {isAdmin
            ? "Gerencie os usuarios da sua empresa."
            : "Membros da sua empresa"}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="rounded-[6px] border border-border-default overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border-default bg-bg-card">
                <th className="text-left px-3 py-2 text-[10px] font-medium text-text-muted uppercase tracking-wider">Nome</th>
                <th className="text-left px-3 py-2 text-[10px] font-medium text-text-muted uppercase tracking-wider">Email</th>
                <th className="text-left px-3 py-2 text-[10px] font-medium text-text-muted uppercase tracking-wider">Funcao</th>
                <th className="text-left px-3 py-2 text-[10px] font-medium text-text-muted uppercase tracking-wider">Status</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={4} className="text-center py-8 text-text-muted">
                    <Loader2 className="h-5 w-5 animate-spin mx-auto" />
                  </td>
                </tr>
              ) : members.length === 0 ? (
                <tr>
                  <td colSpan={4} className="text-center py-8 text-text-muted text-xs">Nenhum membro encontrado</td>
                </tr>
              ) : (
                members.map((member) => (
                  <tr key={member.id} className="border-b border-border-default last:border-0 hover:bg-bg-surface-hover/50">
                    <td className="px-3 py-2.5">
                      <span className="text-text-primary text-sm">{member.name}</span>
                      {member.id === currentUserId && (
                        <span className="ml-1.5 text-[10px] text-brand font-medium">(Voce)</span>
                      )}
                    </td>
                    <td className="px-3 py-2.5 text-text-muted text-xs">{member.email}</td>
                    <td className="px-3 py-2.5">
                      {isAdmin && editingRole === member.id ? (
                        <div className="flex items-center gap-1">
                          <select
                            value={newRole}
                            onChange={(e) => setNewRole(e.target.value)}
                            className="h-7 px-1.5 rounded-[4px] border border-border-default bg-bg-surface text-xs text-text-primary outline-none"
                          >
                            <option value="admin">Admin</option>
                            <option value="manager">Gerente</option>
                            <option value="operator">Operador</option>
                          </select>
                          <button onClick={() => handleRoleChange(member.id, newRole)} className="p-0.5 rounded text-brand hover:bg-brand-8">
                            <Check className="h-3 w-3" />
                          </button>
                          <button onClick={() => setEditingRole(null)} className="p-0.5 rounded text-text-muted hover:bg-bg-surface">
                            <X className="h-3 w-3" />
                          </button>
                        </div>
                      ) : (
                        <button
                          onClick={() => {
                            if (!isAdmin || member.id === currentUserId) return;
                            setEditingRole(member.id);
                            setNewRole(member.role || "operator");
                          }}
                          className={`group flex items-center gap-1 ${isAdmin && member.id !== currentUserId ? "hover:bg-bg-surface rounded px-1.5 py-0.5 -mx-1.5" : ""}`}
                        >
                          <TechBadge variant={member.role === "admin" ? "green" : member.role === "manager" ? "blue" : "gray"}>
                            {member.role?.toUpperCase() || "OPERADOR"}
                          </TechBadge>
                          {isAdmin && member.id !== currentUserId && (
                            <span className="text-[9px] text-text-muted opacity-0 group-hover:opacity-100 transition-opacity">editar</span>
                          )}
                        </button>
                      )}
                    </td>
                    <td className="px-3 py-2.5">
                      {member.status === "suspended" ? (
                        <TechBadge variant="yellow">SUSPENSO</TechBadge>
                      ) : member.status === "banned" ? (
                        <TechBadge variant="red">BANIDO</TechBadge>
                      ) : (
                        <TechBadge variant="green">ATIVO</TechBadge>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {isAdmin && (
          <Button onClick={onAddClick}>
            <Plus className="h-4 w-4" />
            Adicionar Membro
          </Button>
        )}
      </CardContent>
    </Card>
  );
}
