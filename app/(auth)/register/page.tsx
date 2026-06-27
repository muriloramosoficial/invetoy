"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Box, Mail, Lock, Eye, EyeOff, User, Building2, CheckCircle } from "lucide-react";
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

  const validatePassword = (pass: string) => {
    if (pass.length < 6) return "A senha deve ter no mínimo 6 caracteres";
    return "";
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    // Client-side validation
    if (!name.trim() || !email.trim() || !password || !companyName.trim()) {
      setError("Preencha todos os campos");
      setLoading(false);
      return;
    }

    const pwError = validatePassword(password);
    if (pwError) {
      setError(pwError);
      setLoading(false);
      return;
    }

    try {
      const { createClient } = await import("@/lib/supabase/client");
      const supabase = createClient();

      const { error: signUpError } = await supabase.auth.signUp({
        email: email.trim(),
        password,
        options: {
          data: {
            name: name.trim(),
            tenant_name: companyName.trim(),
          },
          emailRedirectTo: `${window.location.origin}/callback`,
        },
      });

      if (signUpError) {
        if (signUpError.message.includes("already registered")) {
          setError("Este email já está cadastrado. Faça login.");
        } else {
          setError(signUpError.message);
        }
        return;
      }

      setSuccess(true);
    } catch (err) {
      setError("Erro de conexão. Verifique sua internet.");
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="min-h-screen bg-bg-primary flex items-center justify-center p-4">
        <div className="w-full max-w-sm text-center">
          <div className="flex items-center justify-center w-16 h-16 rounded-xl bg-brand/[0.08] mx-auto mb-6">
            <CheckCircle className="h-8 w-8 text-brand" />
          </div>
          <h1 className="text-2xl font-semibold text-text-primary tracking-tight mb-2">Conta criada!</h1>
          <p className="text-text-secondary mb-2">
           Enviamos um link de confirmação para <strong className="text-text-primary">{email}</strong>
          </p>
          <p className="text-sm text-text-muted mb-8">
            Verifique sua caixa de entrada e clique no link para ativar sua conta. Você será redirecionado para o login.
          </p>
          <Button variant="outline" onClick={() => router.push("/login")}>
            Ir para o login
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-bg-primary flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-sm">
        {/* Logo */}
        <div className="flex flex-col items-center mb-8">
          <Link href="/" className="flex items-center justify-center w-16 h-16 rounded-xl bg-brand/10 mb-4 hover:bg-brand/[0.15] transition-colors">
            <Box className="h-8 w-8 text-brand" />
          </Link>
          <h1 className="text-2xl font-semibold text-text-primary tracking-tight">Criar Conta</h1>
          <p className="text-sm text-text-muted mt-1">Comece seu teste grátis — sem cartão de crédito</p>
        </div>

        {/* Form */}
        <form onSubmit={handleRegister} className="space-y-4">
          <Input
            label="Nome completo"
            placeholder="Seu nome"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            icon={<User className="h-4 w-4" />}
          />

          <Input
            label="Nome da empresa"
            placeholder="Minha Empresa Ltda"
            value={companyName}
            onChange={(e) => setCompanyName(e.target.value)}
            required
            icon={<Building2 className="h-4 w-4" />}
          />

          <Input
            label="Email"
            type="email"
            placeholder="voce@empresa.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            icon={<Mail className="h-4 w-4" />}
          />

          <div className="relative">
            <Input
              label="Senha"
              type={showPassword ? "text" : "password"}
              placeholder="Mínimo 6 caracteres"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength={6}
              icon={<Lock className="h-4 w-4" />}
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-[34px] text-text-muted hover:text-text-primary transition-colors"
              tabIndex={-1}
            >
              {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          </div>

          <p className="text-xs text-text-muted">
            Ao criar sua conta, você aceita nossos{" "}
            <Link href="/termos" className="text-brand hover:underline">Termos de Serviço</Link> e{" "}
            <Link href="/privacidade" className="text-brand hover:underline">Política de Privacidade</Link>.
          </p>

          {error && (
            <div className="text-sm p-3 rounded-[4px] border border-brand-danger/20 bg-brand-danger-dim text-brand-danger">
              {error}
            </div>
          )}

          <Button type="submit" className="w-full h-11" loading={loading}>
            Criar Conta Grátis
          </Button>

          <div className="text-center pt-2">
            <span className="text-sm text-text-muted">Já tem conta? </span>
            <Link
              href="/login"
              className="text-sm text-brand hover:text-brand-hover transition-colors font-medium"
            >
              Fazer login
            </Link>
          </div>
        </form>

        {/* ASAAS badge */}
        <div className="mt-8 text-center">
          <p className="text-[10px] text-text-muted">
            Pagamentos processados por ASAAS • PIX, Boleto e Cartão
          </p>
        </div>
      </div>
    </div>
  );
}
