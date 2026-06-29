"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
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
  DollarSign,
  Key,
  Webhook,
  CreditCard,
  Receipt,
  Settings,
} from "lucide-react";

interface NavItem {
  label: string;
  href: string;
  icon: React.ReactNode;
  staffOnly?: boolean;
}

const adminNav: NavItem[] = [
  { label: "Painel", href: "/admin", icon: <LayoutDashboard className="h-4 w-4" /> },
  { label: "Empresas", href: "/admin/tenants", icon: <Building2 className="h-4 w-4" /> },
  { label: "Usuarios", href: "/admin/users", icon: <Users className="h-4 w-4" /> },
  { label: "Planos", href: "/admin/plans", icon: <CreditCard className="h-4 w-4" /> },
  { label: "Assinaturas", href: "/admin/subscriptions", icon: <DollarSign className="h-4 w-4" /> },
  { label: "Financeiro", href: "/admin/billing", icon: <Receipt className="h-4 w-4" /> },
  { label: "Perfil", href: "/admin/settings", icon: <Settings className="h-4 w-4" /> },
  { label: "Relatorios", href: "/admin/reports", icon: <BarChart3 className="h-4 w-4" /> },
  { label: "Atividades", href: "/admin/activity", icon: <Activity className="h-4 w-4" /> },
  { label: "Asaas", href: "/admin/asaas-config", icon: <Webhook className="h-4 w-4" /> },
  { label: "API Keys", href: "/admin/api-keys", icon: <Key className="h-4 w-4" /> },
];

// Staff-only sidebar (limited navigation for sales/support team)
const staffNav: NavItem[] = [
  { label: "Painel", href: "/admin", icon: <LayoutDashboard className="h-4 w-4" /> },
  { label: "Empresas", href: "/admin/tenants", icon: <Building2 className="h-4 w-4" /> },
  { label: "Usuarios", href: "/admin/users", icon: <Users className="h-4 w-4" /> },
  { label: "Planos", href: "/admin/plans", icon: <CreditCard className="h-4 w-4" /> },
  { label: "Assinaturas", href: "/admin/subscriptions", icon: <DollarSign className="h-4 w-4" /> },
  { label: "Perfil", href: "/admin/settings", icon: <Settings className="h-4 w-4" /> },
];

interface AdminSidebarProps {
  collapsed?: boolean;
  onToggle?: () => void;
}

export function AdminSidebar({ collapsed = false, onToggle }: AdminSidebarProps) {
  const [isStaff, setIsStaff] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    async function checkRole() {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { data: profile } = await supabase
          .from("profiles")
          .select("is_staff")
          .eq("id", user.id)
          .single();
        if (profile?.is_staff) {
          setIsStaff(true);
        }
      }
    }
    checkRole();
  }, []);

  const navItems = isStaff ? staffNav : adminNav;

  return (
    <aside
      className={cn(
        "fixed left-0 top-0 z-40 h-full bg-bg-secondary border-r border-border-default flex flex-col transition-all duration-200",
        collapsed ? "w-16" : "w-56"
      )}
    >
      {/* Logo - click to go to landing page */}
      <Link href="/" className="flex items-center gap-3 h-14 px-4 border-b border-border-default shrink-0 hover:bg-bg-surface-hover transition-colors">
        <div className="flex items-center justify-center w-8 h-8 rounded-[4px] bg-brand-10">
          <Shield className="h-5 w-5 text-brand" />
        </div>
        {!collapsed && (
          <div className="flex flex-col">
            <span className="text-sm font-semibold text-text-primary tracking-tight">INVENTOY</span>
            <span className="text-[10px] text-brand font-medium uppercase tracking-wider">Admin</span>
          </div>
        )}
      </Link>

      {/* Navigation */}
      <nav className="flex-1 p-2 space-y-1 overflow-y-auto">
        {navItems.map((item) => {
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

      {/* Footer */}
      <div className="p-2 border-t border-border-default">
        <button
          onClick={onToggle}
          className="flex items-center justify-center w-full h-9 rounded-[4px] text-text-muted hover:text-text-primary hover:bg-bg-surface-hover transition-colors"
        >
          {collapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
        </button>
      </div>
    </aside>
  );
}
