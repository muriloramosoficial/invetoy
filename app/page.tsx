"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Box, BarChart3, Package, ScanLine, CreditCard, Shield, ArrowRight, Check, Menu, X, Users, Cloud, ChevronDown, Star, TrendingUp, Globe, Lock, Activity, Award, Sparkles, Layers, RefreshCw, HeadphonesIcon, BookOpen } from "lucide-react";
import Link from "next/link";

interface StatItem {
  value: number;
  suffix: string;
  label: string;
}

function useCountUp(end: number, duration: number = 2000): number {
  const [count, setCount] = useState(0);
  const started = useRef(false);

  useEffect(() => {
    if (started.current) return;
    started.current = true;
    const startTime = Date.now();
    const animate = () => {
      const elapsed = Date.now() - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setCount(Math.floor(eased * end));
      if (progress < 1) requestAnimationFrame(animate);
    };
    requestAnimationFrame(animate);
  }, [end, duration]);

  return count;
}

function StatCard({ value, suffix, label }: StatItem) {
  const count = useCountUp(value);

  return (
    <div className="text-center p-6 rounded-lg border border-border-default bg-bg-surface">
      <p className="text-3xl sm:text-4xl font-bold text-brand font-mono tracking-tight">
        {count.toLocaleString()}{suffix}
      </p>
      <p className="text-sm text-text-muted mt-1">{label}</p>
    </div>
  );
}

function FeatureCard({ icon: Icon, title, desc, gradient = false }: { icon: React.ElementType; title: string; desc: string; gradient?: boolean }) {
  return (
    <div className={`group p-6 rounded-lg border transition-all duration-300 ${
      gradient
        ? "border-brand-20 bg-gradient-to-br from-brand/[0.03] to-transparent hover:border-brand-40"
        : "border-border-default bg-bg-surface hover:border-brand-20"
    }`}>
      <div className="w-10 h-10 rounded-md bg-brand-8 flex items-center justify-center mb-4 group-hover:bg-brand-12 group-hover:scale-110 transition-all duration-300">
        <Icon className="h-5 w-5 text-brand" />
      </div>
      <h3 className="text-base font-medium text-text-primary mb-2">{title}</h3>
      <p className="text-sm text-text-secondary leading-relaxed">{desc}</p>
    </div>
  );
}

function PricingCard({ name, price, period, desc, features, cta, highlighted, onCta }: {
  name: string; price: string; period: string; desc: string;
  features: string[]; cta: string; highlighted: boolean;
  onCta: () => void;
}) {
  return (
    <div className={`relative p-6 rounded-lg border transition-all duration-300 ${
      highlighted
        ? "border-brand bg-brand-3 scale-[1.02] shadow-[0_0_40px_rgba(62,207,142,0.08)]"
        : "border-border-default bg-bg-surface hover:border-[#444]"
    }`}>
      {highlighted && (
        <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-0.5 rounded-full bg-brand text-black text-xs font-medium flex items-center gap-1">
          <Award className="h-3 w-3" />
          Mais Popular
        </div>
      )}
      <h3 className="text-lg font-medium text-text-primary mb-1">{name}</h3>
      <p className="text-sm text-text-muted mb-4">{desc}</p>
      <div className="mb-6">
        <span className="text-3xl font-semibold text-text-primary font-mono">{price}</span>
        {period && <span className="text-sm text-text-muted ml-1">{period}</span>}
      </div>
      <ul className="space-y-2.5 mb-6">
        {features.map((f) => (
          <li key={f} className="flex items-start gap-2 text-sm text-text-secondary">
            <Check className="h-4 w-4 text-brand shrink-0 mt-0.5" />
            {f}
          </li>
        ))}
      </ul>
      <Button variant={highlighted ? "primary" : "outline"} className="w-full" onClick={onCta}>
        {cta}
      </Button>
    </div>
  );
}

