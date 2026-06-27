import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { authenticateV1Request, V1AuthError } from "@/lib/api/v1-auth";

export async function GET(req: NextRequest) {
  try {
    const { tenantId } = await authenticateV1Request(req);

    const adminClient = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
      { auth: { autoRefreshToken: false, persistSession: false } }
    );

    const { searchParams } = new URL(req.url);
    const page = parseInt(searchParams.get("page") || "1");
    const pageSize = Math.min(parseInt(searchParams.get("page_size") || "50"), 100);

    const from = (page - 1) * pageSize;
    const to = from + pageSize - 1;

    const { data, count, error } = await adminClient
      .from("inventory_items")
      .select(`
        *,
        product:products!inner(*),
        location:locations(*)
      `, { count: "exact" })
      .eq("product.tenant_id", tenantId)
      .order("updated_at", { ascending: false })
      .range(from, to);

    if (error) throw error;

    return NextResponse.json({
      data: data || [],
      pagination: {
        total: count || 0,
        page,
        page_size: pageSize,
        total_pages: Math.ceil((count || 0) / pageSize),
      },
    });
  } catch (error: unknown) {
    if (error instanceof V1AuthError) {
      return NextResponse.json({ error: error.message }, { status: error.status });
    }
    console.error("API v1 inventory error:", error);
    return NextResponse.json(
      { error: "Erro ao buscar inventario" },
      { status: 500 }
    );
  }
}
