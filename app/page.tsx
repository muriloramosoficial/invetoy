"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Box, BarChart3, Package, ScanLine, CreditCard, Shield, ArrowRight, Check, Menu, X, Users, Cloud, ChevronDown, Star, TrendingUp, Globe, Lock, Activity, Award, Sparkles, Layers, RefreshCw, HeadphonesIcon, BookOpen } from "lucide-react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";

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
  { icon: Package, title: "Gestao de Patrimonio", desc: "Registre todos os bens da empresa com placa de patrimonio, marca, modelo, numero de serie e responsavel. Saiba onde cada item esta a qualquer momento.", gradient: true },
  { icon: ScanLine, title: "Leitor de Codigo de Barras", desc: "Scanner mobile nativo com camera. Identifique itens por placa ou codigo de barras direto do chao de fabrica, sem equipamentos extras." },
  { icon: BarChart3, title: "Relatorios e Auditoria", desc: "Dashboard completo com historico de movimentacoes, quem moveu cada item, quando e para onde. Relatorios exportaveis em CSV." },
  { icon: Users, title: "Controle por Papels", desc: "Administradores, gerentes e operadores com permissoes granulares. Cada usuario ve exatamente o que precisa para seu trabalho." },
  { icon: CreditCard, title: "Assinatura Mensal Flexivel", desc: "Planos a partir de R$ 49/mes com pagamento via PIX, Boleto ou Cartao. Sem taxa de setup. Cancele quando quiser, sem multas.", gradient: true },
  { icon: Cloud, title: "API REST Integrada", desc: "Integre com seu ERP, site ou sistemas internos via API REST. Documentacao interativa disponivel nos planos Starter e Pro." },
  { icon: Shield, title: "Seguranca Empresarial", desc: "Dados criptografados em transito e em repouso. Cada empresa tem isolamento total de dados, com controle granular de acessos." },
  { icon: Layers, title: "Multiplas Filiais", desc: "Organize o patrimonio por filiais, departamentos, salas e armazens. Controle granular de localizacao de cada bem." },
  { icon: RefreshCw, title: "Tempo Real", desc: "Atualizacoes instantaneas em todos os dispositivos. Multiplos usuarios veem as mesmas informacoes simultaneamente, sem refresh." },
];

const defaultPlans = [
  { name: "Free", price: "R$ 0", period: "/mês", desc: "Para pequenas equipes começando", features: ["Ate 30 itens", "1 usuario", "Dashboard basico", "Movimentacoes manuais", "Suporte por email"], cta: "Comecar Gratis", highlighted: false },
  { name: "Starter", price: "R$ 49", period: "/mês", desc: "Para negocios em crescimento", features: ["Ate 500 itens", "3 usuarios", "Relatorios avancados", "Leitor de codigos", "Exportacao CSV", "API REST", "Suporte por email"], cta: "Testar Gratis", highlighted: true },
  { name: "Pro", price: "R$ 149", period: "/mês", desc: "Para operacoes em escala", features: ["Ate 3.000 itens", "10 usuarios", "API REST", "Leitor de codigos", "Relatorios customizados", "Exportacao CSV", "Multiplas filiais", "Suporte prioritario 24h"], cta: "Testar Gratis", highlighted: false },
  { name: "Enterprise", price: "Sob consulta", period: "", desc: "Para grandes operacoes", features: ["Itens ilimitados", "Usuarios ilimitados", "API REST", "Leitor de codigos", "Relatorios customizados", "Multiplas filiais", "Onboarding dedicado", "SLA personalizado"], cta: "Falar com Vendas", highlighted: false },
];

const testimonials = [
  { quote: "O INVENTOY transformou nossa gestão de patrimonio. Reduzimos perdas em 40% no primeiro mês.", author: "Carlos Silva", role: "CEO, LogTech Transportes", stars: 5 },
  { quote: "A API REST foi fundamental para integrar com nosso ERP. A documentação é clara e completa.", author: "Ana Oliveira", role: "CTO, StockPlus Ltda", stars: 5 },
  { quote: "Testei vários sistemas, mas o INVENTOY é o único que oferece scanner nativo sem custo extra.", author: "Ricardo Mendes", role: "Gerente de Operações, Distribuidora ABC", stars: 5 },
];

