"use client";

import { useState, useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { AdminSidebar } from "@/components/admin/admin-sidebar";
import { cn } from "@/lib/utils";
import { Shield, Menu, User, Settings, LogOut, Search, LayoutDashboard } from "lucide-react";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [authorized, setAuthorized] = useState(false);
  const [loading, setLoading] = useState(true);
  const [userName, setUserName] = useState<string>("");
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    let cancelled = false;
    async function check() {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        router.push("/login");
        return;
      }
      const { data: profile } = await supabase
        .from("profiles")
        .select("is_system_admin, is_staff, name")
        .eq("id", user.id)
        .single();

      if (!cancelled) {
        if (!profile?.is_system_admin && !profile?.is_staff) {
          router.push("/dashboard");
          return;
        }
        setUserName(profile?.name || user.email || "");
        setAuthorized(true);
        setLoading(false);
      }
    }
    check();
    return () => { cancelled = true; };
  }, [router]);

  useEffect(() => {
    setMobileOpen(false);
    setUserMenuOpen(false);
  }, [pathname]);

  const handleLogout = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/login");
  };

  if (loading) {
    return (
      <div className="h-full flex items-center justify-center bg-bg-primary">
        <div className="flex flex-col items-center gap-3">
          <Shield className="h-8 w-8 text-brand animate-pulse" />
          <p className="text-sm text-text-muted">Verificando acesso...</p>
        </div>
      </div>
    );
  }

  if (!authorized) {
    return null;
  }

  return (
    <div className="h-full flex">
      {mobileOpen && (
        <div
          className="fixed inset-0 z-30 bg-black/60 backdrop-blur-sm lg:hidden"
          onClick={() => setMobileOpen(false)}
        />
      )}

      <div
        className={cn(
          "fixed inset-y-0 left-0 z-40 transform transition-transform duration-200 lg:hidden",
          mobileOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        <AdminSidebar collapsed={false} onToggle={() => setMobileOpen(false)} />
      </div>

      <div className="hidden lg:block">
        <AdminSidebar collapsed={collapsed} onToggle={() => setCollapsed(!collapsed)} />
      </div>

      <div
        className={cn(
          "flex-1 flex flex-col transition-all duration-200",
          collapsed ? "lg:ml-16" : "lg:ml-56"
        )}
      >
        <header className="h-14 border-b border-border-default bg-bg-secondary flex items-center justify-between px-4 shrink-0">
          <div className="flex items-center gap-3">
            <button
              className="lg:hidden p-1.5 rounded-[4px] text-text-muted hover:text-text-primary hover:bg-bg-surface-hover"
              onClick={() => setMobileOpen(true)}
            >
              <Menu className="h-5 w-5" />
            </button>
            <div className="flex items-center gap-2 text-sm text-text-muted">
              <Shield className="h-4 w-4 text-brand" />
              <span>Painel Administrativo</span>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="relative hidden md:block">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-text-muted pointer-events-none" />
              <input
                type="text"
                placeholder="Buscar empresas, usuarios, planos..."
                className="w-56 h-9 pl-9 pr-3 rounded-[4px] border border-border-default bg-bg-surface text-sm text-text-primary placeholder:text-text-muted-60 focus:border-brand-20 focus:ring-1 focus:ring-brand-dim transition-colors outline-none"
              />
            </div>
            <div className="relative">
              <button
                onClick={() => setUserMenuOpen(!userMenuOpen)}
                className="flex items-center gap-2 h-9 px-2 rounded-[4px] hover:bg-bg-surface-hover transition-colors"
              >
                <div className="h-7 w-7 rounded-full bg-bg-elevated flex items-center justify-center">
                  <User className="h-3.5 w-3.5 text-text-muted" />
                </div>
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
                      href="/settings"
                      onClick={() => setUserMenuOpen(false)}
                      className="flex items-center gap-2 w-full px-3 py-2 text-sm text-text-secondary hover:bg-bg-surface-hover hover:text-text-primary transition-colors"
                    >
                      <Settings className="h-4 w-4" />
                      Configuracoes
                    </Link>
                    <Link
                      href="/admin"
                      onClick={() => setUserMenuOpen(false)}
                      className="flex items-center gap-2 w-full px-3 py-2 text-sm text-text-secondary hover:bg-bg-surface-hover hover:text-text-primary transition-colors"
                    >
                      <LayoutDashboard className="h-4 w-4" />
                      Painel Administrativo
                    </Link>
                    <hr className="border-border-default my-1" />
                    <button
                      onClick={handleLogout}
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

        <main className="flex-1 overflow-y-auto p-6">{children}</main>
      </div>
    </div>
  );
}
