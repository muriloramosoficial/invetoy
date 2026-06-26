"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Package,
  ArrowRightLeft,
  Tags,
  MapPin,
  BarChart3,
  Settings,
  ChevronLeft,
  ChevronRight,
  Box,
} from "lucide-react";

interface NavItem {
  label: string;
  href: string;
  icon: React.ReactNode;
}

const navItems: NavItem[] = [
  { label: "Dashboard", href: "/dashboard", icon: <LayoutDashboard className="h-4 w-4" /> },
  { label: "Inventário", href: "/inventory", icon: <Package className="h-4 w-4" /> },
  { label: "Movimentações", href: "/movements", icon: <ArrowRightLeft className="h-4 w-4" /> },
  { label: "Categorias", href: "/categories", icon: <Tags className="h-4 w-4" /> },
  { label: "Localizações", href: "/locations", icon: <MapPin className="h-4 w-4" /> },
  { label: "Relatórios", href: "/reports", icon: <BarChart3 className="h-4 w-4" /> },
  { label: "Configurações", href: "/settings", icon: <Settings className="h-4 w-4" /> },
];

interface SidebarProps {
  collapsed?: boolean;
  onToggle?: () => void;
}

export function Sidebar({ collapsed = false, onToggle }: SidebarProps) {
  const pathname = usePathname();

  return (
    <aside
      className={cn(
        "fixed left-0 top-0 z-40 h-full bg-bg-secondary border-r border-border-default flex flex-col transition-all duration-200",
        collapsed ? "w-16" : "w-56"
      )}
    >
      {/* Logo */}
      <div className="flex items-center gap-3 h-14 px-4 border-b border-border-default shrink-0">
        <div className="flex items-center justify-center w-8 h-8 rounded-[4px] bg-brand/10">
          <Box className="h-5 w-5 text-brand" />
        </div>
        {!collapsed && (
          <span className="text-base font-semibold text-text-primary tracking-tight">
            INVENTOY
          </span>
        )}
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-2 space-y-1 overflow-y-auto">
        {navItems.map((item) => {
          const isActive = pathname === item.href || pathname.startsWith(item.href + "/");
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 rounded-[4px] px-3 py-2.5 text-sm transition-all duration-150",
                isActive
                  ? "bg-brand-dim text-brand font-medium"
                  : "text-text-secondary hover:bg-bg-surface-hover hover:text-text-primary"
              )}
              title={collapsed ? item.label : undefined}
            >
              <span className="shrink-0">{item.icon}</span>
              {!collapsed && <span className="truncate">{item.label}</span>}
              {isActive && !collapsed && (
                <span className="ml-auto w-1.5 h-1.5 rounded-full bg-brand shrink-0" />
              )}
            </Link>
          );
        })}
      </nav>

      {/* Collapse toggle */}
      <div className="p-2 border-t border-border-default">
        <button
          onClick={onToggle}
          className="flex items-center justify-center w-full h-9 rounded-[4px] text-text-muted hover:text-text-primary hover:bg-bg-surface-hover transition-colors"
          title={collapsed ? "Expand sidebar" : "Collapse sidebar"}
        >
          {collapsed ? (
            <ChevronRight className="h-4 w-4" />
          ) : (
            <ChevronLeft className="h-4 w-4" />
          )}
        </button>
      </div>
    </aside>
  );
}