const faqItems = [
  { q: "Precisa de cartao de credito para testar?", a: "Nao! Sao 14 dias de teste gratis sem cartao de credito. Cancele quando quiser." },
  { q: "Posso migrar meus dados de outro sistema?", a: "Sim! Oferecemos suporte na migracao via CSV. Nossa equipe ajuda com a importacao dos seus itens e inventario." },
  { q: "O leitor de codigos funciona em qualquer celular?", a: "Sim. O leitor usa a camera do celular e funciona em qualquer dispositivo com navegador moderno (Chrome, Safari, Edge)." },
  { q: "Como funciona a seguranca dos meus dados?", a: "Cada empresa tem isolamento total de dados. Criptografia em transito e em repouso." },
  { q: "Posso cancelar minha assinatura a qualquer momento?", a: "Sim! Nao temos fidelidade. Voce pode cancelar sua assinatura no painel de configuracoes. O acesso continua ate o fim do periodo ja pago." },
  { q: "A API tem limite de requisicoes?", a: "Sim, para garantir estabilidade para todos os clientes. O plano Starter tem 60 req/min e o Pro tem 120 req/min." },
];

export default function LandingPage() {
  const router = useRouter();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [plans, setPlans] = useState(defaultPlans);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    async function check() {
      const supabase = createClient();
      const { data } = await supabase.auth.getUser();
      setIsLoggedIn(!!data.user);
    }
    async function loadPlans() {
      try {
        const res = await fetch("/api/admin/plans");
        if (res.ok) {
          const data = await res.json();
          if (Array.isArray(data) && data.length > 0) {
            setPlans(data.map((p: any) => ({
              name: p.name,
              price: p.price,
              period: p.period,
              desc: p.description,
              features: p.features || [],
              cta: p.cta,
              highlighted: p.highlighted,
            })));
          }
        }
      } catch {}
    }
    check();
    loadPlans();
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
                {!isLoggedIn && (
                  <Button variant="ghost" size="sm" onClick={() => router.push("/login")}>Entrar</Button>
                )}
                <Button size="sm" onClick={() => router.push(isLoggedIn ? "/dashboard" : "/register")}>
                  {isLoggedIn ? "Dashboard" : "Começar"}
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
                {!isLoggedIn && (
                  <Button variant="ghost" onClick={() => router.push("/login")}>Entrar</Button>
                )}
                <Button onClick={() => router.push(isLoggedIn ? "/dashboard" : "/register")}>
                  {isLoggedIn ? "Dashboard" : "Começar Grátis"}
                </Button>
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
            Gestao de Patrimonio
            <br />
            <span className="text-brand">que sua empresa merece</span>
          </h1>

          <p className="mt-6 text-lg sm:text-xl text-text-secondary max-w-2xl mx-auto leading-relaxed">
            Do almoxarifado a diretoria - uma plataforma completa para 
            controlar, analisar e otimizar seu patrimonio em tempo real.
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
            <StatCard value={50000} suffix="+" label="Itens Gerenciados" />
            <StatCard value={99.9} suffix="%" label="Uptime" />
            <StatCard value={15} suffix="min" label="Tempo de Setup" />
          </div>
        </div>
      </section>

      {/* Trust Signals */}
      <section className="py-8 px-4">
        <div className="max-w-6xl mx-auto text-center">
          <div className="flex flex-wrap items-center justify-center gap-8 text-text-muted">
            <span className="flex items-center gap-2 text-sm"><Shield className="h-4 w-4 text-brand" /> Dados Protegidos</span>
            <span className="flex items-center gap-2 text-sm"><Lock className="h-4 w-4 text-brand" /> Criptografia Total</span>
            <span className="flex items-center gap-2 text-sm"><Activity className="h-4 w-4 text-brand" /> 99.9% Uptime</span>
            <span className="flex items-center gap-2 text-sm"><Cloud className="h-4 w-4 text-brand" /> Infraestrutura Cloud</span>
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
              <span className="text-brand">gerenciar seu patrimonio</span>
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
              { step: "01", icon: Users, title: "Crie sua conta", desc: "Cadastre-se gratis, sem cartao de credito. Configure sua empresa e convide sua equipe." },
              { step: "02", icon: Package, title: "Cadastre itens", desc: "Adicione itens manualmente, importe via CSV ou use o leitor de codigos de barras." },
              { step: "03", icon: TrendingUp, title: "Gerencie em tempo real", desc: "Acompanhe movimentacoes, receba alertas de itens desatualizados e gere relatorios." },
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
              <span className="text-brand">gestão de patrimonio?</span>
            </h2>
            <p className="text-text-secondary mb-8 max-w-lg mx-auto">
              Junte-se a centenas de empresas que ja usam o INVENTOY para controlar seu inventario 
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
                Gestão de Patrimonio Inteligente.<br />
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
