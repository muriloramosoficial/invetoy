"use client";

import { cn } from "@/lib/utils";
import Link from "next/link";
import { usePathname } from "next/navigation";
import type { ReactNode } from "react";

export interface NavItem {
  label: string;
  href: string;
  icon: ReactNode;
  adminOnly?: boolean;
}

interface BottomNavProps {
  items: NavItem[];
  className?: string;
}

export function BottomNav({ items, className }: BottomNavProps) {
  const pathname = usePathname();

  const isActive = (href: string) => {
    if (href === "/dashboard") return pathname === "/dashboard";
    if (href === "/admin") return pathname === "/admin";
    return pathname.startsWith(href);
  };

  return (
    <nav
      className={cn(
        "fixed bottom-0 left-0 right-0 z-50 lg:hidden",
        "h-16 border-t border-border-default bg-bg-secondary",
        "flex items-center justify-around px-2",
        "safe-area-inset-bottom",
        className
      )}
    >
      {items.map((item) => {
        const active = isActive(item.href);
        return (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              "flex flex-col items-center justify-center gap-0.5",
              "h-full min-w-0 flex-1",
              "px-1 py-1 rounded-[4px]",
              "transition-colors duration-150",
              active
                ? "text-brand"
                : "text-text-muted hover:text-text-secondary"
            )}
          >
            <span className="shrink-0">{item.icon}</span>
            <span
              className={cn(
                "text-[10px] font-medium truncate max-w-full leading-tight",
                active && "font-semibold"
              )}
            >
              {item.label}
            </span>
          </Link>
        );
      })}
    </nav>
  );
}
