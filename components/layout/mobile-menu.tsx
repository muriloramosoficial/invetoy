"use client";

import { cn } from "@/lib/utils";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, useEffect, useRef } from "react";
import { Search, X, SearchX } from "lucide-react";

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
  const searchRef = useRef<HTMLInputElement>(null);
  const [searchQuery, setSearchQuery] = useState("");

  // Close on route change
  useEffect(() => {
    onClose();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pathname]);

  // Trap focus inside menu when open + focus search input
  useEffect(() => {
    if (open) {
      document.body.style.overflow = "hidden";
      // Focus search input after animation
      setTimeout(() => searchRef.current?.focus(), 100);
    } else {
      document.body.style.overflow = "";
      setSearchQuery("");
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

  const filteredItems = searchQuery.trim()
    ? items.filter((item) =>
        item.label.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : items;

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

        {/* Search bar */}
        <div className="px-3 pt-2 pb-1 shrink-0">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-text-muted-40 pointer-events-none" />
            <input
              ref={searchRef}
              type="text"
              placeholder="Buscar pagina..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full h-10 pl-10 pr-9 rounded-[8px] border border-border-default bg-bg-surface text-sm text-text-primary placeholder:text-text-muted-40 focus:border-brand-30 focus:ring-1 focus:ring-brand-10 transition-colors outline-none"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery("")}
                className="absolute right-2 top-1/2 -translate-y-1/2 p-1 rounded-[4px] text-text-muted hover:text-text-primary hover:bg-bg-surface-hover transition-colors"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            )}
          </div>
        </div>

        {/* Navigation items */}
        <nav className="flex-1 overflow-y-auto p-3 pt-2 space-y-0.5">
          {filteredItems.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <SearchX className="h-10 w-10 text-text-muted-40 mb-3" />
              <p className="text-sm text-text-muted">Nenhuma pagina encontrada</p>
              <p className="text-xs text-text-muted-40 mt-1">Tente buscar por outro termo</p>
            </div>
          ) : (
            filteredItems.map((item) => {
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
            })
          )}
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
