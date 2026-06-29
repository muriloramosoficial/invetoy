"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@core/utils";
import { LayoutDashboard, Users, Settings, Shield } from "lucide-react";

const adminLinks = [
  { href: "/admin", label: "Dashboard", icon: LayoutDashboard },
  { href: "/admin/users", label: "Usuários", icon: Users },
  { href: "/admin/tenants", label: "Organizações", icon: Shield },
  { href: "/admin/settings", label: "Configurações", icon: Settings },
];

export function AdminSidebar() {
  const pathname = usePathname();

  return (
    <aside className="w-60 border-r border-border-default bg-bg-secondary min-h-screen p-4">
      <div className="text-xs font-mono uppercase tracking-wider text-text-muted mb-4 px-3">
        Admin
      </div>
      <nav className="space-y-1">
        {adminLinks.map((link) => {
          const Icon = link.icon;
          const isActive = pathname === link.href;
          return (
            <Link
              key={link.href}
              href={link.href}
              className={cn(
                "flex items-center gap-3 px-3 py-2 rounded-[4px] text-sm transition-colors",
                isActive
                  ? "bg-brand-8 text-brand font-medium"
                  : "text-text-secondary hover:text-text-primary hover:bg-bg-surface"
              )}
            >
              <Icon className="h-4 w-4" />
              {link.label}
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
