"use client";

import { useState } from "react";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { usePathname } from "next/navigation";
import Image from "next/image";
import {
  Search,
  ChevronRight,
  Globe,
  User,
  LogOut,
  UserCircle,
  Menu,
  X,
} from "lucide-react";

interface TopbarProps {
  tenantName?: string;
  userName?: string;
  userAvatar?: string | null;
  onLogout?: () => void;
  onMenuToggle?: () => void;
}

export function Topbar({
  tenantName = "INVENTOY",
  userName = "Admin",
  userAvatar,
  onLogout,
  onMenuToggle,
}: TopbarProps) {
  const pathname = usePathname();
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const breadcrumbs = pathname
    .split("/")
    .filter(Boolean)
    .map((segment, index, arr) => ({
      label: segment.charAt(0).toUpperCase() + segment.slice(1),
      href: "/" + arr.slice(0, index + 1).join("/"),
      isLast: index === arr.length - 1,
    }));

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      // Navigate to search results page or filter current page
      // For now, just close search on mobile
      setSearchOpen(false);
    }
  };

  return (
    <>
      <header className="h-14 border-b border-border-default bg-bg-secondary flex items-center justify-between px-4 shrink-0">
        {/* Mobile menu toggle */}
        <button
          onClick={onMenuToggle}
          className="lg:hidden p-2 -ml-2 text-text-muted hover:text-text-primary transition-colors"
          aria-label="Abrir menu"
        >
          <Menu className="h-5 w-5" />
        </button>

        {/* Breadcrumbs / Page title */}
        <div className="flex items-center gap-2 min-w-0 flex-1 lg:mr-4">
          <span className="text-sm font-mono text-text-muted hidden sm:inline">
            inventoy
          </span>
          {breadcrumbs.length > 0 && (
            <ChevronRight className="h-3.5 w-3.5 text-text-muted hidden sm:block" />
          )}
          {breadcrumbs.map((crumb) => (
            <span key={crumb.href} className="flex items-center gap-2">
              <span
                className={cn(
                  "text-sm font-mono truncate max-w-[120px]",
                  crumb.isLast
                    ? "text-text-primary font-medium"
                    : "text-text-muted hidden sm:inline"
                )}
              >
                {crumb.label}
              </span>
              {!crumb.isLast && (
                <ChevronRight className="h-3.5 w-3.5 text-text-muted hidden sm:block" />
              )}
            </span>
          ))}
        </div>

        {/* Search - collapsible on mobile */}
        <div className="flex items-center gap-2">
          {/* Mobile: search button that expands */}
          <div className="relative lg:hidden">
            <button
              type="button"
              onClick={() => setSearchOpen(!searchOpen)}
              className="p-2 rounded-lg text-text-muted hover:text-text-primary hover:bg-bg-surface transition-colors"
              aria-label={searchOpen ? "Fechar busca" : "Abrir busca"}
              aria-expanded={searchOpen}
            >
              {searchOpen ? <X className="h-5 w-5" /> : <Search className="h-5 w-5" />}
            </button>

            {/* Mobile expanded search */}
            {searchOpen && (
              <form onSubmit={handleSearchSubmit} className="absolute right-0 top-full mt-2 w-64 bg-bg-secondary border border-border-default rounded-lg shadow-lg p-2 z-50 animate-slide-down">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-text-muted" />
                  <input
                    type="search"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Buscar patrimônio..."
                    onKeyDown={(e) => { if (e.key === "Enter") handleSearchSubmit(e); }}
                    className="w-full h-10 pl-10 pr-3 rounded-lg border border-border-default bg-bg-surface text-sm text-text-primary placeholder:text-text-muted focus:border-brand focus:ring-1 focus:ring-brand outline-none"
                    autoFocus
                  />
                </div>
              </form>
            )}
          </div>

          {/* Desktop: always visible search */}
          <div className="hidden lg:flex items-center gap-2">
            <form onSubmit={handleSearchSubmit} className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-text-muted" />
              <input
                type="search"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Buscar patrimônio..."
                onKeyDown={(e) => { if (e.key === "Enter") handleSearchSubmit(e); }}
                className="h-9 w-56 lg:w-64 pl-10 pr-3 rounded-lg border border-border-default bg-bg-surface text-sm text-text-primary placeholder:text-text-muted focus:border-brand focus:ring-1 focus:ring-brand outline-none transition-colors"
              />
              <kbd className="hidden lg:inline-flex items-center gap-1 rounded border border-border-default px-1.5 py-0.5 text-[10px] font-mono text-text-muted">
                ⌘
                <span className="ml-1">K</span>
              </kbd>
            </form>

            {/* Tenant badge - desktop only */}
            <div className="hidden lg:flex items-center gap-2 h-9 px-3 rounded-lg bg-bg-surface border border-border-default w-auto min-w-[160px]">
              <Globe className="h-3.5 w-3.5 text-brand shrink-0" />
              <span className="text-xs font-medium text-text-secondary truncate max-w-[140px]">
                {tenantName}
              </span>
            </div>
          </div>
        </div>

        {/* User menu */}
        <div className="relative">
          <button
            onClick={() => setUserMenuOpen(!userMenuOpen)}
            className="flex items-center gap-2 h-9 px-2 rounded-lg hover:bg-bg-surface-hover transition-colors"
            aria-label="Menu do usuário"
            aria-expanded={userMenuOpen}
          >
            {userAvatar ? (
              <Image
                src={userAvatar}
                alt={userName}
                width={28}
                height={28}
                className="rounded-full object-cover"
              />
            ) : (
              <div className="h-7 w-7 rounded-full bg-bg-elevated flex items-center justify-center">
                <User className="h-3.5 w-3.5 text-text-muted" />
              </div>
            )}
            <span className="text-sm text-text-secondary hidden lg:inline truncate max-w-[100px]">
              {userName}
            </span>
          </button>

          {userMenuOpen && (
            <>
              <div
                className="fixed inset-0 z-10 lg:hidden"
                onClick={() => setUserMenuOpen(false)}
                aria-hidden="true"
              />
              <div className="absolute right-0 top-full mt-1 z-20 w-48 rounded-lg border border-border-default bg-bg-secondary shadow-xl py-1">
                <Link
                  href="/profile"
                  onClick={() => setUserMenuOpen(false)}
                  className="flex items-center gap-2 w-full px-3 py-2 text-sm text-text-secondary hover:bg-bg-surface-hover hover:text-text-primary transition-colors"
                >
                  <UserCircle className="h-4 w-4" />
                  Perfil
                </Link>
                <hr className="border-border-default my-1" />
                <button
                  onClick={onLogout}
                  className="flex items-center gap-2 w-full px-3 py-2 text-sm text-brand-danger hover:bg-brand-danger/10 transition-colors"
                >
                  <LogOut className="h-4 w-4" />
                  Sair
                </button>
              </div>
            </>
          )}
        </div>
      </header>
    </>
  );
}