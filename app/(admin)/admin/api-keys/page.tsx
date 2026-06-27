"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import { TechBadge } from "@/components/tech-badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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
  Key,
  Plus,
  Trash2,
  Eye,
  EyeOff,
  Copy,
  Loader2,
  Check,
  Shield,
  AlertTriangle,
} from "lucide-react";

interface ApiKeyRow {
  id: string;
  name: string;
  key_prefix: string;
  key_hash: string;
  permissions: string[];
  is_active: boolean;
  last_used_at: string | null;
  expires_at: string | null;
  created_at: string;
}

export default function AdminApiKeysPage() {
  const [keys, setKeys] = useState<ApiKeyRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [createModal, setCreateModal] = useState(false);
  const [newKeyName, setNewKeyName] = useState("");
  const [newKeyPerms, setNewKeyPerms] = useState<string[]>(["read"]);
  const [creating, setCreating] = useState(false);
  const [createdKey, setCreatedKey] = useState<string | null>(null);
  const [showKey, setShowKey] = useState<string | null>(null);
  const [deleting, setDeleting] = useState<string | null>(null);

  useEffect(() => {
    load();
  }, []);

  async function load() {
    setLoading(true);
    try {
      const supabase = createClient();
      const { data, error } = await supabase
        .from("api_keys")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) {
        if (error.message.includes("does not exist") || error.message.includes("relation")) {
          setKeys([]);
          return;
        }
        throw error;
      }
      setKeys((data || []) as ApiKeyRow[]);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro ao carregar API keys");
    } finally {
      setLoading(false);
    }
  }

  const handleCreate = async () => {
    if (!newKeyName.trim()) return;
    setCreating(true);
    try {
      const supabase = createClient();
      const key = `inv_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 10)}`;
      const prefix = key.slice(0, 7);

      const { error } = await supabase.from("api_keys").insert({
        name: newKeyName.trim(),
        key_prefix: prefix,
        key_hash: key,
        permissions: newKeyPerms,
        is_active: true,
      });

      if (error) throw error;

      setCreatedKey(key);
      setSuccess("API key criada com sucesso");
      setTimeout(() => setSuccess(null), 5000);
      setNewKeyName("");
      setNewKeyPerms(["read"]);
      load();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro ao criar API key");
    } finally {
      setCreating(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Tem certeza? Esta acao e irreversivel.")) return;
    setDeleting(id);
    try {
      const supabase = createClient();
      const { error } = await supabase.from("api_keys").delete().eq("id", id);
      if (error) throw error;
      setSuccess("API key removida");
      setTimeout(() => setSuccess(null), 3000);
      load();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro ao deletar");
    } finally {
      setDeleting(null);
    }
  };

  const toggleActive = async (id: string, current: boolean) => {
    try {
      const supabase = createClient();
      const { error } = await supabase
        .from("api_keys")
        .update({ is_active: !current })
        .eq("id", id);
      if (error) throw error;
      load();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro ao atualizar");
    }
  };

  const copyKey = (key: string) => {
    navigator.clipboard.writeText(key);
    setSuccess("Copiado!");
    setTimeout(() => setSuccess(null), 2000);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-text-primary tracking-tight">API Keys</h1>
          <p className="text-sm text-text-muted mt-1">
            {loading ? "Carregando..." : `${keys.length} keys ativas`}
          </p>
        </div>
        <Button onClick={() => { setCreateModal(true); setCreatedKey(null); }}>
          <Plus className="h-4 w-4" />
          Nova API Key
        </Button>
      </div>

      {error && (
        <div className="rounded-[6px] border border-brand-danger-10 bg-brand-danger-dim p-3 text-sm text-brand-danger flex items-center justify-between">
          <span>{error}</span>
          <button onClick={() => setError(null)} className="text-brand-danger hover:text-brand-danger font-bold">×</button>
        </div>
      )}

      {success && (
        <div className="rounded-[6px] border border-brand-20 bg-brand-dim p-3 text-sm text-brand flex items-center gap-2">
          <Check className="h-4 w-4" />
          {success}
        </div>
      )}

      {/* Info */}
      <div className="rounded-[6px] border border-border-default bg-bg-card p-4">
        <div className="flex items-start gap-3">
          <Shield className="h-4 w-4 text-brand mt-0.5 shrink-0" />
          <div className="text-xs text-text-muted space-y-1">
            <p><strong className="text-text-secondary">Como usar:</strong> Inclua a API key no header <code className="bg-bg-surface px-1 rounded text-brand">Authorization: Bearer {'<sua_key>'}</code> nas requisicoes.</p>
            <p><strong className="text-text-secondary">Permissoes:</strong> <code className="bg-bg-surface px-1 rounded">read</code> (leitura), <code className="bg-bg-surface px-1 rounded">write</code> (escrita), <code className="bg-bg-surface px-1 rounded">admin</code> (total).</p>
            <p><strong className="text-brand-warning flex items-center gap-1"><AlertTriangle className="h-3 w-3" /> Atencao:</strong> A key completa so e exibida uma vez. Salve em local seguro.</p>
          </div>
        </div>
      </div>

      <div className="rounded-[6px] border border-border-default overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Nome</TableHead>
              <TableHead>Prefixo</TableHead>
              <TableHead>Permissoes</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Ultimo Uso</TableHead>
              <TableHead>Criada em</TableHead>
              <TableHead className="text-right">Acoes</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-12">
                  <Loader2 className="h-6 w-6 text-text-muted animate-spin mx-auto" />
                </TableCell>
              </TableRow>
            ) : keys.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-12">
                  <div className="flex flex-col items-center gap-2 text-text-muted">
                    <Key className="h-8 w-8" />
                    <p className="text-sm">Nenhuma API key encontrada</p>
                    <p className="text-[10px]">Crie uma chave para acessar a API</p>
                  </div>
                </TableCell>
              </TableRow>
            ) : (
              keys.map((k) => (
                <TableRow key={k.id}>
                  <TableCell className="font-medium text-text-primary">{k.name}</TableCell>
                  <TableCell>
                    <code className="text-xs text-brand bg-bg-surface px-1.5 py-0.5 rounded">{k.key_prefix}...</code>
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-1">
                      {(k.permissions || []).map((p) => (
                        <TechBadge key={p} variant={p === "admin" ? "red" : p === "write" ? "blue" : "gray"}>
                          {p}
                        </TechBadge>
                      ))}
                    </div>
                  </TableCell>
                  <TableCell>
                    <button onClick={() => toggleActive(k.id, k.is_active)}>
                      <TechBadge variant={k.is_active ? "green" : "gray"}>
                        {k.is_active ? "ATIVA" : "INATIVA"}
                      </TechBadge>
                    </button>
                  </TableCell>
                  <TableCell className="text-xs text-text-muted">
                    {k.last_used_at ? new Date(k.last_used_at).toLocaleDateString("pt-BR") : "Nunca"}
                  </TableCell>
                  <TableCell className="text-xs text-text-muted">
                    {new Date(k.created_at).toLocaleDateString("pt-BR")}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-1">
                      <Button
                        variant="ghost"
                        size="icon-sm"
                        onClick={() => handleDelete(k.id)}
                        disabled={deleting === k.id}
                        className="text-brand-danger hover:text-brand-danger"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* Create modal */}
      <Dialog
        open={createModal}
        onClose={() => setCreateModal(false)}
        title="Nova API Key"
        description="Crie uma nova chave de acesso a API"
      >
        {createdKey ? (
          <div className="space-y-4">
            <div className="rounded-[6px] border border-brand-20 bg-brand-dim p-4">
              <div className="flex items-center gap-2 mb-2">
                <Check className="h-4 w-4 text-brand" />
                <span className="text-sm font-medium text-brand">Key criada com sucesso!</span>
              </div>
              <p className="text-xs text-text-muted mb-3">Copie e salve em local seguro. Nao sera exibida novamente.</p>
              <div className="flex items-center gap-2">
                <code className="flex-1 text-xs text-brand bg-bg-surface p-2 rounded break-all font-mono">{createdKey}</code>
                <Button variant="secondary" size="icon-sm" onClick={() => copyKey(createdKey)}>
                  <Copy className="h-3.5 w-3.5" />
                </Button>
              </div>
            </div>
            <DialogFooter>
              <Button onClick={() => { setCreateModal(false); setCreatedKey(null); }}>
                Fechar
              </Button>
            </DialogFooter>
          </div>
        ) : (
          <div className="space-y-4">
            <Input
              label="Nome da Key"
              placeholder="ex: Production API, Mobile App"
              value={newKeyName}
              onChange={(e) => setNewKeyName(e.target.value)}
            />
            <div>
              <label className="block text-xs font-medium text-text-secondary mb-1.5 tracking-wide uppercase">
                Permissoes
              </label>
              <div className="flex gap-2">
                {["read", "write", "admin"].map((perm) => (
                  <button
                    key={perm}
                    onClick={() => {
                      setNewKeyPerms((prev) =>
                        prev.includes(perm) ? prev.filter((p) => p !== perm) : [...prev, perm]
                      );
                    }}
                    className={`px-3 py-1.5 text-xs rounded-[4px] border transition-colors ${
                      newKeyPerms.includes(perm)
                        ? "bg-brand-dim border-brand-20 text-brand"
                        : "border-border-default text-text-muted hover:text-text-primary"
                    }`}
                  >
                    {perm}
                  </button>
                ))}
              </div>
            </div>
            <DialogFooter>
              <Button variant="secondary" onClick={() => setCreateModal(false)} disabled={creating}>
                Cancelar
              </Button>
              <Button onClick={handleCreate} disabled={creating || !newKeyName.trim()}>
                {creating ? "Criando..." : "Criar Key"}
              </Button>
            </DialogFooter>
          </div>
        )}
      </Dialog>
    </div>
  );
}
