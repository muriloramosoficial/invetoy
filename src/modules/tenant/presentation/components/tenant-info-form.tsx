"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Building2 } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { useToast } from "@/components/ui/toast";
import type { Tenant } from "@/types";

interface TenantInfoFormProps {
  tenant: Tenant;
  onUpdated?: (updates: Partial<Tenant>) => void;
}

export function TenantInfoForm({ tenant, onUpdated }: TenantInfoFormProps) {
  const [name, setName] = useState(tenant.name);
  const [saving, setSaving] = useState(false);
  const { success: toastSuccess, error: toastError } = useToast();

  const handleSave = async () => {
    setSaving(true);
    try {
      const supabase = createClient();
      const { error } = await supabase.from("tenants").update({ name }).eq("id", tenant.id);
      if (error) throw error;
      toastSuccess("Organizacao atualizada com sucesso");
      onUpdated?.({ name });
    } catch (err) {
      toastError(err instanceof Error ? err.message : "Erro ao atualizar");
    } finally {
      setSaving(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-2">
          <Building2 className="h-4 w-4 text-text-muted" />
          <CardTitle>Organizacao</CardTitle>
        </div>
        <CardDescription>Dados da sua empresa</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <Input label="Nome da Empresa" value={name} onChange={(e) => setName(e.target.value)} />
        <Input label="Slug" value={tenant.slug} disabled />
        <Button onClick={handleSave} disabled={saving}>
          {saving ? "Salvando..." : "Salvar"}
        </Button>
      </CardContent>
    </Card>
  );
}
