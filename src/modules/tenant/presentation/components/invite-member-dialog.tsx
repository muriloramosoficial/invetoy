"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogFooter } from "@/components/ui/dialog";
import { createClient } from "@/lib/supabase/client";
import { useToast } from "@/components/ui/toast";

interface InviteMemberDialogProps {
  open: boolean;
  tenantId: string;
  onClose: () => void;
  onCreated: () => void;
}

export function InviteMemberDialog({ open, tenantId, onClose, onCreated }: InviteMemberDialogProps) {
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("operator");
  const [saving, setSaving] = useState(false);
  const { success: toastSuccess, error: toastError } = useToast();

  const handleCreate = async () => {
    if (!email || !password || !name) {
      toastError("Preencha todos os campos");
      return;
    }
    if (password.length < 8) {
      toastError("A senha deve ter no minimo 8 caracteres");
      return;
    }
    setSaving(true);
    try {
      const res = await fetch("/api/admin/users/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password, name, role, tenantId }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      toastSuccess(data.message);
      setEmail("");
      setName("");
      setPassword("");
      setRole("operator");
      onCreated();
      onClose();
    } catch (err) {
      toastError(err instanceof Error ? err.message : "Erro ao criar usuario");
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={open} onClose={onClose} title="Adicionar Membro" description="Crie um novo usuario para sua empresa">
      <div className="space-y-4">
        <Input label="Nome" placeholder="Nome completo" value={name} onChange={(e) => setName(e.target.value)} />
        <Input label="Email" type="email" placeholder="email@exemplo.com" value={email} onChange={(e) => setEmail(e.target.value)} />
        <Input label="Senha" type="password" placeholder="Minimo 8 caracteres" value={password} onChange={(e) => setPassword(e.target.value)} />
        <div>
          <label className="block text-xs font-medium text-text-secondary mb-1.5 tracking-wide uppercase">Funcao</label>
          <select
            value={role}
            onChange={(e) => setRole(e.target.value)}
            className="flex h-10 w-full rounded-[4px] border border-border-default bg-bg-surface px-3 py-2 text-sm text-text-primary appearance-none focus:border-brand-40 focus:ring-1 focus:ring-brand-20 transition-colors outline-none"
          >
            <option value="operator">Operador</option>
            <option value="manager">Gerente</option>
            <option value="admin">Administrador</option>
          </select>
        </div>
        <DialogFooter>
          <Button variant="secondary" onClick={onClose} disabled={saving}>Cancelar</Button>
          <Button onClick={handleCreate} disabled={saving}>{saving ? "Criando..." : "Criar Usuario"}</Button>
        </DialogFooter>
      </div>
    </Dialog>
  );
}
