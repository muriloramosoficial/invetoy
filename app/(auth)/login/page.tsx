"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { sendMagicLink } from "@/app/actions/auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Box, Mail, Lock, Eye, EyeOff, Shield, BarChart3, Package } from "lucide-react";
import Link from "next/link";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [mounted, setMounted] = useState(false);
  useEffect(() => { setMounted(true); }, []);

  const handleLogin = async () => {
    if (!email || !password) {
      setError("Preencha todos os campos");
      return;
    }
    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim(), password }),
      });
      const result = await res.json();
      if (!res.ok || result.error) {
        if (result.error?.includes("Invalid login credentials")) {
          setError("Email ou senha incorretos");
        } else {
          setError(result.error || "Erro ao fazer login");
        }
      } else {
        const { createClient } = await import("@/lib/supabase/client");
        const supabase = createClient();
        const { data: { user } } = await supabase.auth.getUser();          if (user) {
            const { data: profile } = await supabase
              .from("profiles")
              .select("is_system_admin, is_staff")
              .eq("id", user.id)
              .single();
          if (profile?.is_system_admin || profile?.is_staff) {
            router.push("/admin");
          } else {
            router.push("/dashboard");
          }
        } else {
          router.push("/dashboard");
        }
      }
    } catch {
      setError("Erro de conexao. Tente novamente.");
    } finally {
      setLoading(false);
    }
  };

  const handleMagicLink = async () => {
    if (!email.trim()) { setError("Digite seu email primeiro"); return; }
    setLoading(true);
    setError("");
    const result = await sendMagicLink(email.trim());
    if (result?.error) {
      setError(result.error);
      setLoading(false);
    } else {
      alert("Link magico enviado! Verifique seu email.");
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-bg-primary flex">
      <div className="flex-1 flex flex-col items-center justify-center p-6 lg:p-12 relative">
        <div className="absolute inset-0 opacity-[0.03] pointer-events-none"
          style={{
            backgroundImage: "linear-gradient(rgba(62,207,142,1) 1px, transparent 1px), linear-gradient(90deg, rgba(62,207,142,1) 1px, transparent 1px)",
            backgroundSize: "48px 48px",
          }}
        />
        <div className={`relative w-full max-w-sm transition-all duration-500 ${mounted ? "translate-y-0 opacity-100" : "translate-y-4 opacity-0"}`}>
          <div className="flex flex-col items-center mb-10">
            <Link href="/" className="group flex items-center justify-center w-14 h-14 rounded-xl bg-brand-8 mb-4 hover:bg-brand-12 transition-all duration-300 hover:shadow-[0_0_30px_rgba(62,207,142,0.1)]" aria-label="Voltar para pagina inicial">
              <Box className="h-7 w-7 text-brand transition-transform duration-300 group-hover:scale-110" />
            </Link>
            <h1 className="text-xl font-semibold text-text-primary tracking-tight">INVENTOY</h1>
            <p className="text-sm text-text-muted mt-1">Gestao de Patrimonio Inteligente</p>
          </div>

          <form noValidate className="space-y-5">
            <div className="space-y-4">
              <div>
                <Label htmlFor="login-email">Email</Label>
                <Input id="login-email" type="email" placeholder="seu@email.com" value={email} onChange={(e) => setEmail(e.target.value)} required autoComplete="email" icon={<Mail className="h-4 w-4" />} />
              </div>
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <Label htmlFor="login-password">Senha</Label>
                  <button type="button" className="text-[11px] text-text-muted hover:text-brand transition-colors" tabIndex={-1}>Esqueceu?</button>
                </div>
                <div className="relative">
                  <Input id="login-password" type={showPassword ? "text" : "password"} placeholder="********" value={password} onChange={(e) => setPassword(e.target.value)} onKeyDown={(e: React.KeyboardEvent) => { if (e.key === "Enter") handleLogin(); }} required autoComplete="current-password" icon={<Lock className="h-4 w-4" />} />
                  <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-text-muted hover:text-text-primary transition-colors p-0.5" aria-label={showPassword ? "Ocultar senha" : "Mostrar senha"} tabIndex={-1}>
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>
            </div>

            {error && (<div className="text-sm p-3 rounded-[4px] border border-brand-danger-20 bg-brand-danger-dim text-brand-danger" role="alert">{error}</div>)}

            <button type="button" className="w-full h-11 inline-flex items-center justify-center gap-2 rounded-[4px] font-medium bg-brand text-black" onClick={handleLogin}>{loading ? "Entrando..." : "Entrar"}</button>

            <div className="text-center">
              <span className="text-sm text-text-muted">Nao tem conta? </span>
              <Link href="/register" className="text-sm text-brand hover:text-brand-hover transition-colors font-medium">Cadastre-se gratis</Link>
            </div>

            <div className="relative">
              <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-border-default" /></div>
              <div className="relative flex justify-center text-xs uppercase"><span className="bg-bg-primary px-2 text-text-muted">ou</span></div>
            </div>

            <Button type="button" variant="outline" className="w-full h-11" onClick={handleMagicLink} disabled={loading}>
              <Mail className="h-4 w-4" />
              Entrar com link magico
            </Button>
          </form>

          <p className="mt-8 text-[10px] text-text-muted text-center">
            Ao continuar, voce aceita nossos{" "}
            <Link href="/termos" className="underline underline-offset-2 hover:text-text-primary transition-colors">Termos</Link> e{" "}
            <Link href="/privacidade" className="underline underline-offset-2 hover:text-text-primary transition-colors">Privacidade</Link>
          </p>
        </div>
      </div>

      <div className="hidden lg:flex flex-1 bg-bg-secondary border-l border-border-default items-center justify-center p-12 relative overflow-hidden">
        <div className="absolute inset-0 opacity-[0.03] pointer-events-none"
          style={{
            backgroundImage: "linear-gradient(rgba(62,207,142,1) 1px, transparent 1px), linear-gradient(90deg, rgba(62,207,142,1) 1px, transparent 1px)",
            backgroundSize: "32px 32px",
          }}
        />
        <div className="absolute top-1/3 -left-32 w-96 h-96 rounded-full bg-brand-5 blur-3xl pointer-events-none" />
        <div className="absolute bottom-1/4 -right-32 w-80 h-80 rounded-full bg-brand-3 blur-3xl pointer-events-none" />

        <div className="relative text-center max-w-md">
          <div className="w-20 h-20 rounded-2xl bg-brand-8 flex items-center justify-center mx-auto mb-8">
            <Shield className="h-10 w-10 text-brand" />
          </div>
          <h2 className="text-2xl font-semibold text-text-primary tracking-tight mb-4">
            Controle total do seu patrimonio
          </h2>
          <p className="text-text-secondary leading-relaxed mb-8">
            Dashboard em tempo real, historico de movimentacoes, movimentacoes auditadas e muito mais.
          </p>
          <div className="grid grid-cols-3 gap-4">
            {[
              { icon: Package, label: "Produtos", value: "Ilimitados" },
              { icon: BarChart3, label: "Analytics", value: "Em tempo real" },
              { icon: Shield, label: "Seguranca", value: "Criptografia" },
            ].map((item) => (
              <div key={item.label} className="p-4 rounded-lg border border-border-default bg-bg-surface">
                <item.icon className="h-5 w-5 text-brand mx-auto mb-2" />
                <p className="text-xs font-medium text-text-primary">{item.label}</p>
                <p className="text-[10px] text-text-muted">{item.value}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
