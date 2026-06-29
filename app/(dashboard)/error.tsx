"use client";

import { Button } from "@/components/ui/button";
import { AlertTriangle } from "lucide-react";

export default function DashboardError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="flex items-center justify-center min-h-[60vh] p-4">
      <div className="text-center max-w-sm">
        <div className="flex items-center justify-center w-14 h-14 rounded-xl bg-brand-danger-dim mx-auto mb-5">
          <AlertTriangle className="h-7 w-7 text-brand-danger" />
        </div>
        <h2 className="text-lg font-medium text-text-primary mb-1">Erro no Dashboard</h2>
        <p className="text-sm text-text-muted mb-6">
          {error.message || "Ocorreu um erro ao carregar esta pagina."}
        </p>
        <Button variant="primary" onClick={reset}>
          Tentar Novamente
        </Button>
      </div>
    </div>
  );
}
