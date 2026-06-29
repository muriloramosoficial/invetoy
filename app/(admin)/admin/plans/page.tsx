"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { TechBadge } from "@/components/tech-badge";
import { useToast } from "@/components/ui/toast";
import { Loader2, Save, Plus, X, GripVertical } from "lucide-react";

interface PlanConfig {
  id: string;
  name: string;
  price: string;
  period: string;
  description: string;
  features: string[];
  limits_products: number;
  limits_users: number;
  highlighted: boolean;
  cta: string;
  sort_order: number;
}

const defaultPlans: PlanConfig[] = [
  { id: "free", name: "Free", price: "R$ 0", period: "/mes", description: "Para pequenas equipes começando", features: ["Até 30 itens", "1 usuário", "Dashboard básico", "Movimentações manuais"], limits_products: 30, limits_users: 1, highlighted: false, cta: "Começar Grátis", sort_order: 1 },
  { id: "starter", name: "Starter", price: "R$ 49", period: "/mes", description: "Para negócios em crescimento", features: ["Até 500 itens", "3 usuários", "Relatórios avançados", "Leitor de códigos", "Exportação CSV", "API REST"], limits_products: 500, limits_users: 3, highlighted: true, cta: "Testar Grátis", sort_order: 2 },
  { id: "pro", name: "Pro", price: "R$ 149", period: "/mes", description: "Para operações em escala", features: ["Até 3.000 itens", "10 usuários", "API REST", "Leitor de códigos", "Relatórios customizados", "Exportação CSV", "Múltiplas filiais", "Suporte prioritário 24h"], limits_products: 3000, limits_users: 10, highlighted: false, cta: "Testar Grátis", sort_order: 3 },
  { id: "enterprise", name: "Enterprise", price: "Sob consulta", period: "", description: "Para grandes operações", features: ["Itens ilimitados", "Usuários ilimitados", "API REST", "Leitor de códigos", "Relatórios customizados", "Múltiplas filiais", "Onboarding dedicado", "SLA personalizado"], limits_products: -1, limits_users: -1, highlighted: false, cta: "Falar com Vendas", sort_order: 4 },
];

