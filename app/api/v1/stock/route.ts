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
    const productId = searchParams.get("product_id");
    const locationId = searchParams.get("location_id");

    let query = adminClient
      .from("inventory_items")
      .select(`
        id,
        quantity,
        min_stock,
        max_stock,
        product:products!inner(id, name, sku, sale_price),
        location:locations(id, name)
      `, { count: "exact" })
      .eq("product.tenant_id", tenantId);

    if (productId) query = query.eq("product_id", productId);
    if (locationId) query = query.eq("location_id", locationId);

    const { data, error } = await query;

    if (error) throw error;

    const items = (data || []).map((item: any) => ({
      id: item.id,
      product_id: item.product?.id,
      product_name: item.product?.name,
      product_sku: item.product?.sku,
      sale_price: item.product?.sale_price,
      quantity: item.quantity,
      min_stock: item.min_stock,
      max_stock: item.max_stock,
      location_id: item.location?.id,
      location_name: item.location?.name,
      status: item.quantity <= (item.min_stock || 0) ? "low" : item.quantity >= (item.max_stock || 999999) ? "excess" : "ok",
    }));

    return NextResponse.json({ data: items });
  } catch (error: unknown) {
    if (error instanceof V1AuthError) {
      return NextResponse.json({ error: error.message }, { status: error.status });
    }
    console.error("API v1 stock error:", error);
    return NextResponse.json(
      { error: "Erro ao buscar estoque" },
      { status: 500 }
    );
  }
}
