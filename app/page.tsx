"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Box, BarChart3, Package, ScanLine, CreditCard, Shield, ArrowRight, Check, Menu, X, Barcode, Users, Cloud, Zap } from "lucide-react";
import Link from "next/link";

const features = [
  {
    icon: Package,
    title: "Controle de Estoque",
    desc: "Rastreamento em tempo real com suporte a múltiplos depósitos. Saiba exatamente o que você tem e onde está.",
  },
  {
    icon: ScanLine,
    title: "Leitor de Código de Barras",
    desc: "Scanner mobile nativo. Receba, transfira e faça contagem de estoque direto do chão de fábrica.",
  },
  {
    icon: BarChart3,
    title: "Analytics e Relatórios",
    desc: "Dashboard completo com gráficos de movimentação, alertas de estoque baixo, valuation e relatórios exportáveis.",
  },
  {
    icon: Users,
    title: "Controle por Papéis",
    desc: "Administradores, gerentes e operadores com permissões granulares. Cada um vê apenas o que precisa.",
  },
  {
    icon: CreditCard,
    title: "Assinatura Mensal",
    desc: "Planos a partir de R$ 49/mês com pagamento via PIX, Boleto ou Cartão. Sem taxa de setup. Cancele quando quiser.",
  },
  {
    icon: Cloud,
    title: "API REST Integrada",
    desc: "Integre com seu ERP ou sistemas internos via API /api/v1. Disponível nos planos Starter e Pro.",
  },
];

const plans = [
  {
    name: "Free",
    price: "R$ 0",
    period: "/mês",
    desc: "Para pequenas equipes começando",
    features: ["Até 30 produtos", "1 usuário", "Dashboard básico", "Entradas manuais"],
    cta: "Começar Grátis",
    highlighted: false,
  },
  {
    name: "Starter",
    price: "R$ 49",
    period: "/mês",
    desc: "Para negócios em crescimento",
    features: [
      "Até 500 produtos",
      "3 usuários",
      "Analytics avançado",
      "Scanner de código",
      "Exportação CSV",
      "Suporte por email",
    ],
    cta: "Testar Grátis",
    highlighted: true,
  },
  {
    name: "Pro",
    price: "R$ 149",
    period: "/mês",
    desc: "Para operações em escala",
    features: [
      "Até 3.000 produtos",
      "10 usuários",
      "API REST externa (/api/v1)",
      "Scanner de código",
      "Relatórios customizados",
      "Exportação CSV",
      "Suporte prioritário 24h",
      "Múltiplos depósitos",
    ],
    cta: "Testar Grátis",
    highlighted: false,
  },
  {
    name: "Enterprise",
    price: "Sob consulta",
    period: "",
    desc: "Para grandes operações",
    features: [
      "Produtos ilimitados",
      "Usuários ilimitados",
      "API REST externa (/api/v1)",
      "Scanner de código",
      "Relatórios customizados",
      "Exportação CSV",
      "Múltiplos depósitos",
      "Suporte prioritário 24h",
      "Onboarding dedicado",
      "SLA personalizado",
    ],
    cta: "Falar com Vendas",
    highlighted: false,
  },
];

