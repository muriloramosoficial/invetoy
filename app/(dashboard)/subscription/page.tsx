"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { TechBadge } from "@/components/tech-badge";
import { createClient } from "@/lib/supabase/client";
import { Check, QrCode, CreditCard, ChevronRight, Loader2, Crown, Zap, TrendingUp } from "lucide-react";
import Link from "next/link";

interface Plan {
  id: string;
  name: string;
  price: string;
  period: string;
  description: string;
  features: string[];
  highlighted: boolean;
  cta: string;
  limits: {
    products: number;
    users: number;
  };
}

const PLANS: Plan[] = [
  {
    id: "free",
    name: "Free",
    price: "R$ 0",
    period: "/mês",
    description: "Para pequenas equipes começando",
    features: ["Até 30 produtos", "1 usuário", "Dashboard básico", "Entradas manuais"],
    highlighted: false,
    cta: "Atual",
    limits: { products: 30, users: 1 },
  },
  {
    id: "starter",
    name: "Starter",
    price: "R$ 49",
    period: "/mês",
    description: "Para negócios em crescimento",
    features: [
      "Até 500 produtos",
      "3 usuários",
      "Analytics avançado",
      "Scanner de código",
      "API externa (/api/v1)",
      "Exportação CSV",
      "Suporte por email",
    ],
    highlighted: true,
    cta: "Assinar",
    limits: { products: 500, users: 3 },
  },
  {
    id: "pro",
    name: "Pro",
    price: "R$ 149",
    period: "/mês",
    description: "Para operações em escala",
    features: [
      "Até 3.000 produtos",
      "10 usuários",
      "API externa (/api/v1)",
      "Relatórios customizados",
      "Suporte prioritário 24h",
      "Múltiplos depósitos",
    ],
    highlighted: false,
    cta: "Assinar",
    limits: { products: 3000, users: 10 },
  },
];

interface TenantInfo {
  id: string;
  name: string;
  plan: string;
  subscription_status: string | null;
  created_at: string;
}

