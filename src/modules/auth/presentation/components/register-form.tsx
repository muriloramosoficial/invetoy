"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Input } from "@shared/ui/input";
import { Button } from "@shared/ui/button";
import { registerAction } from "../actions/auth";

export function RegisterForm() {
  const router = useRouter();
  const [form, setForm] = useState({ name: "", email: "", password: "", tenantName: "" });
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  function handleChange(field: string, value: string) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const result = await registerAction(form);
    if (result.success) {
      router.push("/dashboard");
    } else {
      setError(result.error);
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && <div className="text-sm text-brand-danger bg-brand-danger-15 p-3 rounded-[4px]">{error}</div>}
      <Input label="Nome" value={form.name} onChange={(e) => handleChange("name", e.target.value)} required />
      <Input label="Email" type="email" value={form.email} onChange={(e) => handleChange("email", e.target.value)} required />
      <Input label="Senha" type="password" value={form.password} onChange={(e) => handleChange("password", e.target.value)} required />
      <Input label="Nome da Organização" value={form.tenantName} onChange={(e) => handleChange("tenantName", e.target.value)} required />
      <Button type="submit" loading={loading} className="w-full">
        Criar Conta
      </Button>
    </form>
  );
}