export default function LandingPage() {
  const router = useRouter();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <div className="min-h-screen bg-bg-primary">
      {/* Navbar */}
      <header className={`fixed top-0 left-0 right-0 z-50 transition-all duration-200 ${
        scrolled ? "bg-bg-primary/90 backdrop-blur-md border-b border-border-default" : "bg-transparent"
      }`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-md bg-brand/10 flex items-center justify-center">
                <Box className="h-5 w-5 text-brand" />
              </div>
              <span className="text-lg font-semibold text-text-primary tracking-tight">INVENTOY</span>
            </div>

            <nav className="hidden md:flex items-center gap-8">
              <a href="#features" className="text-sm text-text-secondary hover:text-text-primary transition-colors">Recursos</a>
              <a href="#pricing" className="text-sm text-text-secondary hover:text-text-primary transition-colors">Preços</a>
              <div className="flex items-center gap-3">
                <Button variant="ghost" size="sm" onClick={() => router.push("/login")}>Entrar</Button>
                <Button size="sm" onClick={() => router.push("/register")}>
                  Começar
                  <ArrowRight className="h-3.5 w-3.5" />
                </Button>
              </div>
            </nav>

            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 text-text-muted hover:text-text-primary"
            >
              {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
          </div>
        </div>

        {mobileMenuOpen && (
          <div className="md:hidden border-t border-border-default bg-bg-secondary">
            <div className="px-4 py-4 space-y-3">
              <a href="#features" className="block text-sm text-text-secondary py-2" onClick={() => setMobileMenuOpen(false)}>Recursos</a>
              <a href="#pricing" className="block text-sm text-text-secondary py-2" onClick={() => setMobileMenuOpen(false)}>Preços</a>
              <div className="flex flex-col gap-2 pt-2">
                <Button variant="ghost" onClick={() => router.push("/login")}>Entrar</Button>
                <Button onClick={() => router.push("/register")}>Começar</Button>
              </div>
            </div>
          </div>
        )}
      </header>

      {/* Hero */}
      <section className="relative pt-32 pb-20 sm:pt-40 sm:pb-28 px-4">
        <div className="absolute inset-0 bg-[linear-gradient(rgba(62,207,142,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(62,207,142,0.03)_1px,transparent_1px)] bg-[size:64px_64px] pointer-events-none" />

        <div className="relative max-w-4xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-brand/20 bg-brand/[0.06] mb-6">
            <span className="w-1.5 h-1.5 rounded-full bg-brand animate-pulse" />
            <span className="text-xs font-mono text-brand tracking-wide">Feito no Brasil 🇧🇷</span>
          </div>

          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-semibold tracking-tight text-text-primary leading-[1.1]">
            Gestão de Estoque
            <br />
            <span className="text-brand">Inteligente</span>
          </h1>

          <p className="mt-6 text-lg sm:text-xl text-text-secondary max-w-2xl mx-auto leading-relaxed">
            Controle seu inventário em tempo real. Do almoxarifado ao boardroom —
            ferramentas para cada papel na sua empresa.
          </p>

          <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
            <Button size="lg" onClick={() => router.push("/register")}>
              Testar Grátis
              <ArrowRight className="h-4 w-4" />
            </Button>
            <Button variant="outline" size="lg" onClick={() => router.push("/login")}>
              Entrar
            </Button>
          </div>

          <div className="mt-12 flex items-center justify-center gap-6 sm:gap-10 text-sm text-text-muted">
            <div className="flex items-center gap-2">
              <Check className="h-4 w-4 text-brand" />
              <span>Sem cartão de crédito</span>
            </div>
            <div className="flex items-center gap-2">
              <Check className="h-4 w-4 text-brand" />
              <span>14 dias de teste grátis</span>
            </div>
            <div className="flex items-center gap-2">
              <Check className="h-4 w-4 text-brand" />
              <span>Cancele quando quiser</span>
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="py-20 sm:py-28 px-4 border-t border-border-default">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-semibold text-text-primary tracking-tight">
              Tudo que você precisa para
              <br />
              <span className="text-brand">gerenciar seu estoque</span>
            </h2>
            <p className="mt-4 text-text-secondary max-w-xl mx-auto">
              Do almoxarifado à diretoria — ferramentas para cada área da sua empresa.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {features.map((feature) => (
              <div
                key={feature.title}
                className="group p-6 rounded-lg border border-border-default bg-bg-surface hover:border-brand/20 transition-all duration-300"
              >
                <div className="w-10 h-10 rounded-md bg-brand/[0.08] flex items-center justify-center mb-4 group-hover:bg-brand/[0.12] transition-colors">
                  <feature.icon className="h-5 w-5 text-brand" />
                </div>
                <h3 className="text-base font-medium text-text-primary mb-2">{feature.title}</h3>
                <p className="text-sm text-text-secondary leading-relaxed">{feature.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section id="pricing" className="py-20 sm:py-28 px-4 border-t border-border-default">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-semibold text-text-primary tracking-tight">
              Preços simples e transparentes
            </h2>
            <p className="mt-4 text-text-secondary max-w-xl mx-auto">
              Comece grátis, upgrade conforme crescer. Pagamento via PIX, Boleto ou Cartão.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {plans.map((plan) => (
              <div
                key={plan.name}
                className={`relative p-6 rounded-lg border transition-all duration-300 ${
                  plan.highlighted
                    ? "border-brand bg-brand/[0.03]"
                    : "border-border-default bg-bg-surface hover:border-[#444]"
                }`}
              >
                {plan.highlighted && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-0.5 rounded-full bg-brand text-black text-xs font-medium">
                    Mais Popular
                  </div>
                )}

                <h3 className="text-lg font-medium text-text-primary mb-1">{plan.name}</h3>
                <p className="text-sm text-text-muted mb-4">{plan.desc}</p>

                <div className="mb-6">
                  <span className="text-3xl font-semibold text-text-primary font-mono">{plan.price}</span>
                  {plan.period && <span className="text-sm text-text-muted ml-1">{plan.period}</span>}
                </div>

                <ul className="space-y-2.5 mb-6">
                  {plan.features.map((f) => (
                    <li key={f} className="flex items-start gap-2 text-sm text-text-secondary">
                      <Check className="h-4 w-4 text-brand shrink-0 mt-0.5" />
                      {f}
                    </li>
                  ))}
                </ul>

                <Button
                  variant={plan.highlighted ? "primary" : "outline"}
                  className="w-full"
                  onClick={() =>
                    plan.name === "Enterprise"
                      ? (window.location.href = "mailto:contato@invetoy.com.br?subject=Plano%20Enterprise")
                      : router.push("/register")
                  }
                >
                  {plan.cta}
                </Button>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 px-4 border-t border-border-default">
        <div className="max-w-3xl mx-auto text-center">
          <div className="p-8 sm:p-12 rounded-xl border border-border-default bg-bg-surface relative overflow-hidden">
            <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-brand/50 to-transparent" />

            <h2 className="text-3xl sm:text-4xl font-semibold text-text-primary tracking-tight mb-4">
              Pronto para transformar sua
              <br />
              <span className="text-brand">gestão de estoque?</span>
            </h2>
            <p className="text-text-secondary mb-8 max-w-lg mx-auto">
              Junte-se a centenas de empresas que já usam o INVENTOY para controlar seu inventário.
            </p>
            <Button size="lg" onClick={() => router.push("/register")}>
              Testar Grátis
              <ArrowRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border-default py-8 px-4">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <Box className="h-4 w-4 text-brand" />
            <span className="text-sm text-text-muted">INVENTOY © 2026 — Feito no Brasil 🇧🇷</span>
          </div>
          <div className="flex items-center gap-6">
            <Link href="/termos" className="text-xs text-text-muted hover:text-text-primary transition-colors">Termos</Link>
            <Link href="/privacidade" className="text-xs text-text-muted hover:text-text-primary transition-colors">Privacidade</Link>
            <Link href="/register" className="text-xs text-text-muted hover:text-text-primary transition-colors">Cadastro</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
