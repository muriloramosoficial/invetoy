"use client";

import { useState, useSyncExternalStore } from "react";
import { useRouter } from "next/navigation";
import { register } from "@/app/actions/auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Box, Package, Mail, Lock, Eye, EyeOff, User, Building2, CheckCircle, ArrowRight, Shield, BarChart3, Zap } from "lucide-react";
import Link from "next/link";

export default function RegisterPage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [companyName, setCompanyName] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const mounted = useSyncExternalStore(() => () => {}, () => true, () => false);

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    if (!name.trim() || !email.trim() || !password || !companyName.trim()) {
      setError("Preencha todos os campos");
      setLoading(false);
      return;
    }
    if (password.length < 6) {
      setError("A senha deve ter no minimo 6 caracteres");
      setLoading(false);
      return;
    }

    const result = await register({
      name: name.trim(),
      email: email.trim(),
      password,
      companyName: companyName.trim(),
    });

    if (result.error) {
      setError(result.error);
      setLoading(false);
    } else {
      setSuccess(true);
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="min-h-screen bg-bg-primary flex items-center justify-center p-4">
        <div className="w-full max-w-sm text-center">
          <div className="flex items-center justify-center w-16 h-16 rounded-xl bg-brand-8 mx-auto mb-6">
            <CheckCircle className="h-8 w-8 text-brand" />
          </div>
          <h1 className="text-xl font-semibold text-text-primary tracking-tight mb-2">Conta criada!</h1>
          <p className="text-sm text-text-secondary mb-2">
            Enviamos um link de confirmacao para <strong className="text-text-primary">{email}</strong>
          </p>
          <p className="text-xs text-text-muted mb-8 leading-relaxed">
            Verifique sua caixa de entrada e spam. Clique no link para ativar sua conta e comecar a usar o INVENTOY.
          </p>
          <Button variant="outline" onClick={() => router.push("/login")}>
            Ir para o login <ArrowRight className="h-4 w-4" />
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-bg-primary flex">
      <div className="hidden lg:flex flex-1 bg-bg-secondary border-r border-border-default items-center justify-center p-12 relative overflow-hidden">
        <div className="absolute inset-0 opacity-[0.03] pointer-events-none"
          style={{ backgroundImage: "linear-gradient(rgba(62,207,142,1) 1px, transparent 1px), linear-gradient(90deg, rgba(62,207,142,1) 1px, transparent 1px)", backgroundSize: "32px 32px" }}
        />
        <div className="absolute top-1/3 -right-32 w-96 h-96 rounded-full bg-brand-5 blur-3xl pointer-events-none" />
        <div className="absolute bottom-1/4 -left-32 w-80 h-80 rounded-full bg-brand-3 blur-3xl pointer-events-none" />

        <div className="relative text-center max-w-md">
          <div className="w-20 h-20 rounded-2xl bg-brand-8 flex items-center justify-center mx-auto mb-8">
            <Zap className="h-10 w-10 text-brand" />
          </div>
          <h2 className="text-2xl font-semibold text-text-primary tracking-tight mb-4">
            Comece gratis, cresca quando quiser
          </h2>
          <p className="text-text-secondary leading-relaxed mb-8">
            14 dias de teste gratis. Sem cartao de credito. Cancele quando quiser.
          </p>
          <div className="grid grid-cols-3 gap-4">
            {[
              { icon: Package, label: "Teste Gratis", value: "14 dias" },
              { icon: BarChart3, label: "Produtos", value: "Ate 100" },
              { icon: Shield, label: "Sem riscos", value: "Cancele ja" },
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

      <div className="flex-1 flex flex-col items-center justify-center p-6 lg:p-12 relative">
        <div className="absolute inset-0 opacity-[0.03] pointer-events-none"
          style={{ backgroundImage: "linear-gradient(rgba(62,207,142,1) 1px, transparent 1px), linear-gradient(90deg, rgba(62,207,142,1) 1px, transparent 1px)", backgroundSize: "48px 48px" }}
        />

        <div className={`relative w-full max-w-sm transition-all duration-500 ${mounted ? "translate-y-0 opacity-100" : "translate-y-4 opacity-0"}`}>
          <div className="flex flex-col items-center mb-8">
            <Link href="/" className="group flex items-center justify-center w-14 h-14 rounded-xl bg-brand-8 mb-4 hover:bg-brand-12 transition-all duration-300 hover:shadow-[0_0_30px_rgba(62,207,142,0.1)]" aria-label="Voltar para pagina inicial">
              <Box className="h-7 w-7 text-brand transition-transform duration-300 group-hover:scale-110" />
            </Link>
            <h1 className="text-xl font-semibold text-text-primary tracking-tight">Criar Conta</h1>
            <p className="text-sm text-text-muted mt-1">Comece seu teste gratis - sem cartao de credito</p>
          </div>

          <form onSubmit={handleRegister} className="space-y-4">
            <div>
              <Label htmlFor="reg-name">Nome completo</Label>
              <Input id="reg-name" placeholder="Seu nome" value={name} onChange={(e) => setName(e.target.value)} required icon={<User className="h-4 w-4" />} />
            </div>
            <div>
              <Label htmlFor="reg-company">Nome da empresa</Label>
              <Input id="reg-company" placeholder="Minha Empresa Ltda" value={companyName} onChange={(e) => setCompanyName(e.target.value)} required icon={<Building2 className="h-4 w-4" />} />
            </div>
            <div>
              <Label htmlFor="reg-email">Email</Label>
              <Input id="reg-email" type="email" placeholder="voce@empresa.com" value={email} onChange={(e) => setEmail(e.target.value)} required icon={<Mail className="h-4 w-4" />} />
            </div>
            <div>
              <Label htmlFor="reg-password">Senha</Label>
              <div className="relative">
                <Input id="reg-password" type={showPassword ? "text" : "password"} placeholder="Minimo 6 caracteres" value={password} onChange={(e) => setPassword(e.target.value)} required minLength={6} icon={<Lock className="h-4 w-4" />} />
                <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-text-muted hover:text-text-primary transition-colors p-0.5" aria-label={showPassword ? "Ocultar senha" : "Mostrar senha"} tabIndex={-1}>
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
              <p className="text-[10px] text-text-muted mt-1">Deve ter no minimo 6 caracteres</p>
            </div>

            <p className="text-[11px] text-text-muted leading-relaxed">
              Ao criar sua conta, voce aceita nossos{" "}
              <Link href="/termos" className="text-brand hover:underline">Termos de Servico</Link> e{" "}
              <Link href="/privacidade" className="text-brand hover:underline">Politica de Privacidade</Link>.
            </p>

            {error && (<div className="text-sm p-3 rounded-[4px] border border-brand-danger-20 bg-brand-danger-dim text-brand-danger" role="alert">{error}</div>)}

            <Button type="submit" className="w-full h-11" loading={loading}>{loading ? "Criando conta..." : "Criar Conta Gratis"}</Button>

            <div className="text-center">
              <span className="text-sm text-text-muted">Ja tem conta? </span>
              <Link href="/login" className="text-sm text-brand hover:text-brand-hover transition-colors font-medium">Fazer login</Link>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
