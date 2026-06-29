"use client";

import { useEffect } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { AlertTriangle, RefreshCw, Home } from "lucide-react";

export const dynamic = "force-dynamic";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("Global application error:", error);
  }, [error]);

  return (
    <div className="min-h-screen bg-bg-primary flex items-center justify-center p-4">
      <div className="text-center max-w-md">
        <div className="flex items-center justify-center w-16 h-16 rounded-xl bg-brand-danger-10 mx-auto mb-6">
          <AlertTriangle className="h-8 w-8 text-brand-danger" />
        </div>
        <h1 className="text-5xl font-semibold text-text-primary font-mono mb-2">Erro</h1>
        <p className="text-lg text-text-secondary mb-2">Ocorreu um erro inesperado</p>
        <p className="text-sm text-text-muted mb-8">
          {error.digest ? `Erro: ${error.digest}` : error.message}
        </p>
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
          <Button onClick={reset}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Tentar Novamente
          </Button>
          <Link
            href="/"
            className="inline-flex items-center gap-2 h-10 px-4 rounded-[4px] border border-border-default bg-transparent text-text-primary hover:border-brand-30 hover:neon-glow-hover transition-colors"
          >
            <Home className="h-4 w-4" />
            Voltar ao Inicio
          </Link>
        </div>
      </div>
    </div>
  );
}