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

  const breadcrumbs = pathname
    .split("/")
    .filter(Boolean)
    .map((segment, index, arr) => ({
      label: segment.charAt(0).toUpperCase() + segment.slice(1),
      href: "/" + arr.slice(0, index + 1).join("/"),
      isLast: index === arr.length - 1,
    }));

  return (
    <>
      <header className="h-14 border-b border-border-default bg-bg-secondary flex items-center justify-between px-4 lg:px-6 shrink-0">
        <button
          onClick={onMenuToggle}
          className="lg:hidden p-2 -ml-2 text-text-muted hover:text-text-primary transition-colors"
        >
          <Menu className="h-5 w-5" />
        </button>

        <div className="flex items-center gap-2 min-w-0">
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

        <div className="flex items-center gap-2">
          <button
            className="flex items-center gap-2 h-9 px-3 rounded-[4px] border border-border-default bg-bg-surface text-text-muted hover:text-text-primary hover:border-[#444] transition-colors text-sm w-56 lg:w-64"
          >
            <Search className="h-3.5 w-3.5 shrink-0" />
            <span className="flex-1 text-left text-xs truncate">
              Buscar patrimonio...
            </span>
            <kbd className="hidden lg:inline-flex items-center gap-1 rounded border border-border-default px-1.5 py-0.5 text-[10px] font-mono text-text-muted">
              /
            </kbd>
          </button>

          <div className="hidden md:flex items-center gap-2 h-9 px-3 rounded-[4px] bg-bg-surface border border-border-default w-56 lg:w-64">
            <Globe className="h-3.5 w-3.5 text-brand shrink-0" />
            <span className="text-xs font-medium text-text-secondary truncate">
              {tenantName}
            </span>
          </div>

          <div className="relative">
            <button
              onClick={() => setUserMenuOpen(!userMenuOpen)}
              className="flex items-center gap-2 h-9 px-2 rounded-[4px] hover:bg-bg-surface-hover transition-colors"
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
                  className="fixed inset-0 z-10"
                  onClick={() => setUserMenuOpen(false)}
                />
                <div className="absolute right-0 top-full mt-1 z-20 w-48 rounded-[6px] border border-border-default bg-bg-secondary shadow-xl py-1">
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
                    className="flex items-center gap-2 w-full px-3 py-2 text-sm text-brand-danger hover:bg-brand-danger-8 transition-colors"
                  >
                    <LogOut className="h-4 w-4" />
                    Sair
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      </header>
    </>
  );
}
