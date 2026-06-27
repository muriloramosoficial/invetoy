"use client";

import { useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";

export function BackButton() {
  const router = useRouter();

  const handleBack = () => {
    // Try to go back in history first
    if (window.history.length > 1) {
      router.back();
    } else {
      router.push("/");
    }
  };

  return (
    <button
      onClick={handleBack}
      className="inline-flex items-center gap-2 text-sm text-text-muted hover:text-text-primary transition-colors mb-6 cursor-pointer"
    >
      <ArrowLeft className="h-4 w-4" />
      Voltar
    </button>
  );
}