const features = [
  { icon: Package, title: "Controle de Estoque", desc: "Rastreamento em tempo real com suporte a múltiplos depósitos. Saiba exatamente o que você tem e onde está, com alertas inteligentes de estoque baixo.", gradient: true },
  { icon: ScanLine, title: "Leitor de Código de Barras", desc: "Scanner mobile nativo com câmera. Receba, transfira e faça contagem de estoque direto do chão de fábrica, sem equipamentos extras." },
  { icon: BarChart3, title: "Analytics e Relatórios", desc: "Dashboard completo com gráficos de movimentação, alertas de estoque baixo, valuation em tempo real e relatórios exportáveis em CSV." },
  { icon: Users, title: "Controle por Papéis", desc: "Administradores, gerentes e operadores com permissões granulares. Cada usuário vê exatamente o que precisa para seu trabalho." },
  { icon: CreditCard, title: "Assinatura Mensal Flexível", desc: "Planos a partir de R$ 49/mês com pagamento via PIX, Boleto ou Cartão. Sem taxa de setup. Cancele quando quiser, sem multas.", gradient: true },
  { icon: Cloud, title: "API REST Integrada", desc: "Integre com seu ERP, site ou sistemas internos via API REST /api/v1. Documentação interativa disponível nos planos Starter e Pro." },
  { icon: Shield, title: "Segurança Empresarial", desc: "Dados criptografados em trânsito e em repouso. Todas as politicas de acesso sao gerenciadas diretamente pelo banco de dados, com isolamento total entre empresas (multi-tenancy)." },
  { icon: Layers, title: "Múltiplos Depósitos", desc: "Organize seu estoque por filiais, almoxarifados, prateleiras e lotes. Controle granular de localização de cada item." },
  { icon: RefreshCw, title: "Tempo Real", desc: "Atualizações instantâneas via Supabase Realtime. Múltiplos usuários veem as mesmas informações simultaneamente, sem refresh." },
];

const plans = [
  { name: "Free", price: "R$ 0", period: "/mês", desc: "Para pequenas equipes começando", features: ["Até 30 produtos", "1 usuário", "Dashboard básico", "Entradas manuais", "Suporte por email"], cta: "Começar Grátis", highlighted: false },
  { name: "Starter", price: "R$ 49", period: "/mês", desc: "Para negócios em crescimento", features: ["Até 500 produtos", "3 usuários", "Analytics avançado", "Scanner de código", "Exportação CSV", "API REST externa", "Suporte por email"], cta: "Testar Grátis", highlighted: true },
  { name: "Pro", price: "R$ 149", period: "/mês", desc: "Para operações em escala", features: ["Até 3.000 produtos", "10 usuários", "API REST externa", "Scanner de código", "Relatórios customizados", "Exportação CSV", "Múltiplos depósitos", "Suporte prioritário 24h"], cta: "Testar Grátis", highlighted: false },
  { name: "Enterprise", price: "Sob consulta", period: "", desc: "Para grandes operações", features: ["Produtos ilimitados", "Usuários ilimitados", "API REST externa", "Scanner de código", "Relatórios customizados", "Múltiplos depósitos", "Onboarding dedicado", "SLA personalizado"], cta: "Falar com Vendas", highlighted: false },
];

const testimonials = [
  { quote: "O INVENTOY transformou nossa gestão de estoque. Reduzimos perdas em 40% no primeiro mês.", author: "Carlos Silva", role: "CEO, LogTech Transportes", stars: 5 },
  { quote: "A API REST foi fundamental para integrar com nosso ERP. A documentação é clara e completa.", author: "Ana Oliveira", role: "CTO, StockPlus Ltda", stars: 5 },
  { quote: "Testei vários sistemas, mas o INVENTOY é o único que oferece scanner nativo sem custo extra.", author: "Ricardo Mendes", role: "Gerente de Operações, Distribuidora ABC", stars: 5 },
];

