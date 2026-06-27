"use client";

import { useState, useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import { Sidebar } from "@/components/layout/sidebar";
import { Topbar } from "@/components/layout/topbar";
import { createClient } from "@/lib/supabase/client";
import { cn } from "@/lib/utils";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [userName, setUserName] = useState("Admin");
  const [tenantName, setTenantName] = useState("INVENTOY");
  const router = useRouter();

  useEffect(() => {
    let cancelled = false;
    const loadProfile = async () => {
      try {
        const supabase = createClient();
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
          router.push("/login");
          return;
        }

        const { data: profile } = await supabase
          .from("profiles")
          .select("name, is_system_admin, is_staff, tenants(name)")
          .eq("id", user.id)
          .single();

        if (!cancelled && profile) {
          if (profile.is_system_admin || profile.is_staff) {
            router.push("/admin");
            return;
          }
          setUserName(profile.name);
          if (profile.tenants && typeof profile.tenants === 'object' && 'name' in profile.tenants) {
            setTenantName((profile.tenants as { name: string }).name);
          }
        }
      } catch {
        // Profile may not exist yet; use defaults
      }
    };

    loadProfile();
    return () => { cancelled = true; };
  }, [router]);

  const handleLogout = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/login");
  };

  const pathname = usePathname();

  // Close mobile menu on route change
  useEffect(() => {
    setMobileOpen(false); // eslint-disable-line react-hooks/set-state-in-effect
  }, [pathname]);

  return (
    <div className="h-full flex">
      {/* Mobile overlay */}
      {mobileOpen && (
        <div
          className="fixed inset-0 z-30 bg-black/60 backdrop-blur-sm lg:hidden"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Mobile sidebar drawer */}
      <div
        className={cn(
          "fixed inset-y-0 left-0 z-40 transform transition-transform duration-200 lg:hidden",
          mobileOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        <Sidebar collapsed={false} onToggle={() => setMobileOpen(false)} />
      </div>

      {/* Desktop sidebar */}
      <div className="hidden lg:block">
        <Sidebar
          collapsed={collapsed}
          onToggle={() => setCollapsed(!collapsed)}
        />
      </div>

      {/* Main content area */}
      <div
        className={cn(
          "flex-1 flex flex-col min-h-full transition-all duration-200",
          "lg:ml-56",
          collapsed && "lg:ml-16"
        )}
      >
        {/* Topbar */}
        <Topbar
          tenantName={tenantName}
          userName={userName}
          onLogout={handleLogout}
          onMenuToggle={() => setMobileOpen(true)}
        />

        {/* Page content */}
        <main className="flex-1 p-4 lg:p-6 overflow-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
