"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import {
  LayoutDashboard,
  Building2,
  Users,
  BarChart3,
  Activity,
  Shield,
  ChevronLeft,
  ChevronRight,
  LogOut,
} from "lucide-react";

interface NavItem {
  label: string;
  href: string;
  icon: React.ReactNode;
  badge?: string;
}

const adminNav: NavItem[] = [
  { label: "Overview", href: "/admin", icon: <LayoutDashboard className="h-4 w-4" /> },
  { label: "Empresas", href: "/admin/tenants", icon: <Building2 className="h-4 w-4" /> },
  { label: "Usuarios", href: "/admin/users", icon: <Users className="h-4 w-4" /> },
  { label: "Relatorios", href: "/admin/reports", icon: <BarChart3 className="h-4 w-4" /> },
  { label: "Audit Log", href: "/admin/activity", icon: <Activity className="h-4 w-4" /> },
];

interface AdminSidebarProps {
  collapsed?: boolean;
  onToggle?: () => void;
}

export function AdminSidebar({ collapsed = false, onToggle }: AdminSidebarProps) {
  const pathname = usePathname();

  return (
    <aside
      className={cn(
        "fixed left-0 top-0 z-40 h-full bg-[#0a0a0a] border-r border-border-default flex flex-col transition-all duration-200",
        collapsed ? "w-16" : "w-56"
      )}
    >
      {/* Logo */}
      <div className="flex items-center gap-3 h-14 px-4 border-b border-border-default shrink-0">
        <div className="flex items-center justify-center w-8 h-8 rounded-[4px] bg-emerald-500/10">
          <Shield className="h-5 w-5 text-emerald-500" />
        </div>
        {!collapsed && (
          <div className="flex flex-col">
            <span className="text-sm font-semibold text-white tracking-tight">INVENTOY</span>
            <span className="text-[10px] text-emerald-400 font-medium uppercase tracking-wider">SaaS Admin</span>
          </div>
        )}
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-2 space-y-1 overflow-y-auto">
        {adminNav.map((item) => {
          const isActive =
            item.href === "/admin"
              ? pathname === "/admin"
              : pathname.startsWith(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 rounded-[4px] px-3 py-2.5 text-sm transition-all duration-150",
                isActive
                  ? "bg-emerald-500/10 text-emerald-400 font-medium"
                  : "text-gray-400 hover:bg-white/5 hover:text-white"
              )}
              title={collapsed ? item.label : undefined}
            >
              <span className="shrink-0">{item.icon}</span>
              {!collapsed && <span className="truncate">{item.label}</span>}
              {isActive && !collapsed && (
                <span className="ml-auto w-1.5 h-1.5 rounded-full bg-emerald-500 shrink-0" />
              )}
            </Link>
          );
        })}
      </nav>

      {/* Footer */}
      <div className="p-2 border-t border-border-default space-y-1">
        <Link
          href="/dashboard"
          className="flex items-center gap-3 rounded-[4px] px-3 py-2.5 text-sm text-gray-500 hover:bg-white/5 hover:text-white transition-colors"
        >
          <LogOut className="h-4 w-4" />
          {!collapsed && <span>Voltar ao App</span>}
        </Link>
        <button
          onClick={onToggle}
          className="flex items-center justify-center w-full h-9 rounded-[4px] text-gray-500 hover:text-white hover:bg-white/5 transition-colors"
        >
          {collapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
        </button>
      </div>
    </aside>
  );
}
