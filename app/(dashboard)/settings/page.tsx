"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { TechBadge } from "@/components/tech-badge";
import { User, Building2, CreditCard, Bell, Check, ChevronRight, QrCode, Code2, ExternalLink, Loader2 } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import type { Profile, Tenant } from "@/types";

const plans = [
  { id: "free", name: "Free", price: "R$ 0", description: "Até 30 produtos" },
  { id: "starter", name: "Starter", price: "R$ 49", description: "Até 500 produtos" },
  { id: "pro", name: "Professional", price: "R$ 149", description: "Até 3.000 produtos" },
  { id: "enterprise", name: "Enterprise", price: "Personalizado", description: "Produtos ilimitados" },
];

export default function SettingsPage() {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [tenant, setTenant] = useState<Tenant | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [profileSaving, setProfileSaving] = useState(false);
  const [tenantSaving, setTenantSaving] = useState(false);

  const [profileName, setProfileName] = useState("");
  const [profileEmail, setProfileEmail] = useState("");
  const [tenantName, setTenantName] = useState("");
  const [tenantSlug, setTenantSlug] = useState("");

  useEffect(() => {
    let mounted = true;
    async function load() {
      setLoading(true);
      setError(null);
      try {
        const supabase = createClient();
        const { data: { user }, error: userError } = await supabase.auth.getUser();
        if (userError) throw userError;
        if (!user) throw new Error("Not authenticated");

        const { data: profileData, error: profileError } = await supabase
          .from("profiles")
          .select("*")
          .eq("id", user.id)
          .single();
        if (profileError) throw profileError;

        const { data: tenantData, error: tenantError } = await supabase
          .from("tenants")
          .select("*")
          .eq("id", profileData.tenant_id)
          .single();
        if (tenantError) throw tenantError;

        if (mounted) {
          setProfile(profileData);
          setTenant(tenantData);
          setProfileName(profileData.name);
          setProfileEmail(profileData.email);
          setTenantName(tenantData.name);
          setTenantSlug(tenantData.slug);
        }
      } catch (err) {
        if (mounted) setError(err instanceof Error ? err.message : "Failed to load settings");
      } finally {
        if (mounted) setLoading(false);
      }
    }
    load();
    return () => { mounted = false; };
  }, []);

  const handleProfileSave = async () => {
    if (!profile) return;
    setProfileSaving(true);
    try {
      const supabase = createClient();
      const { error } = await supabase
        .from("profiles")
        .update({ name: profileName })
        .eq("id", profile.id);
      if (error) throw error;
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to update profile");
    } finally {
      setProfileSaving(false);
    }
  };

  const handleTenantSave = async () => {
    if (!tenant) return;
    setTenantSaving(true);
    try {
      const supabase = createClient();
      const { error } = await supabase
        .from("tenants")
        .update({ name: tenantName })
        .eq("id", tenant.id);
      if (error) throw error;
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to update organization");
    } finally {
      setTenantSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="flex flex-col items-center gap-3 text-text-muted">
          <Loader2 className="h-6 w-6 animate-spin" />
          <p className="text-sm">Loading settings...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-3xl">
      <div>
        <h1 className="text-2xl font-semibold text-text-primary tracking-tight">Configurações</h1>
        <p className="text-sm text-text-muted mt-1">
          Gerencie sua conta, faturamento e preferências
        </p>
      </div>

      {error && (
        <div className="rounded-[4px] border border-brand-danger-30 bg-brand-danger-dim p-3 text-sm text-brand-danger">
          {error}
        </div>
      )}

      {/* Perfil */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <User className="h-4 w-4 text-text-muted" />
            <CardTitle>Perfil</CardTitle>
          </div>
          <CardDescription>Suas informações pessoais</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              label="Nome"
              value={profileName}
              onChange={(e) => setProfileName(e.target.value)}
            />
            <Input
              label="Email"
              type="email"
              value={profileEmail}
              disabled
            />
          </div>
          <Button onClick={handleProfileSave} disabled={profileSaving}>
            {profileSaving ? "Salvando..." : "Salvar"}
          </Button>
        </CardContent>
      </Card>

      {/* Organização */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Building2 className="h-4 w-4 text-text-muted" />
            <CardTitle>Organização</CardTitle>
          </div>
          <CardDescription>Dados da sua empresa</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Input
            label="Nome da Empresa"
            value={tenantName}
            onChange={(e) => setTenantName(e.target.value)}
          />
          <Input
            label="Slug da empresa"
            value={tenantSlug}
            onChange={(e) => setTenantSlug(e.target.value)}
          />
          <Button onClick={handleTenantSave} disabled={tenantSaving}>
            {tenantSaving ? "Salvando..." : "Salvar"}
          </Button>
        </CardContent>
      </Card>

      {/* Planos */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <CreditCard className="h-4 w-4 text-text-muted" />
            <CardTitle>Plano e Faturamento</CardTitle>
          </div>
          <CardDescription>Gerencie sua assinatura e forma de pagamento</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
            {plans.map((plan) => {
              const isCurrent = tenant?.plan === plan.id;
              return (
                <div
                  key={plan.id}
                  className={`p-4 rounded-[6px] border transition-all cursor-pointer ${
                    isCurrent
                      ? "border-brand bg-brand-5"
                      : "border-border-default bg-bg-surface hover:border-[#444]"
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-text-primary">{plan.name}</span>
                    {isCurrent && <Check className="h-4 w-4 text-brand" />}
                  </div>
                  <p className="text-2xl font-semibold text-text-primary font-mono">{plan.price}</p>
                  <p className="text-xs text-text-muted mt-1">{plan.description}</p>
                  {!isCurrent && (
                    <Button variant="outline" size="sm" className="w-full mt-3">Upgrade</Button>
                  )}
                  {isCurrent && (
                    <TechBadge variant="green" className="w-full justify-center mt-3">Atual</TechBadge>
                  )}
                </div>
              );
            })}
          </div>

          <div className="pt-2">
            <h4 className="text-xs font-medium text-text-secondary uppercase tracking-wide mb-2">
              Forma de Pagamento
            </h4>
            <div className="flex items-center justify-between p-3 rounded-[4px] border border-border-default bg-bg-surface">
              <div className="flex items-center gap-3">
                <QrCode className="h-4 w-4 text-brand" />
                <div>
                  <p className="text-sm text-text-primary">PIX, Boleto ou Cartão de Crédito</p>
                  <p className="text-xs text-text-muted">Assinatura mensal processada com segurança</p>
                </div>
              </div>
              <Button variant="secondary" size="sm" asChild>
              <Link href="/subscription">
                Gerenciar <ChevronRight className="h-3.5 w-3.5" />
              </Link>
            </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* API Access */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Code2 className="h-4 w-4 text-text-muted" />
            <CardTitle>API de Integração</CardTitle>
          </div>
          <CardDescription>Acesse a documentação completa da API REST</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between p-4 rounded-[4px] border border-border-default bg-bg-surface">
            <div className="flex items-center gap-3">
              <ExternalLink className="h-5 w-5 text-brand" />
              <div>
                <p className="text-sm text-text-primary">API /api/v1</p>
                <p className="text-xs text-text-muted">Integre com seu ERP, site ou aplicativo mobile</p>
              </div>
            </div>
            <Button variant="secondary" size="sm" asChild>
              <Link href="/settings/api">
                Ver Documentação <ChevronRight className="h-3.5 w-3.5" />
              </Link>
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Notificações */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Bell className="h-4 w-4 text-text-muted" />
            <CardTitle>Notificações</CardTitle>
          </div>
          <CardDescription>Configure seus alertas</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {["Alerta de estoque baixo", "Itens próximos ao vencimento", "Resumo diário", "Relatório semanal"].map((item) => (
            <label key={item} className="flex items-center justify-between p-2 rounded-[4px] hover:bg-bg-surface-hover cursor-pointer">
              <span className="text-sm text-text-primary">{item}</span>
              <div className="relative">
                <input type="checkbox" defaultChecked className="sr-only peer" />
                <div className="w-9 h-5 rounded-full bg-bg-elevated peer-checked:bg-brand transition-colors after:content-[''] after:absolute after:top-0.5 after:left-0.5 after:w-4 after:h-4 after:rounded-full after:bg-white after:transition-all peer-checked:after:translate-x-4" />
              </div>
            </label>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
