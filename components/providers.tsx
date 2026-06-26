"use client";

import { I18nextProvider } from "react-i18next";
import { useEffect, useState } from "react";
import i18n from "@/lib/i18n/config";

export function Providers({ children }: { children: React.ReactNode }) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Prevent hydration mismatch by not rendering i18n-dependent content until mounted
  if (!mounted) {
    return (
      <div className="h-full bg-bg-primary" style={{ visibility: "hidden" }}>
        {children}
      </div>
    );
  }

  return (
    <I18nextProvider i18n={i18n} defaultNS="common">
      {children}
    </I18nextProvider>
  );
}
