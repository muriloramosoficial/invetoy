import Link from "next/link";
import { Box } from "lucide-react";

export default function NotFound() {
  return (
    <div className="min-h-screen bg-bg-primary flex items-center justify-center p-4">
      <div className="text-center max-w-md">
        <div className="flex items-center justify-center w-16 h-16 rounded-xl bg-brand-8 mx-auto mb-6">
          <Box className="h-8 w-8 text-brand" />
        </div>
        <h1 className="text-5xl font-semibold text-text-primary font-mono mb-2">404</h1>
        <p className="text-lg text-text-secondary mb-2">Pagina nao encontrada</p>
        <p className="text-sm text-text-muted mb-8">
          A pagina que voce procura nao existe ou foi movida.
        </p>
        <Link
          href="/"
          className="inline-flex items-center gap-2 h-10 px-4 rounded-[4px] bg-brand text-black text-sm font-medium hover:bg-brand-hover transition-colors"
        >
          Voltar ao Inicio
        </Link>
      </div>
    </div>
  );
}
