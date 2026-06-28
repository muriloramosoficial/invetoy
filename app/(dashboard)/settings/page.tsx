"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { TechBadge } from "@/components/tech-badge";
import { CreditCard, Check, ChevronRight, QrCode, Code2, ExternalLink, Loader2 } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import type { Profile, Tenant } from "@/types";
import { useToast } from "@/components/ui/toast";
import { TenantInfoForm } from "@/src/modules/tenant/presentation/components/tenant-info-form";
import { TeamMemberList } from "@/src/modules/tenant/presentation/components/team-member-list";
import { InviteMemberDialog } from "@/src/modules/tenant/presentation/components/invite-member-dialog";

interface TeamMember {
  id: string;
  name: string;
  email: string;
  role: string;
  status: string;
  created_at: string;
}

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

  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([]);
  const [teamLoading, setTeamLoading] = useState(false);
  const [teamModalOpen, setTeamModalOpen] = useState(false);

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

  useEffect(() => {
    const tenantId = profile?.tenant_id;
    if (!tenantId) return;
    let mounted = true;
    async function loadTeam() {
      setTeamLoading(true);
      try {
        const supabase = createClient();
        const { data } = await supabase
          .from("profiles")
          .select("id, name, email, role, status, created_at")
          .eq("tenant_id", tenantId)
          .order("created_at", { ascending: true });
        if (mounted && data) setTeamMembers(data as TeamMember[]);
      } finally {
        if (mounted) setTeamLoading(false);
      }
    }
    loadTeam();
    return () => { mounted = false; };
  }, [profile?.tenant_id]);

  const isTeamAdmin = !!(profile?.role === "admin" || profile?.role === "manager" || profile?.is_system_admin || profile?.is_staff);

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
        <h1 className="text-2xl font-semibold text-text-primary tracking-tight">Configuracoes da Empresa</h1>
        <p className="text-sm text-text-muted mt-1">Gerencie sua empresa, plano e integracoes</p>
      </div>

      {tenant && <TenantInfoForm tenant={tenant} />}

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
                  {!isCurrent ? (
                    <Button variant="outline" size="sm" className="w-full mt-3">Fazer Upgrade</Button>
                  ) : (
                    <TechBadge variant="green" className="w-full justify-center mt-3">Atual</TechBadge>
                  )}
                </div>
              );
            })}
          </div>

          <div className="pt-2">
            <h4 className="text-xs font-medium text-text-secondary uppercase tracking-wide mb-2">Forma de Pagamento</h4>              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-3 sm:p-4 rounded-[4px] border border-border-default bg-bg-surface gap-3">
              <div className="flex items-center gap-3">
                <QrCode className="h-4 w-4 shrink-0 text-brand" />
                <div>
                  <p className="text-sm text-text-primary">PIX, Boleto ou Cartao de Credito</p>
                  <p className="text-xs text-text-muted">Assinatura mensal processada com seguranca</p>
                </div>
              </div>
              <Button variant="secondary" size="sm" asChild className="w-full sm:w-auto shrink-0">
                <Link href="/subscription">Gerenciar <ChevronRight className="h-3.5 w-3.5" /></Link>
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Code2 className="h-4 w-4 text-text-muted" />
            <CardTitle>API de Integracao</CardTitle>
          </div>
          <CardDescription>Acesse a documentacao completa da API REST</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-3 sm:p-4 rounded-[4px] border border-border-default bg-bg-surface gap-3">
            <div className="flex items-center gap-3">
              <ExternalLink className="h-5 w-5 shrink-0 text-brand" />
              <div>
                <p className="text-sm text-text-primary">API /api/v1</p>
                <p className="text-xs text-text-muted">Integre com seu ERP, site ou aplicativo mobile</p>
              </div>
            </div>
            <Button variant="secondary" size="sm" asChild className="w-full sm:w-auto shrink-0">
              <Link href="/settings/api">Ver Documentacao <ChevronRight className="h-3.5 w-3.5" /></Link>
            </Button>
          </div>
        </CardContent>
      </Card>

      {tenant && profile && (
        <>
          <TeamMemberList
            members={teamMembers}
            loading={teamLoading}
            currentUserId={profile.id}
            isAdmin={isTeamAdmin}
            onAddClick={() => setTeamModalOpen(true)}
          />
          <InviteMemberDialog
            open={teamModalOpen}
            tenantId={tenant.id}
            onClose={() => setTeamModalOpen(false)}
            onCreated={() => {
              const supabase = createClient();
              supabase
                .from("profiles")
                .select("id, name, email, role, status, created_at")
                .eq("tenant_id", tenant.id)
                .order("created_at", { ascending: true })
                .then(({ data }) => { if (data) setTeamMembers(data as TeamMember[]); });
            }}
          />
        </>
      )}
    </div>
  );
}
