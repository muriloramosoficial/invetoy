"use client";

import { cn } from "@/lib/utils";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef } from "react";
import { X } from "lucide-react";

export interface MobileNavItem {
  label: string;
  href: string;
  icon: React.ReactNode;
  badge?: string | number;
}

interface MobileMenuProps {
  open: boolean;
  onClose: () => void;
  items: MobileNavItem[];
  title?: string;
  subtitle?: string;
  footer?: React.ReactNode;
}

export function MobileMenu({
  open,
  onClose,
  items,
  title,
  subtitle,
  footer,
}: MobileMenuProps) {
  const pathname = usePathname();
  const menuRef = useRef<HTMLDivElement>(null);

  // Close on route change
  useEffect(() => {
    onClose();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pathname]);

  // Trap focus inside menu when open
  useEffect(() => {
    if (open) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  const isActive = (href: string) => {
    if (href === "/dashboard") return pathname === "/dashboard";
    if (href === "/admin") return pathname === "/admin";
    return pathname.startsWith(href);
  };

  return (
    <>
      {/* Backdrop */}
      <div
        className={cn(
          "fixed inset-0 z-40 bg-black/70 backdrop-blur-md transition-opacity duration-300 lg:hidden",
          open ? "opacity-100" : "opacity-0 pointer-events-none"
        )}
        onClick={onClose}
      />

      {/* Menu panel */}
      <div
        ref={menuRef}
        className={cn(
          "fixed inset-y-0 right-0 z-50 w-full max-w-sm transition-transform duration-300 ease-out lg:hidden",
          "bg-bg-secondary border-l border-border-default",
          "flex flex-col",
          open ? "translate-x-0" : "translate-x-full"
        )}
      >
        {/* Header */}
        <div className="flex items-center justify-between h-14 px-4 border-b border-border-default shrink-0">
          <div className="flex flex-col">
            {title && (
              <span className="text-sm font-semibold text-text-primary">{title}</span>
            )}
            {subtitle && (
              <span className="text-[10px] text-text-muted">{subtitle}</span>
            )}
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-[4px] text-text-muted hover:text-text-primary hover:bg-bg-surface-hover transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Navigation items */}
        <nav className="flex-1 overflow-y-auto p-3 space-y-0.5">
          {items.map((item) => {
            const active = isActive(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex items-center gap-3 rounded-[6px] px-4 py-3.5 transition-all duration-150",
                  active
                    ? "bg-brand-dim text-brand font-medium"
                    : "text-text-secondary hover:bg-bg-surface-hover hover:text-text-primary"
                )}
                onClick={onClose}
              >
                <span className="shrink-0">{item.icon}</span>
                <span className="flex-1 text-sm truncate">{item.label}</span>
                {item.badge !== undefined && (
                  <span className="text-[10px] font-mono font-medium px-1.5 py-0.5 rounded-full bg-bg-elevated text-text-muted">
                    {item.badge}
                  </span>
                )}
                {active && (
                  <span className="w-1.5 h-1.5 rounded-full bg-brand shrink-0" />
                )}
              </Link>
            );
          })}
        </nav>

        {/* Footer */}
        {footer && (
          <div className="p-3 border-t border-border-default shrink-0">
            {footer}
          </div>
        )}
      </div>
    </>
  );
}
