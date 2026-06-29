"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { TechBadge } from "@/components/tech-badge";
import { createClient } from "@/lib/supabase/client";
import { Input } from "@/components/ui/input";
import {
  Code2,
  Key,
  Copy,
  Check,
  Globe,
  Lock,
  Shield,
  Loader2,
  ChevronRight,
  Terminal,
  BookOpen,
  ExternalLink,
  RefreshCw,
  Plus,
  Trash2,
  AlertTriangle,
} from "lucide-react";


interface TenantInfo {
  id: string;
  name: string;
  plan: string;
  subscription_status: string | null;
}

interface ApiKeyRecord {
  id: string;
  name: string;
  key_prefix: string;
  created_at: string;
  last_used_at: string | null;
  revoked_at: string | null;
  expires_at: string | null;
}

const ENDPOINTS = [
  { method: "GET", path: "/api/v1/products", params: "?page=1&limit=20&category_id=uuid&search=termo", desc: "Listar produtos com paginação e filtros", auth: "API Key" },
  { method: "POST", path: "/api/v1/products", params: "", desc: "Criar um novo produto", auth: "API Key" },
  { method: "GET", path: "/api/v1/products/{id}", params: "", desc: "Buscar produto por ID", auth: "API Key" },
  { method: "PATCH", path: "/api/v1/products/{id}", params: "", desc: "Atualizar parcialmente um produto", auth: "API Key" },
  { method: "DELETE", path: "/api/v1/products/{id}", params: "", desc: "Excluir um produto", auth: "API Key" },
  { method: "GET", path: "/api/v1/inventory", params: "?location_id=uuid&status=low", desc: "Consultar inventario com produto e localizacao", auth: "API Key" },
  { method: "GET", path: "/api/v1/stock", params: "?product_id=uuid&location_id=uuid", desc: "Consultar saldo em tempo real por produto/localizacao", auth: "API Key" },
  { method: "GET", path: "/api/v1/movements", params: "?product_id=uuid&type=in&page=1&limit=50", desc: "Historico de movimentacoes", auth: "API Key" },
  { method: "POST", path: "/api/v1/movements", params: "", desc: "Registrar entrada ou saida", auth: "API Key" },
];

const LANGUAGES = [
  {
    name: "cURL",
    code: (key: string) => `curl -H "Authorization: Bearer ${key}" \\\n  -H "Content-Type: application/json" \\\n  "https://www.invetoy.com.br/api/v1/products?limit=5"`,
  },
  {
    name: "JavaScript (fetch)",
    code: (key: string) => `const response = await fetch("https://www.invetoy.com.br/api/v1/products?limit=5", {\n  headers: {\n    Authorization: "Bearer ${key}",\n    "Content-Type": "application/json",\n  },\n});\nconst data = await response.json();\nconsole.log(data);`,
  },
  {
    name: "Python",
    code: (key: string) => `import requests\n\nheaders = {\n    "Authorization": "Bearer ${key}",\n    "Content-Type": "application/json",\n}\nresponse = requests.get(\n    "https://www.invetoy.com.br/api/v1/products?limit=5",\n    headers=headers,\n)\ndata = response.json()\nprint(data)`,
  },
];

