"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { User, Shield, Loader2, Eye, EyeOff, Sun, Moon, Bell } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { useTheme } from "@/components/providers";
import { useToast } from "@/components/ui/toast";

export default function ProfilePage() {
  const { theme, setTheme } = useTheme();
  const { success: toastSuccess, error: toastError } = useToast();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [profileName, setProfileName] = useState("");
  const [profileEmail, setProfileEmail] = useState("");
  const [newEmail, setNewEmail] = useState("");

  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showCurrentPw, setShowCurrentPw] = useState(false);
  const [showNewPw, setShowNewPw] = useState(false);
  const [passwordSaving, setPasswordSaving] = useState(false);
  const [emailSaving, setEmailSaving] = useState(false);

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
          .select("name, email")
          .eq("id", user.id)
          .single();
        if (profileError) throw profileError;

        if (mounted) {
          setProfileName(profileData.name || "");
          setProfileEmail(user.email || profileData.email || "");
          setNewEmail(user.email || profileData.email || "");
        }
      } catch (err) {
        if (mounted) toastError(err instanceof Error ? err.message : "Erro ao carregar perfil");
      } finally {
        if (mounted) setLoading(false);
      }
    }
    load();
    return () => { mounted = false; };
  }, []);

  const handleProfileSave = async () => {
    if (!profileName.trim()) return;
    setSaving(true);
    try {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Nao autenticado");

      const { error: supabaseError } = await supabase
        .from("profiles")
        .update({ name: profileName.trim() })
        .eq("id", user.id);
      if (supabaseError) throw supabaseError;
      toastSuccess("Perfil atualizado com sucesso");
    } catch (err) {
      toastError(err instanceof Error ? err.message : "Erro ao atualizar perfil");
    } finally {
      setSaving(false);
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

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="flex flex-col items-center gap-3 text-text-muted">
          <Loader2 className="h-6 w-6 animate-spin" />
          <p className="text-sm">Carregando perfil...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-3xl">
      <div>
        <h1 className="text-2xl font-semibold text-text-primary tracking-tight">Perfil</h1>
        <p className="text-sm text-text-muted mt-1">
          Suas informacoes pessoais e preferencias
        </p>
      </div>

      {/* Perfil - Dados pessoais */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <User className="h-4 w-4 text-text-muted" />
            <CardTitle>Dados Pessoais</CardTitle>
          </div>
          <CardDescription>Seu nome e email de acesso</CardDescription>
        </CardHeader>        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              label="Nome"
              value={profileName}
              onChange={(e) => setProfileName(e.target.value)}
            />
            <div className="min-w-0">
              <label className="block text-xs font-medium text-text-secondary mb-1.5 tracking-wide uppercase">
                Email
              </label>
              <div className="flex flex-col sm:flex-row gap-2">
                <Input
                  type="email"
                  value={newEmail}
                  onChange={(e) => setNewEmail(e.target.value)}
                  className="flex-1"
                />
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={handleEmailChange}
                  disabled={emailSaving || !newEmail.trim() || newEmail === profileEmail}
                  className="shrink-0 w-full sm:w-auto"
                >
                  {emailSaving ? "Salvando..." : "Alterar"}
                </Button>
              </div>
            </div>
          </div>
          <Button onClick={handleProfileSave} disabled={saving} className="w-full sm:w-auto">
            {saving ? "Salvando..." : "Salvar"}
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
