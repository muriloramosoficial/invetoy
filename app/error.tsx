"use client";

import { Button } from "@/components/ui/button";
import { AlertTriangle } from "lucide-react";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="min-h-screen bg-bg-primary flex items-center justify-center p-4">
      <div className="text-center max-w-md">
        <div className="flex items-center justify-center w-16 h-16 rounded-xl bg-brand-danger-dim mx-auto mb-6">
          <AlertTriangle className="h-8 w-8 text-brand-danger" />
        </div>
        <h1 className="text-2xl font-semibold text-text-primary mb-2">Algo deu errado</h1>
        <p className="text-sm text-text-muted mb-8">
          {error.message || "Ocorreu um erro inesperado. Tente novamente."}
        </p>
        <Button onClick={reset}>
          Tentar Novamente
        </Button>
      </div>
    </div>
  );
}
