import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";

export async function GET(request: NextRequest) {
  try {
    const supabase = createAdminClient();

    // Verify requesting user is a system admin
    const { data: { user: adminUser } } = await supabase.auth.getUser();
    if (!adminUser) {
      return NextResponse.json({ error: "Não autenticado" }, { status: 401 });
    }

    const { data: adminProfile } = await supabase
      .from("profiles")
      .select("is_system_admin, is_staff")
      .eq("id", adminUser.id)
      .single();

    if (!adminProfile?.is_system_admin && !adminProfile?.is_staff) {
      return NextResponse.json({ error: "Acesso negado" }, { status: 403 });
    }

    // Fetch ALL profiles with tenant info (bypasses RLS via service role)
    const { data: profiles, error: profilesError } = await supabase
      .from("profiles")
      .select(`
        id,
        name,
        email,
        role,
        is_system_admin,
        is_staff,
        status,
        suspended_at,
        banned_at,
        created_at,
        tenant_id
      `)
      .order("created_at", { ascending: false });

    if (profilesError) throw profilesError;

    // Fetch all tenants for lookup
    const { data: tenants, error: tenantsError } = await supabase
      .from("tenants")
      .select("id, name, plan, slug");

    if (tenantsError) throw tenantsError;

    // Map tenants by id
    const tenantMap: Record<string, { name: string; plan: string; slug: string }> = {};
    (tenants || []).forEach((t) => {
      tenantMap[t.id] = { name: t.name, plan: t.plan, slug: t.slug };
    });

    // Join profiles with tenant data
    const usersWithTenants = (profiles || []).map((u) => ({
      ...u,
      tenants: u.tenant_id ? tenantMap[u.tenant_id] || null : null,
    }));

    return NextResponse.json({ users: usersWithTenants });
  } catch (err) {
    console.error("[api/admin/users/list] Error:", err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Erro interno do servidor" },
      { status: 500 }
    );
  }
}