export default function AdminPlansPage() {
  const [plans, setPlans] = useState<PlanConfig[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const { success: toastSuccess, error: toastError } = useToast();

  useEffect(() => {
    load();
  }, []);

  async function load() {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/plans");
      if (!res.ok) throw new Error("Erro ao carregar");
      const data = await res.json();
      if (Array.isArray(data) && data.length > 0) {
        setPlans(data);
      } else {
        // Use defaults if no data in DB yet
        setPlans(defaultPlans);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro ao carregar planos");
      setPlans(defaultPlans);
    } finally {
      setLoading(false);
    }
  }

  async function savePlan(plan: PlanConfig) {
    setSaving(plan.id);
    setError(null);
    try {
      const res = await fetch("/api/admin/plans", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(plan),
      });
      if (!res.ok) throw new Error("Erro ao salvar");
      toastSuccess(`Plano "${plan.name}" salvo com sucesso!`);
    } catch (err) {
      toastError(err instanceof Error ? err.message : "Erro ao salvar plano");
    } finally {
      setSaving(null);
    }
  }

  function updatePlan(id: string, updates: Partial<PlanConfig>) {
    setPlans((prev) => prev.map((p) => p.id === id ? { ...p, ...updates } : p));
  }

  function addFeature(id: string, feature: string) {
    if (!feature.trim()) return;
    setPlans((prev) => prev.map((p) => p.id === id ? { ...p, features: [...p.features, feature.trim()] } : p));
  }

  function removeFeature(id: string, index: number) {
    setPlans((prev) => prev.map((p) => p.id === id ? { ...p, features: p.features.filter((_, i) => i !== index) } : p));
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-24">
        <Loader2 className="h-6 w-6 text-text-muted animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold text-text-primary tracking-tight">Gerenciar Planos</h1>
          <p className="text-sm text-text-muted mt-1">Edite precos, recursos e descricoes dos planos exibidos na landing page</p>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <TechBadge variant="green">Landing page</TechBadge>
          <TechBadge variant="blue">Planos</TechBadge>
        </div>
      </div>

      <div className="space-y-6">
        {plans
          .sort((a, b) => a.sort_order - b.sort_order)
          .map((plan) => (
            <Card key={plan.id}>
              <CardHeader>
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                  <div className="flex items-center gap-3 w-full sm:w-auto">
                    <GripVertical className="h-4 w-4 shrink-0 text-text-muted cursor-move" />
                    <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
                      {plan.name}
                      {plan.highlighted && (
                        <TechBadge variant="green">DESTAQUE</TechBadge>
                      )}
                    </CardTitle>
                  </div>
                  <div className="flex items-center gap-2 w-full sm:w-auto justify-between sm:justify-end">
                    <label className="flex items-center gap-2 text-xs text-text-muted cursor-pointer whitespace-nowrap">
                      <input
                        type="checkbox"
                        checked={plan.highlighted}
                        onChange={(e) => updatePlan(plan.id, { highlighted: e.target.checked })}
                        className="rounded border-border-default bg-bg-surface text-brand focus:ring-brand-dim"
                      />
                      Destacar
                    </label>
                    <Button
                      size="sm"
                      onClick={() => savePlan(plan)}
                      disabled={saving === plan.id}
                    >
                      {saving === plan.id ? (
                        <Loader2 className="h-3.5 w-3.5 animate-spin" />
                      ) : (
                        <Save className="h-3.5 w-3.5" />
                      )}
                      Salvar
                    </Button>
                  </div>
                </div>
                <CardDescription>Configure o plano {plan.name}</CardDescription>
              </CardHeader>
              <CardContent className="space-y-5">
                {/* Basic info */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-xs font-medium text-text-secondary mb-1.5 uppercase tracking-wider">Nome</label>
                    <Input value={plan.name} onChange={(e) => updatePlan(plan.id, { name: e.target.value })} />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-text-secondary mb-1.5 uppercase tracking-wider">Preco</label>
                    <Input value={plan.price} onChange={(e) => updatePlan(plan.id, { price: e.target.value })} placeholder="R$ 49" />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-text-secondary mb-1.5 uppercase tracking-wider">Periodo</label>
                    <Input value={plan.period} onChange={(e) => updatePlan(plan.id, { period: e.target.value })} placeholder="/mes" />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-medium text-text-secondary mb-1.5 uppercase tracking-wider">Descricao</label>
                  <Input value={plan.description} onChange={(e) => updatePlan(plan.id, { description: e.target.value })} />
                </div>

                <div>
                  <label className="block text-xs font-medium text-text-secondary mb-1.5 uppercase tracking-wider">Texto do Botao CTA</label>
                  <Input value={plan.cta} onChange={(e) => updatePlan(plan.id, { cta: e.target.value })} />
                </div>

                {/* Limits */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-medium text-text-secondary mb-1.5 uppercase tracking-wider">
                      Limite de Produtos (-1 = ilimitado)
                    </label>
                    <Input
                      type="number"
                      value={plan.limits_products}
                      onChange={(e) => updatePlan(plan.id, { limits_products: parseInt(e.target.value) || 0 })}
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-text-secondary mb-1.5 uppercase tracking-wider">
                      Limite de Usuarios (-1 = ilimitado)
                    </label>
                    <Input
                      type="number"
                      value={plan.limits_users}
                      onChange={(e) => updatePlan(plan.id, { limits_users: parseInt(e.target.value) || 0 })}
                    />
                  </div>
                </div>

                {/* Features */}
                <div>
                  <label className="block text-xs font-medium text-text-secondary mb-1.5 uppercase tracking-wider">Recursos</label>
                  <div className="space-y-2">
                    {plan.features.map((feature, i) => (
                      <div key={i} className="flex items-center gap-2">
                        <span className="text-brand text-xs">&#10003;</span>
                        <Input
                          value={feature}
                          onChange={(e) => {
                            const newFeatures = [...plan.features];
                            newFeatures[i] = e.target.value;
                            updatePlan(plan.id, { features: newFeatures });
                          }}
                          className="flex-1"
                        />
                        <button
                          onClick={() => removeFeature(plan.id, i)}
                          className="p-1.5 text-text-muted hover:text-brand-danger rounded transition-colors"
                        >
                          <X className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    ))}
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="mt-2"
                    onClick={() => {
                      const feature = prompt("Novo recurso:");
                      if (feature) addFeature(plan.id, feature);
                    }}
                  >
                    <Plus className="h-3.5 w-3.5" />
                    Adicionar Recurso
                  </Button>
                </div>

                {/* Preview badge */}
                <div className="rounded-[4px] bg-bg-surface border border-border-default p-3">
                  <p className="text-[10px] text-text-muted uppercase tracking-wider mb-1">Preview na landing page</p>
                  <p className="text-sm text-text-primary">
                    {plan.name} - <span className="font-mono text-brand">{plan.price}</span>{plan.period} &middot; {plan.features.length} recursos &middot; {plan.limits_products === -1 ? "Produtos ilimitados" : `Até ${plan.limits_products} produtos`}
                  </p>
                </div>
              </CardContent>
            </Card>
          ))}
      </div>
    </div>
  );
}
