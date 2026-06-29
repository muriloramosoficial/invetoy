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

    // Fetch ALL tenants with counts (bypasses RLS via service role)
    const { data: tenants, error: tenantsError } = await supabase
      .from("tenants")
      .select("id, name, slug, plan, subscription_status, payment_provider, created_at")
      .order("created_at", { ascending: false });

    if (tenantsError) throw tenantsError;

    const tenantsList = (tenants || []) as Array<{
      id: string;
      name: string;
      slug: string;
      plan: string;
      subscription_status: string;
      payment_provider: string | null;
      created_at: string;
    }>;

    // Get counts per tenant
    const ids = tenantsList.map((t) => t.id);
    if (ids.length > 0) {
      const [usersRes, productsRes, locationsRes, movementsRes] = await Promise.all([
        supabase.from("profiles").select("tenant_id").in("tenant_id", ids),
        supabase.from("products").select("tenant_id").in("tenant_id", ids),
        supabase.from("locations").select("tenant_id").in("tenant_id", ids),
        supabase.from("movements").select("tenant_id").in("tenant_id", ids),
      ]);

      const userCounts: Record<string, number> = {};
      const prodCounts: Record<string, number> = {};
      const locCounts: Record<string, number> = {};
      const movCounts: Record<string, number> = {};

      (usersRes.data || []).forEach((r: any) => {
        userCounts[r.tenant_id] = (userCounts[r.tenant_id] || 0) + 1;
      });
      (productsRes.data || []).forEach((r: any) => {
        prodCounts[r.tenant_id] = (prodCounts[r.tenant_id] || 0) + 1;
      });
      (locationsRes.data || []).forEach((r: any) => {
        locCounts[r.tenant_id] = (locCounts[r.tenant_id] || 0) + 1;
      });
      (movementsRes.data || []).forEach((r: any) => {
        movCounts[r.tenant_id] = (movCounts[r.tenant_id] || 0) + 1;
      });

      tenantsList.forEach((t) => {
        (t as any).user_count = userCounts[t.id] || 0;
        (t as any).product_count = prodCounts[t.id] || 0;
        (t as any).location_count = locCounts[t.id] || 0;
        (t as any).movement_count = movCounts[t.id] || 0;
      });
    }

    return NextResponse.json({ tenants: tenantsList });
  } catch (err) {
    console.error("[api/admin/tenants/list] Error:", err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Erro interno do servidor" },
      { status: 500 }
    );
  }
}