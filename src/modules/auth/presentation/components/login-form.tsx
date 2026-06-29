"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Input } from "@shared/ui/input";
import { Button } from "@shared/ui/button";
import { loginAction } from "../actions/auth";

export function LoginForm() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const result = await loginAction({ email, password });
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
      <Input label="Email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
      <Input label="Senha" type="password" value={password} onChange={(e) => setPassword(e.target.value)} required />
      <Button type="submit" loading={loading} className="w-full">
        Entrar
      </Button>
    </form>
  );
}
