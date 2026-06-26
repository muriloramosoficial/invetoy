"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
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
  const [userName, setUserName] = useState("Admin");
  const [tenantName, setTenantName] = useState("INVENTOY");
  const router = useRouter();

  useEffect(() => {
    const loadProfile = async () => {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        router.push("/login");
        return;
      }

      const { data: profile } = await supabase
        .from("profiles")
        .select("name, tenants(name)")
        .eq("id", user.id)
        .single();

      if (profile) {
        setUserName(profile.name);
        if (profile.tenants && typeof profile.tenants === 'object' && 'name' in profile.tenants) {
          setTenantName((profile.tenants as { name: string }).name);
        }
      }
    };

    loadProfile();
  }, [router]);

  const handleLogout = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/login");
  };

  return (
    <div className="h-full flex">
      {/* Sidebar */}
      <Sidebar
        collapsed={collapsed}
        onToggle={() => setCollapsed(!collapsed)}
      />

      {/* Main content area */}
      <div
        className={cn(
          "flex-1 flex flex-col min-h-full transition-all duration-200",
          collapsed ? "ml-16" : "ml-56"
        )}
      >
        {/* Topbar */}
        <Topbar
          tenantName={tenantName}
          userName={userName}
          onLogout={handleLogout}
        />

        {/* Page content */}
        <main className="flex-1 p-4 lg:p-6 overflow-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
