"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { TechBadge } from "@/components/tech-badge";
import { useToast } from "@/components/ui/toast";
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
  BookOpen,
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
  const { success: toastSuccess, error: toastError } = useToast();
  const [createModal, setCreateModal] = useState(false);
  const [newKeyName, setNewKeyName] = useState("");
  const [newKeyPerms, setNewKeyPerms] = useState<string[]>(["read"]);
  const [creating, setCreating] = useState(false);
  const [createdKey, setCreatedKey] = useState<string | null>(null);
  const [showKey, setShowKey] = useState<string | null>(null);
  const [deleting, setDeleting] = useState<string | null>(null);
  const [tableMissing, setTableMissing] = useState(false);

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
        if (error.message.includes("does not exist") || error.message.includes("relation") || error.message.includes("42P01")) {
          setTableMissing(true);
          setKeys([]);
          return;
        }
        throw error;
      }
      setKeys((data || []) as ApiKeyRow[]);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro ao carregar chaves de API");
    } finally {
      setLoading(false);
    }
  }

  const handleCreate = async () => {
    if (!newKeyName.trim()) return;
    setCreating(true);
    try {
      const res = await fetch("/api/admin/api-keys", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: newKeyName.trim(),
          permissions: newKeyPerms,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Erro ao criar chave");

      setCreatedKey(data.key);
      toastSuccess("Chave de API criada com sucesso");
      setNewKeyName("");
      setNewKeyPerms(["read"]);
      load();
    } catch (err) {
      toastError(err instanceof Error ? err.message : "Erro ao criar chave de API");
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
      toastSuccess("Chave de API removida");
      load();
    } catch (err) {
      toastError(err instanceof Error ? err.message : "Erro ao deletar");
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
      toastError(err instanceof Error ? err.message : "Erro ao atualizar");
    }
  };

  const copyKey = (key: string) => {
    navigator.clipboard.writeText(key);
    toastSuccess("Copiado!");
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold text-text-primary tracking-tight">API Keys</h1>
          <p className="text-sm text-text-muted mt-1">
            {loading ? "Carregando..." : `${keys.length} chaves ativas`}
          </p>
        </div>
        <Button onClick={() => { setCreateModal(true); setCreatedKey(null); }} className="w-full sm:w-auto shrink-0">
          <Plus className="h-4 w-4" />
          Nova Chave de API
        </Button>
      </div>

      {tableMissing && (
        <div className="rounded-[6px] border border-brand-warning bg-brand-warning-dim p-5 text-sm space-y-4">
          <div className="flex items-center gap-2 text-brand-warning font-medium">
            <AlertTriangle className="h-4 w-4" />
            <span>Tabela de API Keys nao encontrada</span>
          </div>
          <p className="text-text-muted">Execute as migrations do Supabase para criar a tabela.</p>
        </div>
      )}

      {/* Documentation */}
      <div className="rounded-[6px] border border-border-default bg-bg-card overflow-hidden">
        <div className="px-3 sm:p-4 border-b border-border-default bg-bg-surface">
          <div className="flex items-center gap-2">
            <BookOpen className="h-4 w-4 text-brand shrink-0" />
            <h2 className="text-sm font-medium text-text-primary">Documentacao — API REST</h2>
          </div>
        </div>
        <div className="p-3 sm:p-4 space-y-4 text-xs text-text-muted">
          <div>
            <h3 className="text-sm font-medium text-text-primary mb-2">O que sao Chaves de API?</h3>
            <p className="leading-relaxed">
              Chaves de API sao tokens de acesso que permitem que sistemas externos (ERP, sites, aplicativos mobile) 
              se comuniquem com o INVENTOY de forma programatica. Cada chave e unica e vinculada ao tenant 
              (empresa) que a criou, garantindo isolamento total entre os dados de cada cliente.
            </p>
          </div>

          <div>
            <h3 className="text-sm font-medium text-text-primary mb-2">Como Funciona</h3>
            <ol className="list-decimal list-inside space-y-1 leading-relaxed">
              <li>Crie uma chave com um nome descritivo (ex: &quot;Integracao ERP Protheus&quot;)</li>
              <li>Defina as permissoes: <code className="bg-bg-surface px-1 rounded text-brand">read</code> (leitura), <code className="bg-bg-surface px-1 rounded">write</code> (escrita) ou <code className="bg-bg-surface px-1 rounded">admin</code> (total)</li>
              <li>Copie a chave gerada — ela so aparece uma vez</li>
              <li>Inclua a chave no header <code className="bg-bg-surface px-1 rounded text-brand">Authorization: Bearer {'<sua_key>'}</code> em todas as requisicoes</li>
            </ol>
          </div>

          <div className="p-3 rounded-[4px] bg-bg-elevated border border-border-default font-mono text-[10px] sm:text-xs overflow-x-auto">
            <div className="text-text-muted mb-1 whitespace-nowrap">Exemplo de requisicao:</div>
            <div className="text-text-secondary whitespace-nowrap">
              <span className="text-brand">GET</span> https://www.invetoy.com.br/api/v1/products?limit=5<br />
              <span className="text-text-muted">Authorization:</span> <span className="text-brand">Bearer</span> <span className="text-text-primary">inv_abc123_def456</span>
            </div>
          </div>

          <div>
            <h3 className="text-sm font-medium text-text-primary mb-2">Permissoes</h3>
            <div className="space-y-2">
              <div className="flex items-center gap-3 p-2 rounded-[4px] bg-bg-surface">
                <TechBadge variant="gray">read</TechBadge>
                <span className="text-text-secondary">Consultar produtos, estoque e movimentacoes</span>
              </div>
              <div className="flex items-center gap-3 p-2 rounded-[4px] bg-bg-surface">
                <TechBadge variant="blue">write</TechBadge>
                <span className="text-text-secondary">Criar, atualizar e arquivar registros</span>
              </div>
              <div className="flex items-center gap-3 p-2 rounded-[4px] bg-bg-surface">
                <TechBadge variant="red">admin</TechBadge>
                <span className="text-text-secondary">Acesso total, incluindo gerenciamento de chaves</span>
              </div>
            </div>
          </div>

          <div className="p-3 rounded-[4px] border border-brand-warning-20 bg-brand-warning-8">
            <div className="flex items-start gap-2">
              <AlertTriangle className="h-4 w-4 text-brand-warning shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-medium text-brand-warning mb-1">Boas Praticas de Seguranca</p>
                <ul className="list-disc list-inside space-y-0.5 text-brand-warning">
                  <li>Nunca compartilhe chaves de API em codigo-fonte, repositorios Git ou logs</li>
                  <li>Use chaves diferentes para cada ambiente (desenvolvimento, producao)</li>
                  <li>Revogue chaves que nao estao mais em uso ou que foram comprometidas</li>
                  <li>Prefira permissoes minimas — crie chaves com acesso apenas ao necessario</li>
                  <li>Monitore o uso das chaves pelo campo &quot;Ultimo Uso&quot; na tabela acima</li>
                </ul>
              </div>
            </div>
          </div>

          <div>
            <h3 className="text-sm font-medium text-text-primary mb-2">Endpoint Base</h3>
            <code className="text-text-secondary bg-bg-elevated px-2 py-1 rounded font-mono">https://www.invetoy.com.br/api/v1</code>
            <p className="mt-1">Documentacao completa disponivel em <Link href="/docs/api" className="text-brand hover:underline">/docs/api</Link></p>
          </div>
        </div>
      </div>

      <div className="rounded-[6px] border border-border-default overflow-x-auto">
        <Table className="min-w-[600px]">
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
                    <p className="text-sm">Nenhuma chave de API encontrada</p>
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
        title="Nova Chave de API"
        description="Crie uma nova chave de acesso a API"
      >
        {createdKey ? (
          <div className="space-y-4">
            <div className="rounded-[6px] border border-brand-20 bg-brand-dim p-4">
              <div className="flex items-center gap-2 mb-2">
                <Check className="h-4 w-4 text-brand" />
                <span className="text-sm font-medium text-brand">Chave criada com sucesso!</span>
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
              label="Nome da Chave"
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
                {creating ? "Criando..." : "Criar Chave"}
              </Button>
            </DialogFooter>
          </div>
        )}
      </Dialog>
    </div>
  );
}