const faqItems = [
  { q: "Precisa de cartão de crédito para testar?", a: "Não! São 14 dias de teste grátis sem cartão de crédito. Cancele quando quiser." },
  { q: "Posso migrar meus dados de outro sistema?", a: "Sim! Oferecemos suporte na migração via CSV. Nossa equipe ajuda com a importação dos seus produtos e inventário." },
  { q: "O scanner de código de barras funciona em qualquer celular?", a: "Sim. O scanner usa a câmera do celular e funciona em qualquer dispositivo com navegador moderno (Chrome, Safari, Edge)." },
  { q: "Como funciona a segurança dos meus dados?", a: "Cada empresa tem isolamento total de dados. Criptografia em transito (TLS 1.3) e em repouso (AES-256)." },
  { q: "Posso cancelar minha assinatura a qualquer momento?", a: "Sim! Não temos fidelidade. Você pode cancelar sua assinatura no painel de configurações. O acesso continua até o fim do período já pago." },
  { q: "A API tem limite de requisições?", a: "Sim, para garantir estabilidade para todos os clientes. O plano Starter tem 60 req/min e o Pro tem 120 req/min." },
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
        scrolled ? "bg-bg-primary-90 backdrop-blur-md border-b border-border-default" : "bg-transparent"
      }`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <Link href="/" className="flex items-center gap-2.5 group">
              <div className="w-8 h-8 rounded-md bg-brand-10 flex items-center justify-center group-hover:bg-brand-15 transition-colors">
                <Box className="h-5 w-5 text-brand" />
              </div>
              <span className="text-lg font-semibold text-text-primary tracking-tight">INVENTOY</span>
            </Link>

            <nav className="hidden md:flex items-center gap-8">
              <a href="#features" className="text-sm text-text-secondary hover:text-text-primary transition-colors">Recursos</a>
              <a href="#pricing" className="text-sm text-text-secondary hover:text-text-primary transition-colors">Preços</a>
              <a href="#faq" className="text-sm text-text-secondary hover:text-text-primary transition-colors">FAQ</a>
              <div className="flex items-center gap-3">
                <Button variant="ghost" size="sm" onClick={() => router.push("/login")}>Entrar</Button>
                <Button size="sm" onClick={() => router.push("/register")}>
                  Começar
                  <ArrowRight className="h-3.5 w-3.5" />
                </Button>
              </div>
            </nav>

            <button onClick={() => setMobileMenuOpen(!mobileMenuOpen)} className="md:hidden p-2 text-text-muted hover:text-text-primary">
              {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
          </div>
        </div>

        {mobileMenuOpen && (
          <div className="md:hidden border-t border-border-default bg-bg-secondary">
            <div className="px-4 py-4 space-y-3">
              <a href="#features" className="block text-sm text-text-secondary py-2" onClick={() => setMobileMenuOpen(false)}>Recursos</a>
              <a href="#pricing" className="block text-sm text-text-secondary py-2" onClick={() => setMobileMenuOpen(false)}>Preços</a>
              <a href="#faq" className="block text-sm text-text-secondary py-2" onClick={() => setMobileMenuOpen(false)}>FAQ</a>
              <div className="flex flex-col gap-2 pt-2">
                <Button variant="ghost" onClick={() => router.push("/login")}>Entrar</Button>
                <Button onClick={() => router.push("/register")}>Começar Grátis</Button>
              </div>
            </div>
          </div>
        )}
      </header>

      {/* Hero */}
      <section className="relative pt-32 pb-20 sm:pt-40 sm:pb-28 px-4 overflow-hidden">
        <div className="absolute inset-0 bg-[linear-gradient(rgba(62,207,142,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(62,207,142,0.03)_1px,transparent_1px)] bg-[size:64px_64px] pointer-events-none" />
        <div className="absolute top-20 -left-40 w-80 h-80 rounded-full bg-brand-3 blur-3xl pointer-events-none" />
        <div className="absolute bottom-20 -right-40 w-96 h-96 rounded-full bg-brand-2 blur-3xl pointer-events-none" />

        <div className="relative max-w-4xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-brand-20 bg-brand-6 mb-6 animate-fade-in">
            <span className="w-1.5 h-1.5 rounded-full bg-brand animate-pulse" />
            <span className="text-xs font-mono text-brand tracking-wide">Feito no Brasil 🇧🇷</span>
          </div>

          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-semibold tracking-tight text-text-primary leading-[1.1]">
            Gestão de Estoque
            <br />
            <span className="text-brand">que sua empresa merece</span>
          </h1>

          <p className="mt-6 text-lg sm:text-xl text-text-secondary max-w-2xl mx-auto leading-relaxed">
            Do almoxarifado a diretoria - uma plataforma completa para 
            controlar, analisar e otimizar seu estoque em tempo real.
          </p>

          <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
            <Button size="lg" onClick={() => router.push("/register")}>
              Testar Grátis por 14 Dias
              <ArrowRight className="h-4 w-4" />
            </Button>
            <Button variant="outline" size="lg" onClick={() => router.push("/login")}>
              Ver Demo
            </Button>
          </div>

          <div className="mt-12 flex flex-wrap items-center justify-center gap-6 sm:gap-10 text-sm text-text-muted">
            <div className="flex items-center gap-2">
              <Check className="h-4 w-4 text-brand" />
              <span>Sem cartão de crédito</span>
            </div>
            <div className="flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-brand" />
              <span>14 dias de teste grátis</span>
            </div>
            <div className="flex items-center gap-2">
              <Shield className="h-4 w-4 text-brand" />
              <span>Cancele quando quiser</span>
            </div>
            <div className="flex items-center gap-2">
              <Globe className="h-4 w-4 text-brand" />
              <span>Feito no Brasil</span>
            </div>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="py-12 px-4 border-t border-border-default">
        <div className="max-w-5xl mx-auto">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <StatCard value={300} suffix="+" label="Empresas Ativas" />
            <StatCard value={50000} suffix="+" label="Produtos Gerenciados" />
            <StatCard value={99.9} suffix="%" label="Uptime" />
            <StatCard value={15} suffix="min" label="Tempo de Setup" />
          </div>
        </div>
      </section>

      {/* Trust Signals */}
      <section className="py-8 px-4">
        <div className="max-w-6xl mx-auto text-center">
          <p className="text-xs text-text-muted uppercase tracking-widest mb-6">Construído com tecnologia enterprise-grade</p>
          <div className="flex flex-wrap items-center justify-center gap-8 text-text-muted">
            <span className="flex items-center gap-2 text-sm"><Shield className="h-4 w-4 text-brand" /> RLS Nativo</span>
            <span className="flex items-center gap-2 text-sm"><Lock className="h-4 w-4 text-brand" /> TLS 1.3</span>
            <span className="flex items-center gap-2 text-sm"><Activity className="h-4 w-4 text-brand" /> 99.9% Uptime</span>
            <span className="flex items-center gap-2 text-sm"><Cloud className="h-4 w-4 text-brand" /> Next.js 16</span>
            <span className="flex items-center gap-2 text-sm"><RefreshCw className="h-4 w-4 text-brand" /> Tempo Real</span>
          </div>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="py-20 sm:py-28 px-4 border-t border-border-default">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <TechBadge variant="green" className="mb-4">Funcionalidades</TechBadge>
            <h2 className="text-3xl sm:text-4xl font-semibold text-text-primary tracking-tight">
              Tudo que você precisa para
              <br />
              <span className="text-brand">gerenciar seu estoque</span>
            </h2>
            <p className="mt-4 text-text-secondary max-w-xl mx-auto">
              Do almoxarifado a diretoria - ferramentas para cada area da sua empresa, 
              com dados em tempo real e seguranca enterprise.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {features.map((feature) => (
              <FeatureCard key={feature.title} {...feature} />
            ))}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="py-20 sm:py-28 px-4 border-t border-border-default bg-bg-secondary-50">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-16">
            <TechBadge variant="blue" className="mb-4">Como Funciona</TechBadge>
            <h2 className="text-3xl sm:text-4xl font-semibold text-text-primary tracking-tight">
              Comece em <span className="text-brand">15 minutos</span>
            </h2>
            <p className="mt-4 text-text-secondary max-w-xl mx-auto">
              Sem burocracia. Crie sua conta, cadastre seus produtos e comece a gerenciar.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              { step: "01", icon: Users, title: "Crie sua conta", desc: "Cadastre-se grátis, sem cartão de crédito. Configure sua empresa e convide sua equipe." },
              { step: "02", icon: Package, title: "Cadastre produtos", desc: "Adicione produtos manualmente, importe via CSV ou use o scanner de código de barras." },
              { step: "03", icon: TrendingUp, title: "Gerencie em tempo real", desc: "Acompanhe movimentações, receba alertas de estoque baixo e gere relatórios." },
            ].map((item) => (
              <div key={item.step} className="relative p-6 rounded-lg border border-border-default bg-bg-surface">
                <span className="text-5xl font-bold text-brand-8 absolute top-3 right-4 select-none">{item.step}</span>
                <div className="w-10 h-10 rounded-md bg-brand-8 flex items-center justify-center mb-4">
                  <item.icon className="h-5 w-5 text-brand" />
                </div>
                <h3 className="text-base font-medium text-text-primary mb-2">{item.title}</h3>
                <p className="text-sm text-text-secondary leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-20 sm:py-28 px-4 border-t border-border-default">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-16">
            <TechBadge variant="yellow" className="mb-4">Depoimentos</TechBadge>
            <h2 className="text-3xl sm:text-4xl font-semibold text-text-primary tracking-tight">
              Quem usa, <span className="text-brand">recomenda</span>
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {testimonials.map((t) => (
              <div key={t.author} className="p-6 rounded-lg border border-border-default bg-bg-surface">
                <div className="flex gap-0.5 mb-4">
                  {Array.from({ length: t.stars }).map((_, i) => (
                    <Star key={i} className="h-4 w-4 fill-brand text-brand" />
                  ))}
                </div>
                <p className="text-sm text-text-secondary leading-relaxed mb-4 italic">&ldquo;{t.quote}&rdquo;</p>
                <div>
                  <p className="text-sm font-medium text-text-primary">{t.author}</p>
                  <p className="text-xs text-text-muted">{t.role}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section id="pricing" className="py-20 sm:py-28 px-4 border-t border-border-default">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-16">
            <TechBadge variant="green" className="mb-4">Preços</TechBadge>
            <h2 className="text-3xl sm:text-4xl font-semibold text-text-primary tracking-tight">
              Preços simples e <span className="text-brand">transparentes</span>
            </h2>
            <p className="mt-4 text-text-secondary max-w-xl mx-auto">
              Comece grátis, upgrade conforme crescer. Pagamento via PIX, Boleto ou Cartão.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {plans.map((plan) => (
              <PricingCard
                key={plan.name}
                {...plan}
                onCta={() =>
                  plan.name === "Enterprise"
                    ? window.location.href = "mailto:contato@inventoy.com.br?subject=Plano%20Enterprise"
                    : router.push("/register")
                }
              />
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 px-4 border-t border-border-default">
        <div className="max-w-3xl mx-auto text-center">
          <div className="p-8 sm:p-12 rounded-xl border border-border-default bg-bg-surface relative overflow-hidden">
            <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-brand/50 to-transparent" />
            <div className="absolute -top-20 -right-20 w-40 h-40 rounded-full bg-brand-5 blur-3xl pointer-events-none" />
            <div className="absolute -bottom-20 -left-20 w-40 h-40 rounded-full bg-brand-3 blur-3xl pointer-events-none" />

            <Sparkles className="h-8 w-8 text-brand mx-auto mb-4" />
            <h2 className="text-3xl sm:text-4xl font-semibold text-text-primary tracking-tight mb-4">
              Pronto para transformar sua
              <br />
              <span className="text-brand">gestão de estoque?</span>
            </h2>
            <p className="text-text-secondary mb-8 max-w-lg mx-auto">
              Junte-se a centenas de empresas que já usam o INVENTOY para controlar seu inventário 
              em tempo real. Comece gratis - sem cartao de credito.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Button size="lg" onClick={() => router.push("/register")}>
                Testar Grátis por 14 Dias
                <ArrowRight className="h-4 w-4" />
              </Button>
              <Button variant="outline" size="lg" onClick={() => router.push("/login")}>
                Ver Demo
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section id="faq" className="py-20 sm:py-28 px-4 border-t border-border-default">
        <div className="max-w-3xl mx-auto">
          <div className="text-center mb-12">
            <TechBadge variant="blue" className="mb-4">FAQ</TechBadge>
            <h2 className="text-3xl sm:text-4xl font-semibold text-text-primary tracking-tight">
              Perguntas <span className="text-brand">Frequentes</span>
            </h2>
          </div>

          <div className="space-y-2">
            {faqItems.map((item) => (
              <details key={item.q} className="group border border-border-default rounded-lg overflow-hidden">
                <summary className="flex items-center justify-between p-4 cursor-pointer text-sm font-medium text-text-primary hover:bg-bg-surface-hover transition-colors select-none">
                  {item.q}
                  <ChevronDown className="h-4 w-4 text-text-muted group-open:rotate-180 transition-transform duration-200 shrink-0" />
                </summary>
                <div className="px-4 pb-4 text-sm text-text-secondary leading-relaxed border-t border-border-default pt-3">
                  {item.a}
                </div>
              </details>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border-default py-12 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-8">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <Box className="h-5 w-5 text-brand" />
                <span className="text-sm font-semibold text-text-primary">INVENTOY</span>
              </div>
              <p className="text-xs text-text-muted leading-relaxed">
                Gestão de Estoque Inteligente.<br />
                Feito no Brasil 🇧🇷
              </p>
            </div>
            <div>
              <h4 className="text-xs font-medium text-text-primary uppercase tracking-wider mb-3">Produto</h4>
              <div className="space-y-2">
                <a href="#features" className="block text-xs text-text-muted hover:text-text-primary transition-colors">Recursos</a>
                <a href="#pricing" className="block text-xs text-text-muted hover:text-text-primary transition-colors">Preços</a>
                <Link href="/settings/api" className="block text-xs text-text-muted hover:text-text-primary transition-colors">API</Link>
              </div>
            </div>
            <div>
              <h4 className="text-xs font-medium text-text-primary uppercase tracking-wider mb-3">Empresa</h4>
              <div className="space-y-2">
                <Link href="/termos" className="block text-xs text-text-muted hover:text-text-primary transition-colors">Termos de Serviço</Link>
                <Link href="/privacidade" className="block text-xs text-text-muted hover:text-text-primary transition-colors">Privacidade</Link>
                <a href="mailto:contato@inventoy.com.br" className="block text-xs text-text-muted hover:text-text-primary transition-colors">Contato</a>
              </div>
            </div>
            <div>
              <h4 className="text-xs font-medium text-text-primary uppercase tracking-wider mb-3">Suporte</h4>
              <div className="space-y-2">
                <a href="mailto:suporte@inventoy.com.br" className="flex items-center gap-2 text-xs text-text-muted hover:text-text-primary transition-colors">
                  <HeadphonesIcon className="h-3 w-3" /> suporte@inventoy.com.br
                </a>
                <Link href="/settings/api" className="flex items-center gap-2 text-xs text-text-muted hover:text-text-primary transition-colors">
                  <BookOpen className="h-3 w-3" /> Documentação da API
                </Link>
              </div>
            </div>
          </div>
          <div className="border-t border-border-default pt-8 flex flex-col sm:flex-row items-center justify-between gap-4">
            <span className="text-xs text-text-muted">© 2026 INVENTOY. Todos os direitos reservados.</span>
            <div className="flex items-center gap-4">
              <Link href="/termos" className="text-xs text-text-muted hover:text-text-primary transition-colors">Termos</Link>
              <Link href="/privacidade" className="text-xs text-text-muted hover:text-text-primary transition-colors">Privacidade</Link>
              <Link href="/register" className="text-xs text-text-muted hover:text-text-primary transition-colors">Cadastro</Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}

function TechBadge({ variant = "green", className = "", children }: { variant?: string; className?: string; children: React.ReactNode }) {
  const colors: Record<string, string> = {
    green: "bg-brand-8 text-brand border-brand-20",
    blue: "bg-brand-info-10 text-brand-info border-brand-info-20",
    yellow: "bg-brand-warning-10 text-brand-warning border-brand-warning-20",
  };
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-medium border ${colors[variant] || colors.green} ${className}`}>
      {children}
    </span>
  );
}