export default function SubscriptionPage() {
  const router = useRouter();
  const [tenant, setTenant] = useState<TenantInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function loadTenant() {
      try {
        const supabase = createClient();
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) { router.push("/login"); return; }

        const { data: profile } = await supabase
          .from("profiles")
          .select("tenant_id")
          .eq("id", user.id)
          .single();

        if (profile) {
          const { data: tenantData } = await supabase
            .from("tenants")
            .select("id, name, plan, subscription_status, created_at")
            .eq("id", profile.tenant_id)
            .single();
          if (tenantData) setTenant(tenantData);
        }
      } catch (err) {
        setError("Erro ao carregar dados da assinatura");
      } finally {
        setLoading(false);
      }
    }
    loadTenant();
  }, [router]);

  const currentPlanName = tenant?.plan || "free";
  const isOnTrial = tenant?.subscription_status === "trialing";
  const trialDaysLeft = tenant?.created_at
    ? Math.max(0, 14 - Math.floor((Date.now() - new Date(tenant.created_at).getTime()) / (1000 * 60 * 60 * 24)))
    : 0;

  const handlePlanSelect = (planId: string) => {
    if (planId === currentPlanName) return;
    if (tenant) {
      router.push(`/api/payments/asaas/checkout?plan=${planId}`);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="h-6 w-6 text-brand animate-spin" />
        <span className="ml-3 text-sm text-text-secondary">Carregando...</span>
      </div>
    );
  }

  return (
    <div className="space-y-8 max-w-5xl">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-semibold text-text-primary tracking-tight">Planos e Assinatura</h1>
        <p className="text-sm text-text-muted mt-1">
          Escolha o plano ideal para sua empresa. Cancele quando quiser.
        </p>
      </div>

      {/* Current Plan / Trial Banner */}
      {tenant && (
        <div className="p-4 sm:p-6 rounded-lg border border-brand/20 bg-brand/[0.03]">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 mb-1">
                {isOnTrial ? (
                  <Crown className="h-5 w-5 text-brand-warning" />
                ) : (
                  <Zap className="h-5 w-5 text-brand" />
                )}
                <p className="text-sm font-medium text-text-primary">
                  {isOnTrial ? "Período de Teste" : `Plano ${currentPlanName.charAt(0).toUpperCase() + currentPlanName.slice(1)}`}
                </p>
                <TechBadge variant={currentPlanName === "free" ? "gray" : "green"}>
                  {currentPlanName.toUpperCase()}
                </TechBadge>
              </div>
              {isOnTrial ? (
                <p className="text-sm text-text-secondary">
                  Seu período de teste termina em{" "}
                  <strong className="text-brand-warning">{trialDaysLeft} dias</strong>.
                  Escolha um plano para continuar usando todos os recursos.
                </p>
              ) : currentPlanName === "free" ? (
                <p className="text-sm text-text-secondary">
                  Seu plano atual tem limites de {PLANS.find(p => p.id === "free")?.limits.products} produtos. Faça upgrade para desbloquear mais recursos.
                </p>
              ) : (
                <p className="text-sm text-text-secondary">
                  Seu plano está ativo. Gerencie sua assinatura abaixo.
                </p>
              )}
            </div>
            {!isOnTrial && currentPlanName === "free" && (
              <Button size="sm" onClick={() => handlePlanSelect("starter")}>
                Fazer Upgrade
                <ChevronRight className="h-4 w-4" />
              </Button>
            )}
          </div>
        </div>
      )}

      {/* Error */}
      {error && (
        <div className="text-sm p-3 rounded-[4px] border border-brand-danger/20 bg-brand-danger-dim text-brand-danger" role="alert">
          {error}
        </div>
      )}

      {/* Plans Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {PLANS.map((plan) => {
          const isCurrent = plan.id === currentPlanName;
          const isDisabled = isCurrent;

          return (
            <div
              key={plan.id}
              className={`relative p-6 rounded-lg border transition-all duration-300 ${
                isCurrent
                  ? "border-brand bg-brand/[0.03]"
                  : plan.highlighted
                  ? "border-brand/40 bg-brand/[0.02] hover:border-brand"
                  : "border-border-default bg-bg-surface hover:border-[#444]"
              }`}
            >
              {plan.highlighted && !isCurrent && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-0.5 rounded-full bg-brand text-black text-xs font-medium">
                  Mais Popular
                </div>
              )}
              {isCurrent && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-0.5 rounded-full bg-brand/20 text-brand text-xs font-medium border border-brand/30">
                  Plano Atual
                </div>
              )}

              <h3 className="text-lg font-medium text-text-primary mb-1">{plan.name}</h3>
              <p className="text-sm text-text-muted mb-4">{plan.description}</p>

              <div className="mb-6">
                <span className="text-3xl font-semibold text-text-primary font-mono">{plan.price}</span>
                <span className="text-sm text-text-muted ml-1">{plan.period}</span>
              </div>

              <ul className="space-y-3 mb-6">
                {plan.features.map((f) => (
                  <li key={f} className="flex items-start gap-2 text-sm text-text-secondary">
                    <Check className="h-4 w-4 text-brand shrink-0 mt-0.5" />
                    {f}
                  </li>
                ))}
              </ul>

              <div className="text-xs text-text-muted mb-6 space-y-1">
                <p>Limite de produtos: {plan.limits.products === -1 ? "Ilimitados" : plan.limits.products.toLocaleString()}</p>
                <p>Limite de usuários: {plan.limits.users === -1 ? "Ilimitados" : plan.limits.users}</p>
              </div>

              <Button
                variant={isCurrent ? "outline" : plan.highlighted ? "primary" : "outline"}
                className="w-full"
                disabled={isDisabled}
                onClick={() => handlePlanSelect(plan.id)}
              >
                {isCurrent ? "Plano Atual" : plan.cta}
              </Button>
            </div>
          );
        })}
      </div>

      {/* Payment Methods */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <CreditCard className="h-4 w-4 text-text-muted" />
            <CardTitle>Forma de Pagamento</CardTitle>
          </div>
          <CardDescription>Sua assinatura é processada com segurança por nosso gateway de pagamentos</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 p-4 rounded-[4px] border border-border-default bg-bg-surface">
            <div className="flex items-center gap-3">
              <QrCode className="h-5 w-5 text-brand" />
              <div>
                <p className="text-sm text-text-primary">PIX, Boleto ou Cartão de Crédito</p>
                <p className="text-xs text-text-muted">Assinatura mensal processada com segurança • Pagamento facilitado</p>
              </div>
            </div>
            <Button variant="secondary" size="sm" asChild>
              <Link href="/settings">
                Gerenciar <ChevronRight className="h-3.5 w-3.5" />
              </Link>
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* API Access Info */}
      <Card accent="brand">
        <CardHeader>
          <div className="flex items-center gap-2">
            <TrendingUp className="h-4 w-4 text-brand" />
            <CardTitle>API para sua Empresa</CardTitle>
          </div>
          <CardDescription>
            Integre o INVENTOY com seus sistemas internos
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <p className="text-sm text-text-secondary">
            Todos os planos pagos (Starter e Pro) incluem acesso à API REST /api/v1 para consumir
            produtos, inventário e movimentações. Integre com seu ERP, site ou aplicativo mobile.
          </p>
          <div className="flex flex-wrap gap-2">
            <TechBadge variant="green">GET /api/v1/products</TechBadge>
            <TechBadge variant="green">GET /api/v1/inventory</TechBadge>
            <TechBadge variant="green">GET /api/v1/movements</TechBadge>
          </div>
          <p className="text-xs text-text-muted">
            {currentPlanName === "free" 
              ? "Faça upgrade para o plano Starter ou Pro para acessar a API."
              : "Sua API key está disponível nas Configurações da conta."}
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
