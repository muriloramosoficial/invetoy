"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { TechBadge } from "@/components/tech-badge";
import { User, Building2, CreditCard, Bell, Check, ChevronRight, QrCode, Code2, ExternalLink, Loader2, Eye, EyeOff, Shield, Sun, Moon } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import type { Profile, Tenant } from "@/types";
import { useTheme } from "@/components/providers";
import { useToast } from "@/components/ui/toast";

const plans = [
  { id: "free", name: "Free", price: "R$ 0", description: "Ate 30 itens" },
  { id: "starter", name: "Starter", price: "R$ 49", description: "Ate 500 itens" },
  { id: "pro", name: "Professional", price: "R$ 149", description: "Ate 3.000 itens" },
  { id: "enterprise", name: "Enterprise", price: "Personalizado", description: "Itens ilimitados" },
];

export default function SettingsPage() {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [tenant, setTenant] = useState<Tenant | null>(null);
  const [loading, setLoading] = useState(true);
  const { success: toastSuccess, error: toastError } = useToast();

  const [profileName, setProfileName] = useState("");
  const [profileEmail, setProfileEmail] = useState("");
  const [newEmail, setNewEmail] = useState("");
  const [profileSaving, setProfileSaving] = useState(false);

  const [tenantName, setTenantName] = useState("");
  const [tenantSlug, setTenantSlug] = useState("");
  const [tenantSaving, setTenantSaving] = useState(false);

  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showCurrentPw, setShowCurrentPw] = useState(false);
  const [showNewPw, setShowNewPw] = useState(false);
  const [passwordSaving, setPasswordSaving] = useState(false);

  const [emailSaving, setEmailSaving] = useState(false);
  const { theme, setTheme } = useTheme();

  useEffect(() => {
    let mounted = true;
    async function load() {
      setLoading(true);
      try {
        const supabase = createClient();
        const { data: { user }, error: userError } = await supabase.auth.getUser();
        if (userError) throw userError;
        if (!user) throw new Error("Nao autenticado");

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
          setProfileEmail(user.email || profileData.email);
          setNewEmail(user.email || profileData.email);
          setTenantName(tenantData.name);
          setTenantSlug(tenantData.slug);
        }
      } catch (err) {
        if (mounted) toastError(err instanceof Error ? err.message : "Erro ao carregar configuracoes");
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
      const { error: supabaseError } = await supabase
        .from("profiles")
        .update({ name: profileName })
        .eq("id", profile.id);
      if (supabaseError) throw supabaseError;
      toastSuccess("Perfil atualizado com sucesso");
    } catch (err) {
      toastError(err instanceof Error ? err.message : "Erro ao atualizar perfil");
    } finally {
      setProfileSaving(false);
    }
  };

  const handleEmailChange = async () => {
    if (!newEmail.trim() || newEmail === profileEmail) return;
    setEmailSaving(true);
    try {
      const supabase = createClient();
      const { error: supabaseError } = await supabase.auth.updateUser({ email: newEmail.trim() });
      if (supabaseError) throw supabaseError;
      toastSuccess("Email de alteracao enviado. Verifique sua caixa de entrada.");
      setProfileEmail(newEmail.trim());
    } catch (err) {
      toastError(err instanceof Error ? err.message : "Erro ao atualizar email");
      setNewEmail(profileEmail);
    } finally {
      setEmailSaving(false);
    }
  };

  const handlePasswordChange = async () => {
    if (!currentPassword || !newPassword) {
      toastError("Preencha todos os campos de senha");
      return;
    }
    if (newPassword.length < 6) {
      toastError("A nova senha deve ter no minimo 6 caracteres");
      return;
    }
    if (newPassword !== confirmPassword) {
      toastError("As senhas nao conferem");
      return;
    }
    setPasswordSaving(true);
    try {
      const supabase = createClient();
      const { error: supabaseError } = await supabase.auth.updateUser({ password: newPassword });
      if (supabaseError) throw supabaseError;
      toastSuccess("Senha atualizada com sucesso");
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } catch (err) {
      toastError(err instanceof Error ? err.message : "Erro ao atualizar senha");
    } finally {
      setPasswordSaving(false);
    }
  };

  const handleTenantSave = async () => {
    if (!tenant) return;
    setTenantSaving(true);
    try {
      const supabase = createClient();
      const { error: supabaseError } = await supabase
        .from("tenants")
        .update({ name: tenantName })
        .eq("id", tenant.id);
      if (supabaseError) throw supabaseError;
      toastSuccess("Organizacao atualizada com sucesso");
    } catch (err) {
      toastError(err instanceof Error ? err.message : "Erro ao atualizar organizacao");
    } finally {
      setTenantSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="flex flex-col items-center gap-3 text-text-muted">
          <Loader2 className="h-6 w-6 animate-spin" />
          <p className="text-sm">Carregando configuracoes...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-3xl">
      <div>
        <h1 className="text-2xl font-semibold text-text-primary tracking-tight">Configuracoes</h1>
        <p className="text-sm text-text-muted mt-1">
          Gerencie sua conta, empresa e seguranca
        </p>
      </div>

      {/* Perfil */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <User className="h-4 w-4 text-text-muted" />
            <CardTitle>Perfil</CardTitle>
          </div>
          <CardDescription>Seus dados pessoais</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              label="Nome"
              value={profileName}
              onChange={(e) => setProfileName(e.target.value)}
            />
            <div>
              <label className="block text-xs font-medium text-text-secondary mb-1.5 tracking-wide uppercase">
                Email
              </label>
              <div className="flex gap-2">
                <Input
                  type="email"
                  value={newEmail}
                  onChange={(e) => setNewEmail(e.target.value)}
                />
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={handleEmailChange}
                  disabled={emailSaving || !newEmail.trim() || newEmail === profileEmail}
                  className="shrink-0"
                >
                  {emailSaving ? "Salvando..." : "Alterar"}
                </Button>
              </div>
            </div>
          </div>
          <Button onClick={handleProfileSave} disabled={profileSaving}>
            {profileSaving ? "Salvando..." : "Salvar"}
          </Button>
        </CardContent>
      </Card>

      {/* Seguranca - Senha */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Shield className="h-4 w-4 text-text-muted" />
            <CardTitle>Seguranca</CardTitle>
          </div>
          <CardDescription>Altere sua senha de acesso</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-text-secondary mb-1.5 tracking-wide uppercase">
                Nova Senha
              </label>
              <div className="relative">
                <Input
                  type={showNewPw ? "text" : "password"}
                  placeholder="Minimo 6 caracteres"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                />
                <button
                  type="button"
                  onClick={() => setShowNewPw(!showNewPw)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-text-muted hover:text-text-primary transition-colors p-0.5"
                  tabIndex={-1}
                >
                  {showNewPw ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>
            <div>
              <label className="block text-xs font-medium text-text-secondary mb-1.5 tracking-wide uppercase">
                Confirmar Senha
              </label>
              <div className="relative">
                <Input
                  type={showCurrentPw ? "text" : "password"}
                  placeholder="Repita a nova senha"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                />
                <button
                  type="button"
                  onClick={() => setShowCurrentPw(!showCurrentPw)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-text-muted hover:text-text-primary transition-colors p-0.5"
                  tabIndex={-1}
                >
                  {showCurrentPw ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>
          </div>
          <Button onClick={handlePasswordChange} disabled={passwordSaving || !newPassword || !confirmPassword}>
            {passwordSaving ? "Alterando..." : "Alterar Senha"}
          </Button>
        </CardContent>
      </Card>

      {/* Organizacao */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Building2 className="h-4 w-4 text-text-muted" />
            <CardTitle>Organizacao</CardTitle>
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
            disabled
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
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            {plans.map((plan) => {
              const isCurrent = tenant?.plan === plan.id;
              return (
                <div
                  key={plan.id}
                  className={`p-4 rounded-[6px] border transition-all ${
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
                    <Button variant="outline" size="sm" className="w-full mt-3">Fazer Upgrade</Button>
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
                  <p className="text-sm text-text-primary">PIX, Boleto ou Cartao de Credito</p>
                  <p className="text-xs text-text-muted">Assinatura mensal processada com seguranca</p>
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
            <CardTitle>API de Integracao</CardTitle>
          </div>
          <CardDescription>Acesse a documentacao completa da API REST</CardDescription>
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
                Ver Documentacao <ChevronRight className="h-3.5 w-3.5" />
              </Link>
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Aparencia - Tema */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            {theme === "dark" ? <Moon className="h-4 w-4 text-text-muted" /> : <Sun className="h-4 w-4 text-text-muted" />}
            <CardTitle>Aparencia</CardTitle>
          </div>
          <CardDescription>Escolha entre tema claro e escuro</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-4">
            <button
              onClick={() => setTheme("dark")}
              className={`flex-1 p-4 rounded-[6px] border-2 transition-all ${
                theme === "dark"
                  ? "border-brand bg-brand-5"
                  : "border-border-default bg-bg-surface hover:border-[#444]"
              }`}
            >
              <div className="flex flex-col items-center gap-2">
                <Moon className={`h-6 w-6 ${theme === "dark" ? "text-brand" : "text-text-muted"}`} />
                <span className={`text-sm font-medium ${theme === "dark" ? "text-brand" : "text-text-secondary"}`}>Escuro</span>
              </div>
            </button>
            <button
              onClick={() => setTheme("light")}
              className={`flex-1 p-4 rounded-[6px] border-2 transition-all ${
                theme === "light"
                  ? "border-brand bg-brand-5"
                  : "border-border-default bg-bg-surface hover:border-[#444]"
              }`}
            >
              <div className="flex flex-col items-center gap-2">
                <Sun className={`h-6 w-6 ${theme === "light" ? "text-brand" : "text-text-muted"}`} />
                <span className={`text-sm font-medium ${theme === "light" ? "text-brand" : "text-text-secondary"}`}>Claro</span>
              </div>
            </button>
          </div>
        </CardContent>
      </Card>

      {/* Notificacoes */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Bell className="h-4 w-4 text-text-muted" />
            <CardTitle>Notificacoes</CardTitle>
          </div>
          <CardDescription>Configure seus alertas</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {[
            "Manutencao de patrimonio pendente",
            "Itens com garantia proxima do vencimento",
            "Resumo diario de movimentacoes",
            "Relatorio semanal de inventario"
          ].map((item) => (
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