export default function ApiDocsPage() {
  const router = useRouter();
  const [tenant, setTenant] = useState<TenantInfo | null>(null);
  const [loading, setLoading] = useState(true);

  const [apiKeys, setApiKeys] = useState<ApiKeyRecord[]>([]);
  const [newKeyName, setNewKeyName] = useState("");
  const [creating, setCreating] = useState(false);
  const [justCreatedKey, setJustCreatedKey] = useState("");
  const [showNewKey, setShowNewKey] = useState(false);
  const [copied, setCopied] = useState(false);
  const [selectedLang, setSelectedLang] = useState(0);
  const [expandedEndpoint, setExpandedEndpoint] = useState<number | null>(0);

  useEffect(() => {
    async function load() {
      try {
        const supabase = createClient();
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) { router.push("/login"); return; }

        const { data: profile } = await supabase
          .from("profiles")
          .select("tenant_id")
          .eq("id", user.id)
          .single();

        if (profile) {
          const { data: tenantData } = await supabase
            .from("tenants")
            .select("id, name, plan, subscription_status")
            .eq("id", profile.tenant_id)
            .single();
          if (tenantData) {
            setTenant(tenantData);
          }
        }

        const res = await fetch("/api/keys");
        if (res.ok) {
          const { data } = await res.json();
          setApiKeys(data || []);
        }
      } catch {

      } finally {
        setLoading(false);
      }
    }
    load();
  }, [router]);

  const handleCreateKey = async () => {
    if (!newKeyName.trim()) return;
    setCreating(true);
    try {
      const res = await fetch("/api/keys", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: newKeyName.trim() }),
      });
      const data = await res.json();
      if (res.ok) {
        setJustCreatedKey(data.key);
        setShowNewKey(true);
        setNewKeyName("");
        const keysRes = await fetch("/api/keys");
        if (keysRes.ok) {
          const { data: keys } = await keysRes.json();
          setApiKeys(keys || []);
        }
      } else {
        alert(data.error || "Erro ao criar chave");
      }
    } catch {
      alert("Erro ao criar chave de API");
    } finally {
      setCreating(false);
    }
  };

  const handleRevokeKey = async (keyId: string) => {
    if (!confirm("Tem certeza? Esta ação não pode ser desfeita.")) return;
    try {
      const res = await fetch("/api/keys", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ keyId }),
      });
      if (res.ok) {
        setApiKeys(apiKeys.filter((k) => k.id !== keyId));
      }
    } catch {
      alert("Erro ao revogar chave");
    }
  };

  const activeKeys = apiKeys.filter((k) => !k.revoked_at);
  const hasApiAccess = tenant && (tenant.plan === "starter" || tenant.plan === "pro" || tenant.plan === "enterprise") && (tenant.subscription_status === "active" || tenant.subscription_status === "trialing");

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="h-6 w-6 text-brand animate-spin" />
        <span className="ml-3 text-sm text-text-secondary">Carregando...</span>
      </div>
    );
  }

  return (
    <div className="space-y-8 max-w-4xl">
      <div>
        <h1 className="text-2xl font-semibold text-text-primary tracking-tight">Documentacao da API</h1>
        <p className="text-sm text-text-muted mt-1">
          Integre o INVENTOY com seus sistemas internos, ERP ou aplicativo mobile
        </p>
      </div>

      {!hasApiAccess ? (
        <div className="p-8 rounded-lg border border-border-default bg-bg-surface text-center">
          <Lock className="h-10 w-10 text-text-muted mx-auto mb-4" />
          <h2 className="text-lg font-medium text-text-primary mb-2">API disponível nos planos Starter e Pro</h2>
          <p className="text-sm text-text-secondary max-w-md mx-auto mb-6">
            Faça upgrade do seu plano para gerar uma chave de API e integrar o INVENTOY com seus sistemas.
          </p>
          <Button onClick={() => router.push("/subscription")}>
            Ver Planos <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      ) : (
        <>
          {/* API Key Management */}
          <Card accent="brand">
            <CardHeader>
              <div className="flex items-center gap-2">
                <Key className="h-4 w-4 text-brand" />
                <CardTitle>Gerenciar Chaves de API</CardTitle>
              </div>
              <CardDescription>Crie e gerencie chaves de API para integração com sistemas externos</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {showNewKey && (
                <div className="p-4 rounded-[4px] border border-brand-30 bg-brand-5 space-y-3">
                  <div className="flex items-start gap-2">
                    <Key className="h-5 w-5 text-brand shrink-0 mt-0.5" />
                    <div>
                      <p className="text-sm font-medium text-text-primary">Chave criada com sucesso!</p>
                      <p className="text-xs text-text-muted">Copie esta chave agora. Ela não será mostrada novamente.</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 p-3 rounded-[4px] bg-bg-elevated border border-border-default font-mono text-sm">
                    <code className="flex-1 truncate text-brand">{justCreatedKey}</code>
                    <button
                      onClick={() => {
                        navigator.clipboard.writeText(justCreatedKey);
                        setCopied(true);
                        setTimeout(() => setCopied(false), 2000);
                      }}
                      className="shrink-0 p-1.5 rounded-[4px] text-text-muted hover:text-text-primary hover:bg-bg-surface-hover transition-colors"
                    >
                      {copied ? <Check className="h-4 w-4 text-brand" /> : <Copy className="h-4 w-4" />}
                    </button>
                  </div>
                  <Button variant="ghost" size="sm" onClick={() => setShowNewKey(false)}>Fechar</Button>
                </div>
              )}

              <div className="flex items-center gap-2">
                <Input
                  placeholder="Nome da chave (ex: Prod, ERP, API Shopify)"
                  value={newKeyName}
                  onChange={(e) => setNewKeyName(e.target.value)}
                  className="flex-1"
                  onKeyDown={(e) => e.key === "Enter" && handleCreateKey()}
                />
                <Button onClick={handleCreateKey} loading={creating} disabled={!newKeyName.trim()}>
                  <Plus className="h-4 w-4" />
                  Criar Chave
                </Button>
              </div>

              {activeKeys.length > 0 && (
                <div className="space-y-2">
                  <p className="text-xs text-text-muted font-medium">Chaves ativas ({activeKeys.length})</p>
                  {activeKeys.map((key) => (
                    <div key={key.id} className="flex items-center justify-between p-3 rounded-[4px] border border-border-default bg-bg-surface">
                      <div className="flex items-center gap-3 min-w-0">
                        <Key className="h-4 w-4 text-text-muted shrink-0" />
                        <div className="min-w-0">
                          <p className="text-sm text-text-primary truncate">{key.name}</p>
                          <p className="text-xs text-text-muted font-mono">{key.key_prefix}... • Criada {new Date(key.created_at).toLocaleDateString("pt-BR")}</p>
                        </div>
                      </div>
                      <button
                        onClick={() => handleRevokeKey(key.id)}
                        className="shrink-0 p-2 text-text-muted hover:text-brand-danger transition-colors"
                        title="Revogar chave"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  ))}
                </div>
              )}

              {activeKeys.length === 0 && (
                <div className="flex items-center gap-2 p-3 rounded-[4px] bg-bg-elevated border border-border-dashed text-sm text-text-muted">
                  <AlertTriangle className="h-4 w-4" />
                  Nenhuma chave ativa. Crie uma chave para começar a usar a API.
                </div>
              )}
            </CardContent>
          </Card>

          {/* Authentication */}
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <Lock className="h-4 w-4 text-text-muted" />
                <CardTitle>Autenticação</CardTitle>
              </div>
              <CardDescription>Todas as requisições devem incluir o header de autenticação</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <p className="text-sm text-text-secondary">
                A API utiliza <strong className="text-text-primary">Bearer Token</strong> authentication.
                Inclua sua chave de API em todas as requisições:
              </p>
              <div className="p-3 rounded-[4px] bg-bg-elevated border border-border-default font-mono text-xs">
                <span className="text-text-muted">Authorization: </span>
                <span className="text-brand">Bearer</span>
                <span className="text-text-primary"> inv_seu_id_demo_key</span>
              </div>
              <div className="flex items-start gap-2 text-xs text-text-muted">
                <Shield className="h-3.5 w-3.5 shrink-0 mt-0.5" />
                <p>A chave de API é vinculada ao seu tenant. Chamadas sem autenticação retornam <strong className="text-text-secondary">401 Unauthorized</strong>.</p>
              </div>
            </CardContent>
          </Card>

          {/* Base URL */}
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <Globe className="h-4 w-4 text-text-muted" />
                <CardTitle>Base URL</CardTitle>
              </div>
              <CardDescription>Todas as requisições usam esta URL base</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-2 p-3 rounded-[4px] bg-bg-elevated border border-border-default font-mono text-sm">
                <code className="text-text-primary">https://www.invetoy.com.br/api/v1</code>
                <TechBadge variant="green">HTTPS</TechBadge>
              </div>
            </CardContent>
          </Card>

          {/* Endpoints */}
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <Terminal className="h-4 w-4 text-text-muted" />
                <CardTitle>Endpoints</CardTitle>
              </div>
              <CardDescription>Todos os endpoints disponíveis para integração</CardDescription>
            </CardHeader>
            <CardContent className="space-y-2">
              {ENDPOINTS.map((ep, i) => (
                <div key={ep.path + ep.method} className="border border-border-default rounded-[4px] overflow-hidden">
                  <button
                    onClick={() => setExpandedEndpoint(expandedEndpoint === i ? null : i)}
                    className="w-full flex items-center gap-3 p-3 text-left hover:bg-bg-surface-hover transition-colors"
                  >
                    <TechBadge
                      variant={ep.method === "GET" ? "green" : ep.method === "POST" ? "blue" : ep.method === "PATCH" ? "yellow" : ep.method === "DELETE" ? "red" : "gray"}
                      className="font-mono w-16 justify-center shrink-0"
                    >
                      {ep.method}
                    </TechBadge>
                    <code className="text-sm text-text-primary flex-1 font-mono">{ep.path}</code>
                    <ChevronRight className={`h-4 w-4 text-text-muted transition-transform duration-200 ${expandedEndpoint === i ? "rotate-90" : ""}`} />
                  </button>
                  {expandedEndpoint === i && (
                    <div className="px-3 pb-3 border-t border-border-default">
                      <div className="pt-3 space-y-3">
                        <p className="text-sm text-text-secondary">{ep.desc}</p>
                        {ep.params && (
                          <div>
                            <p className="text-xs text-text-muted mb-1">Parâmetros de consulta:</p>
                            <code className="text-xs text-text-secondary bg-bg-elevated px-2 py-1 rounded font-mono">{ep.path}{ep.params}</code>
                          </div>
                        )}
                        <div className="flex items-center gap-2 text-xs text-text-muted">
                          <Shield className="h-3 w-3" />
                          <span>Autenticação: {ep.auth}</span>
                        </div>
                        <details className="group">
                          <summary className="text-xs text-text-muted cursor-pointer hover:text-text-primary transition-colors select-none">Exemplo de resposta (200 OK)</summary>
                          <pre className="mt-2 p-3 rounded-[4px] bg-bg-elevated border border-border-default overflow-x-auto text-xs font-mono text-text-secondary leading-relaxed">
{`{
  "data": [...],
  "pagination": {
    "page": 1,
    "page_size": 20,
    "total": 156,
    "total_pages": 8
  }
}`}
                          </pre>
                        </details>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Code Examples */}
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <Code2 className="h-4 w-4 text-text-muted" />
                <CardTitle>Exemplos de Código</CardTitle>
              </div>
              <CardDescription>Exemplos com sua chave de API</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex gap-1 p-1 rounded-[4px] bg-bg-elevated border border-border-default w-fit">
                {LANGUAGES.map((lang, i) => (
                  <button
                    key={lang.name}
                    onClick={() => setSelectedLang(i)}
                    className={`px-3 py-1.5 text-xs font-medium rounded-[3px] transition-colors ${
                      selectedLang === i ? "bg-bg-surface text-text-primary shadow-sm" : "text-text-muted hover:text-text-primary"
                    }`}
                  >
                    {lang.name}
                  </button>
                ))}
              </div>
              <pre className="p-4 rounded-[4px] bg-bg-elevated border border-border-default overflow-x-auto text-xs font-mono text-text-secondary leading-relaxed">
                <code>{LANGUAGES[selectedLang].code(activeKeys[0]?.key_prefix + "..." || "SUA_CHAVE")}</code>
              </pre>
            </CardContent>
          </Card>

          {/* Rate Limits */}
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <RefreshCw className="h-4 w-4 text-text-muted" />
                <CardTitle>Rate Limits</CardTitle>
              </div>
              <CardDescription>Limites de requisição para proteger a plataforma</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {[
                  { label: "Requisições/minuto", value: "60", plan: "Starter" },
                  { label: "Requisições/minuto", value: "120", plan: "Pro" },
                  { label: "Concorrência máxima", value: "10", plan: "Ambos" },
                ].map((item) => (
                  <div key={item.label} className="p-3 rounded-[4px] border border-border-default bg-bg-surface">
                    <p className="text-xs text-text-muted mb-1">{item.label}</p>
                    <p className="text-lg font-semibold text-text-primary font-mono">{item.value}</p>
                    <p className="text-[10px] text-text-muted mt-0.5">{item.plan}</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Error Codes */}
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <BookOpen className="h-4 w-4 text-text-muted" />
                <CardTitle>Códigos de Erro</CardTitle>
              </div>
              <CardDescription>Possíveis respostas de erro da API</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {[
                  { code: 401, message: "Unauthorized — Chave de API inválida ou ausente" },
                  { code: 403, message: "Forbidden — Sem permissão para este recurso (upgrade de plano)" },
                  { code: 404, message: "Not Found — Recurso não encontrado" },
                  { code: 409, message: "Conflict — SKU duplicado ao criar produto" },
                  { code: 422, message: "Unprocessable Entity — Dados inválidos na requisição" },
                  { code: 429, message: "Too Many Requests — Rate limit excedido" },
                ].map((err) => (
                  <div key={err.code} className="flex items-center gap-3 p-2 rounded-[4px] hover:bg-bg-surface-hover">
                    <TechBadge variant="red" className="font-mono w-12 justify-center shrink-0">{err.code}</TechBadge>
                    <span className="text-sm text-text-secondary">{err.message}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </>
      )}

      <div className="flex items-center justify-between p-4 rounded-lg border border-border-default bg-bg-surface">
        <div className="flex items-center gap-2 text-sm text-text-muted">
          <ExternalLink className="h-4 w-4" />
          <span>Base URL: <code className="font-mono text-text-secondary">https://www.invetoy.com.br/api/v1</code></span>
        </div>
        <TechBadge variant="green">v1.0</TechBadge>
      </div>
    </div>
  );
}
