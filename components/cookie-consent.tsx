"use client";

import { useState, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { X, Shield, Settings, Check, ChevronDown } from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";

type CookieCategory = "necessary" | "analytics" | "marketing";

interface CookiePreferences {
  necessary: boolean;
  analytics: boolean;
  marketing: boolean;
  timestamp: string;
}

const DEFAULT_PREFERENCES: CookiePreferences = {
  necessary: true, // Always on
  analytics: false,
  marketing: false,
  timestamp: new Date().toISOString(),
};

const COOKIE_STORAGE_KEY = "invetoy-cookie-consent";

const categoryLabels: Record<CookieCategory, { title: string; desc: string }> = {
  necessary: {
    title: "Necessários",
    desc: "Essenciais para o funcionamento da plataforma. Incluem autenticação, segurança e preferências básicas.",
  },
  analytics: {
    title: "Analytics",
    desc: "Nos ajudam a entender como você usa a plataforma, permitindo melhorias contínuas. Ex: Supabase Realtime.",
  },
  marketing: {
    title: "Marketing",
    desc: "Usados para exibir anúncios relevantes e medir campanhas. Atualmente não utilizamos cookies de marketing.",
  },
};

function getStoredPreferences(): CookiePreferences | null {
  if (typeof window === "undefined") return null;
  try {
    const stored = localStorage.getItem(COOKIE_STORAGE_KEY);
    if (stored) {
      return JSON.parse(stored) as CookiePreferences;
    }
  } catch {
    // Ignore parse errors
  }
  return null;
}

function storePreferences(prefs: CookiePreferences) {
  try {
    localStorage.setItem(COOKIE_STORAGE_KEY, JSON.stringify(prefs));
  } catch {
    // Storage full or unavailable
  }
}

export function CookieConsent() {
  const [showBanner, setShowBanner] = useState(false);
  const [showCustomize, setShowCustomize] = useState(false);
  const [preferences, setPreferences] = useState<CookiePreferences>(DEFAULT_PREFERENCES);
  const [isAnimating, setIsAnimating] = useState(false);
  const [isVisible, setIsVisible] = useState(false);

  // Check existing consent on mount
  useEffect(() => {
    const stored = getStoredPreferences();
    if (!stored) {
      // No consent stored — show banner
      setShowBanner(true);
      // Delay entrance animation
      requestAnimationFrame(() => {
        requestAnimationFrame(() => setIsVisible(true));
      });
    } else {
      setPreferences(stored);
    }
  }, []);

  const handleAcceptAll = useCallback(() => {
    const prefs: CookiePreferences = {
      necessary: true,
      analytics: true,
      marketing: true,
      timestamp: new Date().toISOString(),
    };
    setPreferences(prefs);
    storePreferences(prefs);
    setIsVisible(false);
    // Wait for animation then hide
    setTimeout(() => setShowBanner(false), 300);
  }, []);

  const handleRejectAll = useCallback(() => {
    const prefs: CookiePreferences = {
      necessary: true,
      analytics: false,
      marketing: false,
      timestamp: new Date().toISOString(),
    };
    setPreferences(prefs);
    storePreferences(prefs);
    setIsVisible(false);
    setTimeout(() => setShowBanner(false), 300);
  }, []);

  const handleSavePreferences = useCallback(() => {
    const prefs: CookiePreferences = {
      ...preferences,
      timestamp: new Date().toISOString(),
    };
    storePreferences(prefs);
    setIsVisible(false);
    setTimeout(() => setShowBanner(false), 300);
  }, [preferences]);

  const toggleCategory = useCallback((category: CookieCategory) => {
    if (category === "necessary") return; // Cannot disable necessary
    setPreferences((prev) => ({
      ...prev,
      [category]: !prev[category],
    }));
  }, []);

  // Show a manage button when consent was already given
  const [showManageButton, setShowManageButton] = useState(false);

  useEffect(() => {
    const stored = getStoredPreferences();
    if (stored) {
      setShowManageButton(true);
    }
  }, []);

  const reopenBanner = useCallback(() => {
    setShowBanner(true);
    setShowCustomize(false);
    requestAnimationFrame(() => {
      requestAnimationFrame(() => setIsVisible(true));
    });
  }, []);

  if (!showBanner) {
    // Show floating manage button
    return showManageButton ? (
      <button
        onClick={reopenBanner}
        className="fixed bottom-4 right-4 z-50 w-10 h-10 rounded-full bg-bg-surface border border-border-default flex items-center justify-center text-text-muted hover:text-text-primary hover:border-brand/30 transition-all duration-200 shadow-lg hover:shadow-brand/10"
        aria-label="Gerenciar cookies"
        title="Gerenciar cookies"
      >
        <Settings className="h-4 w-4" />
      </button>
    ) : null;
  }

  return (
    <>
      {/* Overlay - apenas bloqueia interação, sem ação de consentimento implícito */}
      <div
        className={cn(
          "fixed inset-0 z-40 bg-black/50 backdrop-blur-sm transition-opacity duration-300",
          isVisible ? "opacity-100" : "opacity-0"
        )}
        aria-hidden="true"
      />

      {/* Banner */}
      <div
        role="dialog"
        aria-label="Preferências de cookies"
        aria-modal="true"
        className={cn(
          "fixed bottom-0 left-0 right-0 z-50 transition-all duration-300",
          isVisible ? "translate-y-0 opacity-100" : "translate-y-8 opacity-0"
        )}
      >
        <div className="mx-auto max-w-2xl px-4 pb-4">
          <div className="rounded-lg border border-border-default bg-bg-secondary p-4 sm:p-6 shadow-2xl">
            {!showCustomize ? (
              /* ── First Layer: Simple Banner ── */
              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-md bg-brand/10 flex items-center justify-center shrink-0">
                    <Shield className="h-4 w-4 text-brand" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-text-primary mb-1">
                      🍪 Controle de Cookies
                    </p>
                    <p className="text-xs text-text-secondary leading-relaxed">
                      Usamos cookies para garantir o funcionamento essencial da plataforma e
                      melhorar sua experiência. Consulte nossa{" "}
                      <Link
                        href="/privacidade"
                        className="text-brand hover:underline"
                        onClick={() => setIsVisible(false)}
                      >
                        Política de Privacidade
                      </Link>
                      .
                    </p>
                  </div>
                  <button
                    onClick={handleRejectAll}
                    className="shrink-0 p-1 text-text-muted hover:text-text-primary transition-colors"
                    aria-label="Fechar banner de cookies"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>

                <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setShowCustomize(true)}
                    className="flex-1"
                  >
                    <Settings className="h-3.5 w-3.5" />
                    Personalizar
                  </Button>
                  <div className="flex gap-2 flex-1">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={handleRejectAll}
                      className="flex-1 text-text-secondary"
                    >
                      Rejeitar todos
                    </Button>
                    <Button
                      size="sm"
                      onClick={handleAcceptAll}
                      className="flex-1"
                    >
                      Aceitar todos
                    </Button>
                  </div>
                </div>
              </div>
            ) : (
              /* ── Second Layer: Preference Center ── */
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Settings className="h-4 w-4 text-brand" />
                    <p className="text-sm font-medium text-text-primary">
                      Preferências de Cookies
                    </p>
                  </div>
                  <button
                    onClick={() => setShowCustomize(false)}
                    className="p-1 text-text-muted hover:text-text-primary transition-colors"
                    aria-label="Voltar"
                  >
                    <ChevronDown className="h-4 w-4 rotate-180" />
                  </button>
                </div>

                <p className="text-xs text-text-secondary">
                  Personalize quais cookies você autoriza. Os cookies necessários são
                  essenciais e não podem ser desativados.
                </p>

                {/* Categories */}
                <div className="space-y-2">
                  {(Object.entries(categoryLabels) as [CookieCategory, { title: string; desc: string }][]).map(
                    ([key, label]) => {
                      const isEnabled = preferences[key];
                      const isLocked = key === "necessary";

                      return (
                        <div
                          key={key}
                          className={cn(
                            "flex items-start gap-3 p-3 rounded-[4px] border transition-colors",
                            isEnabled
                              ? "border-border-default bg-bg-surface"
                              : "border-border-muted bg-transparent"
                          )}
                        >
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2">
                              <p className="text-xs font-medium text-text-primary">
                                {label.title}
                              </p>
                              {isLocked && (
                                <span className="text-[10px] text-text-muted bg-bg-elevated px-1.5 py-0.5 rounded">
                                  Sempre ativo
                                </span>
                              )}
                            </div>
                            <p className="text-[11px] text-text-muted mt-0.5">{label.desc}</p>
                          </div>
                          <button
                            role="switch"
                            aria-checked={isEnabled}
                            aria-label={`${label.title} ${isEnabled ? "ativado" : "desativado"}`}
                            disabled={isLocked}
                            onClick={() => toggleCategory(key)}
                            className={cn(
                              "relative shrink-0 w-9 h-5 rounded-full transition-colors duration-200",
                              isEnabled
                                ? "bg-brand"
                                : "bg-bg-elevated",
                              isLocked && "opacity-50 cursor-not-allowed"
                            )}
                          >
                            <span
                              className={cn(
                                "absolute top-0.5 left-0.5 w-4 h-4 rounded-full bg-white transition-transform duration-200",
                                isEnabled && "translate-x-4"
                              )}
                            />
                          </button>
                        </div>
                      );
                    }
                  )}
                </div>

                <div className="flex flex-col sm:flex-row gap-2 pt-1">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleRejectAll}
                    className="flex-1 text-text-secondary"
                  >
                    Rejeitar todos
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleAcceptAll}
                    className="flex-1"
                  >
                    Aceitar todos
                  </Button>
                  <Button
                    size="sm"
                    onClick={handleSavePreferences}
                    className="flex-1"
                  >
                    <Check className="h-3.5 w-3.5" />
                    Salvar preferências
                  </Button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
