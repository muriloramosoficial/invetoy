"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Box, Mail, Lock, Eye, EyeOff } from "lucide-react";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [mode, setMode] = useState<"password" | "magic">("password");
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage(null);

    try {
      const { createClient } = await import("@/lib/supabase/client");
      const supabase = createClient();

      if (mode === "magic") {
        const { error } = await supabase.auth.signInWithOtp({
          email,
          options: {
            emailRedirectTo: `${window.location.origin}/callback`,
          },
        });
        if (error) throw error;
        setMessage({
          type: "success",
          text: "Magic link sent! Check your email.",
        });
      } else {
        const { error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });
        if (error) throw error;
        router.push("/dashboard");
      }
    } catch (err) {
      setMessage({
        type: "error",
        text: err instanceof Error ? err.message : "An error occurred",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-bg-primary flex flex-col items-center justify-center p-4">
      {/* Noise is global */}
      <div className="w-full max-w-sm">
        {/* Logo */}
        <div className="flex flex-col items-center mb-10">
          <div className="flex items-center justify-center w-14 h-14 rounded-xl bg-brand/10 mb-4">
            <Box className="h-8 w-8 text-brand" />
          </div>
          <h1 className="text-2xl font-semibold text-text-primary tracking-tight">
            INVENTOY
          </h1>
          <p className="text-sm text-text-muted mt-1">
            Gestão de Estoque Inteligente
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleLogin} className="space-y-4">
          <Input
            label="Email"
            type="email"
            placeholder="you@company.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            icon={<Mail className="h-4 w-4" />}
          />

          {mode === "password" && (
            <div className="relative">
              <Input
                label="Password"
                type={showPassword ? "text" : "password"}
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                icon={<Lock className="h-4 w-4" />}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-[34px] text-text-muted hover:text-text-primary"
              >
                {showPassword ? (
                  <EyeOff className="h-4 w-4" />
                ) : (
                  <Eye className="h-4 w-4" />
                )}
              </button>
            </div>
          )}

          <Button type="submit" className="w-full h-11" loading={loading}>
            {mode === "magic" ? "Send Magic Link" : "Sign In"}
          </Button>

          {message && (
            <div
              className={`text-sm p-3 rounded-[4px] border ${
                message.type === "success"
                  ? "border-brand/20 bg-brand/[0.08] text-brand"
                  : "border-brand-danger/20 bg-brand-danger-dim text-brand-danger"
              }`}
            >
              {message.text}
            </div>
          )}

          <div className="flex items-center gap-3 pt-2">
            <div className="flex-1 h-px bg-border-default" />
            <span className="text-xs text-text-muted">or</span>
            <div className="flex-1 h-px bg-border-default" />
          </div>

          <button
            type="button"
            onClick={() => setMode(mode === "password" ? "magic" : "password")}
            className="w-full text-sm text-text-muted hover:text-brand transition-colors text-center"
          >
            {mode === "password"
              ? "Sign in with Magic Link instead"
              : "Sign in with password instead"}
          </button>
        </form>
      </div>
    </div>
  );
}
