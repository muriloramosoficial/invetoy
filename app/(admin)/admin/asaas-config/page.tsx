"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import { useToast } from "@/components/ui/toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { TechBadge } from "@/components/tech-badge";
import { Loader2, ExternalLink, Eye, EyeOff, Copy, AlertTriangle, Webhook, Key, Globe, Check } from "lucide-react";

interface AsaasConfig {
  asaas_api_key_sandbox: string;
  asaas_api_key_production: string;
  asaas_env: "sandbox" | "production";
  asaas_webhook_url_sandbox: string;
  asaas_webhook_url_production: string;
  asaas_webhook_secret_sandbox: string;
  asaas_webhook_secret_production: string;
}

export default function AsaasConfigPage() {
  const [config, setConfig] = useState<AsaasConfig>({
    asaas_api_key_sandbox: "",
    asaas_api_key_production: "",
    asaas_env: "sandbox",
    asaas_webhook_url_sandbox: "",
    asaas_webhook_url_production: "",
    asaas_webhook_secret_sandbox: "",
    asaas_webhook_secret_production: "",
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { success: toastSuccess, error: toastError } = useToast();
  const [showSandboxKey, setShowSandboxKey] = useState(false);
  const [showProdKey, setShowProdKey] = useState(false);

  const webhookBase = typeof window !== "undefined" ? window.location.origin : "";

  useEffect(() => {
    load();
  }, []);

  async function load() {
    setLoading(true);
    try {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Nao autenticado");

      const { data: profile } = await supabase
        .from("profiles")
        .select("tenant_id")
        .eq("id", user.id)
        .single();

      if (!profile?.tenant_id) throw new Error("Tenant nao encontrado");

      const { data: tenant, error: tenantErr } = await supabase
        .from("tenants")
        .select("asaas_api_key_sandbox, asaas_api_key_production, asaas_env, asaas_webhook_url_sandbox, asaas_webhook_url_production, asaas_webhook_secret_sandbox, asaas_webhook_secret_production")
        .eq("id", profile.tenant_id)
        .single();

      if (tenantErr) {
        if (tenantErr.message?.includes("column") || tenantErr.message?.includes("does not exist")) {
          return;
        }
        throw tenantErr;
      }

      if (tenant) {
        setConfig({
          asaas_api_key_sandbox: tenant.asaas_api_key_sandbox || "",
          asaas_api_key_production: tenant.asaas_api_key_production || "",
          asaas_env: tenant.asaas_env || "sandbox",
          asaas_webhook_url_sandbox: tenant.asaas_webhook_url_sandbox || "",
          asaas_webhook_url_production: tenant.asaas_webhook_url_production || "",
          asaas_webhook_secret_sandbox: tenant.asaas_webhook_secret_sandbox || "",
          asaas_webhook_secret_production: tenant.asaas_webhook_secret_production || "",
        });
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro ao carregar configuracoes");
    } finally {
      setLoading(false);
    }
  }

  async function handleSave() {
    setSaving(true);
    setError(null);
    try {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Nao autenticado");

      const { data: profile } = await supabase
        .from("profiles")
        .select("tenant_id")
        .eq("id", user.id)
        .single();

      if (!profile?.tenant_id) throw new Error("Tenant nao encontrado");

      const { error } = await supabase
        .from("tenants")
        .update({
          asaas_api_key_sandbox: config.asaas_api_key_sandbox || null,
          asaas_api_key_production: config.asaas_api_key_production || null,
          asaas_env: config.asaas_env,
          asaas_webhook_url_sandbox: config.asaas_webhook_url_sandbox || null,
          asaas_webhook_url_production: config.asaas_webhook_url_production || null,
          asaas_webhook_secret_sandbox: config.asaas_webhook_secret_sandbox || null,
          asaas_webhook_secret_production: config.asaas_webhook_secret_production || null,
        })
        .eq("id", profile.tenant_id);

      if (error) throw error;
      toastSuccess("Configuracoes do Asaas salvas com sucesso");
    } catch (err) {
      toastError(err instanceof Error ? err.message : "Erro ao salvar");
    } finally {
      setSaving(false);
    }
  }

  function copyText(text: string) {
    navigator.clipboard.writeText(text);
    toastSuccess("Copiado!");
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-24">
        <Loader2 className="h-6 w-6 text-text-muted animate-spin" />
      </div>
    );
  }

  const webhookUrl = `${webhookBase}/api/webhooks/asaas`;

  return (
    <div className="space-y-6 max-w-3xl">
      <div>
        <h1 className="text-2xl font-semibold text-text-primary tracking-tight">Configuracao Asaas</h1>
        <p className="text-sm text-text-muted mt-1">
          Configure as chaves de API e webhooks do Asaas para processamento de pagamentos
        </p>
      </div>

      {/* Ambiente ativo */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Globe className="h-4 w-4 text-text-muted" />
            <CardTitle>Ambiente Ativo</CardTitle>
          </div>
          <CardDescription>Selecione o ambiente do Asaas que esta em uso</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row gap-3">
            <button
              onClick={() => setConfig({ ...config, asaas_env: "sandbox" })}
              className={`flex-1 p-3 sm:p-4 rounded-[6px] border transition-all text-left ${
                config.asaas_env === "sandbox"
                  ? "border-brand bg-brand-5"
                  : "border-border-default bg-bg-surface hover:border-[#444]"
              }`}
            >
              <div className="flex items-center justify-between mb-1">
                <span className="text-sm font-medium text-text-primary">Sandbox</span>
                {config.asaas_env === "sandbox" && <Check className="h-4 w-4 text-brand shrink-0" />}
              </div>
              <p className="text-xs text-text-muted">Ambiente de testes</p>
            </button>
            <button
              onClick={() => setConfig({ ...config, asaas_env: "production" })}
              className={`flex-1 p-3 sm:p-4 rounded-[6px] border transition-all text-left ${
                config.asaas_env === "production"
                  ? "border-brand bg-brand-5"
                  : "border-border-default bg-bg-surface hover:border-[#444]"
              }`}
            >
              <div className="flex items-center justify-between mb-1">
                <span className="text-sm font-medium text-text-primary">Producao</span>
                {config.asaas_env === "production" && <Check className="h-4 w-4 text-brand shrink-0" />}
              </div>
              <p className="text-xs text-text-muted">Ambiente real. Pagamentos processados.</p>
            </button>
          </div>
        </CardContent>
      </Card>

      {/* Webhook URLs - Card destacado com as URLs auto-geradas */}
      <Card accent="brand">
        <CardHeader>
          <div className="flex items-center gap-2">
            <Webhook className="h-4 w-4 text-brand" />
            <CardTitle>URL do Webhook</CardTitle>
          </div>
          <CardDescription>
            Copie esta URL e cadastre no painel do Asaas para receber notificacoes de pagamento
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="rounded-[6px] border border-brand-20 bg-brand-5 p-4">
            <div className="flex items-center gap-2 mb-2">
              <TechBadge variant="green">URL UNICA</TechBadge>
              <span className="text-xs text-text-muted">Funciona para Sandbox e Producao</span>
            </div>
            <div className="flex flex-col sm:flex-row gap-2">
              <code className="flex-1 text-xs text-brand bg-bg-surface p-2.5 rounded-[4px] border border-border-default break-all font-mono max-w-full">
                {webhookUrl}
              </code>
              <Button variant="secondary" size="sm" onClick={() => copyText(webhookUrl)} className="w-full sm:w-auto shrink-0">
                <Copy className="h-3.5 w-3.5" />
                Copiar
              </Button>
            </div>
            <p className="text-[11px] text-text-muted mt-2 flex items-start sm:items-center gap-1">
              <ExternalLink className="h-3 w-3 shrink-0 mt-0.5 sm:mt-0" />
              <span>
                Acesse{" "}
                <a href="https://sandbox.asaas.com/configuracoes/webhooks" target="_blank" rel="noopener noreferrer" className="text-brand hover:underline">
                  sandbox.asaas.com/configuracoes/webhooks
                </a>{" "}
                e cadastre esta URL.
              </span>
            </p>
          </div>

          <div className="rounded-[4px] bg-bg-surface border border-border-default p-3">
            <p className="text-[11px] text-text-muted">
              <strong className="text-text-secondary">Eventos necessarios no Asaas:</strong>{" "}
              <span className="text-text-secondary">payment.created</span>,{" "}
              <span className="text-text-secondary">payment.updated</span>,{" "}
              <span className="text-text-secondary">payment.confirmed</span>,{" "}
              <span className="text-text-secondary">payment.deleted</span>,{" "}
              <span className="text-text-secondary">subscription.updated</span>
            </p>
          </div>

          <div className="rounded-[4px] bg-bg-surface border border-border-default p-3">
            <p className="text-[11px] text-text-muted">
              <strong className="text-text-secondary">Webhook Secret:</strong>{" "}
              Salve o secret do webhook diretamente neste painel. O sistema valida o token usando o valor armazenado no banco para Sandbox e Produção.
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Sandbox */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Key className="h-4 w-4 text-brand-warning" />
            <CardTitle>Ambiente Sandbox</CardTitle>
            <TechBadge variant="yellow">Teste</TechBadge>
          </div>
          <CardDescription>Chave de API para ambiente de testes</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-text-secondary mb-1.5 tracking-wide uppercase">
              Chave de API (Sandbox)
            </label>
            <div className="flex gap-2">
              <div className="relative flex-1">
                <Input
                  type={showSandboxKey ? "text" : "password"}
                  value={config.asaas_api_key_sandbox}
                  onChange={(e) => setConfig({ ...config, asaas_api_key_sandbox: e.target.value })}
                  placeholder="sandbox_xxxxxxxxxxxxxxxxxxxx"
                />
                <button
                  type="button"
                  onClick={() => setShowSandboxKey(!showSandboxKey)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-text-muted hover:text-text-primary p-0.5"
                  tabIndex={-1}
                >
                  {showSandboxKey ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
              {config.asaas_api_key_sandbox && (
                <Button variant="secondary" size="icon-sm" onClick={() => copyText(config.asaas_api_key_sandbox)}>
                  <Copy className="h-3.5 w-3.5" />
                </Button>
              )}
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-text-secondary mb-1.5 tracking-wide uppercase">
              Secret do Webhook (Sandbox)
            </label>
            <Input
              type="password"
              value={config.asaas_webhook_secret_sandbox}
              onChange={(e) => setConfig({ ...config, asaas_webhook_secret_sandbox: e.target.value })}
              placeholder="Secret para validar assinatura do webhook"
            />
          </div>
        </CardContent>
      </Card>

      {/* Producao */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Key className="h-4 w-4 text-brand" />
            <CardTitle>Ambiente Producao</CardTitle>
            <TechBadge variant="green">Producao</TechBadge>
          </div>
          <CardDescription>Chave de API para ambiente real</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-text-secondary mb-1.5 tracking-wide uppercase">
              Chave de API (Producao)
            </label>
            <div className="flex gap-2">
              <div className="relative flex-1">
                <Input
                  type={showProdKey ? "text" : "password"}
                  value={config.asaas_api_key_production}
                  onChange={(e) => setConfig({ ...config, asaas_api_key_production: e.target.value })}
                  placeholder="production_xxxxxxxxxxxxxxxxxxxx"
                />
                <button
                  type="button"
                  onClick={() => setShowProdKey(!showProdKey)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-text-muted hover:text-text-primary p-0.5"
                  tabIndex={-1}
                >
                  {showProdKey ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
              {config.asaas_api_key_production && (
                <Button variant="secondary" size="icon-sm" onClick={() => copyText(config.asaas_api_key_production)}>
                  <Copy className="h-3.5 w-3.5" />
                </Button>
              )}
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-text-secondary mb-1.5 tracking-wide uppercase">
              Secret do Webhook (Producao)
            </label>
            <Input
              type="password"
              value={config.asaas_webhook_secret_production}
              onChange={(e) => setConfig({ ...config, asaas_webhook_secret_production: e.target.value })}
              placeholder="Secret para validar assinatura do webhook"
            />
          </div>
        </CardContent>
      </Card>

      {/* Info */}
      <div className="rounded-[4px] border border-border-default bg-bg-card p-4">
        <div className="flex items-start gap-3">
          <AlertTriangle className="h-4 w-4 text-brand-warning mt-0.5 shrink-0" />
          <div className="text-xs text-text-muted space-y-1">
            <p><strong className="text-text-secondary">Importante:</strong> As chaves de API sao salvas de forma segura no banco de dados. Nunca compartilhe suas chaves de producao.</p>
            <p><strong className="text-text-secondary">Webhook:</strong> Acesse o painel do Asaas em <a href="https://www.asaas.com/configuracoes/webhook" target="_blank" rel="noopener noreferrer" className="text-brand hover:underline inline-flex items-center gap-1">asaas.com/configuracoes/webhook <ExternalLink className="h-3 w-3" /></a> para configurar a URL e secret.</p>
          </div>
        </div>
      </div>

      <div className="flex justify-end">
        <Button onClick={handleSave} disabled={saving} className="w-full sm:w-auto">
          {saving ? "Salvando..." : "Salvar Configuracoes"}
        </Button>
      </div>
    </div>
  );
}
