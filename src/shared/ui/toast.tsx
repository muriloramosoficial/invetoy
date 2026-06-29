"use client";

import { createContext, useContext, useState, useCallback, useEffect, useRef } from "react";
import { cn } from "@core/utils";
import { Check, X, AlertTriangle, Info, AlertCircle } from "lucide-react";

type ToastVariant = "success" | "error" | "warning" | "info";

interface Toast {
  id: string;
  message: string;
  variant: ToastVariant;
  duration?: number;
}

interface ToastContextValue {
  toasts: Toast[];
  toast: (message: string, variant?: ToastVariant, duration?: number) => void;
  success: (message: string, duration?: number) => void;
  error: (message: string, duration?: number) => void;
  warning: (message: string, duration?: number) => void;
  info: (message: string, duration?: number) => void;
  dismiss: (id: string) => void;
}

const ToastContext = createContext<ToastContextValue | undefined>(undefined);

let toastCounter = 0;

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);
  const timersRef = useRef<Map<string, ReturnType<typeof setTimeout>>>(new Map());

  const dismiss = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
    const timer = timersRef.current.get(id);
    if (timer) { clearTimeout(timer); timersRef.current.delete(id); }
  }, []);

  const addToast = useCallback(
    (message: string, variant: ToastVariant = "info", duration: number = 6000) => {
      const id = `toast-${++toastCounter}-${Date.now()}`;
      const toast: Toast = { id, message, variant, duration };
      setToasts((prev) => [...prev, toast]);
      if (duration > 0) {
        const timer = setTimeout(() => dismiss(id), duration);
        timersRef.current.set(id, timer);
      }
    },
    [dismiss]
  );

  useEffect(() => {
    return () => {
      timersRef.current.forEach((timer) => clearTimeout(timer));
      timersRef.current.clear();
    };
  }, []);

  const toast = useCallback(
    (message: string, variant?: ToastVariant, duration?: number) => addToast(message, variant, duration),
    [addToast]
  );

  const success = useCallback((message: string, duration?: number) => addToast(message, "success", duration), [addToast]);
  const error = useCallback((message: string, duration?: number) => addToast(message, "error", duration), [addToast]);
  const warning = useCallback((message: string, duration?: number) => addToast(message, "warning", duration), [addToast]);
  const info = useCallback((message: string, duration?: number) => addToast(message, "info", duration), [addToast]);

  return (
    <ToastContext.Provider value={{ toasts, toast, success, error, warning, info, dismiss }}>
      {children}
      <div className="fixed top-4 right-4 z-[100] flex flex-col gap-2 pointer-events-none">
        {toasts.map((t) => <ToastItem key={t.id} toast={t} onDismiss={dismiss} />)}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast(): ToastContextValue {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error("useToast must be used within ToastProvider");
  return ctx;
}

const variantStyles: Record<ToastVariant, { container: string; icon: React.ReactNode }> = {
  success: { container: "border-brand-40 bg-brand-15", icon: <Check className="h-4 w-4 text-brand" /> },
  error: { container: "border-brand-danger-30 bg-brand-danger-15", icon: <AlertCircle className="h-4 w-4 text-brand-danger" /> },
  warning: { container: "border-brand-warning-30 bg-brand-warning-15", icon: <AlertTriangle className="h-4 w-4 text-brand-warning" /> },
  info: { container: "border-brand-info-30 bg-brand-info-15", icon: <Info className="h-4 w-4 text-brand-info" /> },
};

function ToastItem({ toast, onDismiss }: { toast: Toast; onDismiss: (id: string) => void }) {
  const style = variantStyles[toast.variant];
  return (
    <div
      className={cn(
        "pointer-events-auto flex items-start gap-3 w-80 rounded-[6px] border px-4 py-3 shadow-lg",
        "animate-in slide-in-from-right-2 fade-in zoom-in-95 ease-out duration-300",
        style.container
      )}
    >
      <span className="shrink-0 mt-0.5">{style.icon}</span>
      <p className="flex-1 text-sm text-text-primary">{toast.message}</p>
      <button onClick={() => onDismiss(toast.id)} className="shrink-0 text-text-muted hover:text-text-primary transition-colors">
        <X className="h-3.5 w-3.5" />
      </button>
    </div>
  );
}
