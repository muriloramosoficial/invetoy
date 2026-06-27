import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { authenticateV1Request, V1AuthError } from "@/lib/api/v1-auth";
import { createMovementSchema } from "@/lib/validations";

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
    const productId = searchParams.get("product_id");
    const type = searchParams.get("type");
    const fromDate = searchParams.get("from_date");
    const toDate = searchParams.get("to_date");

    let query = adminClient
      .from("movements")
      .select("*, product:products(name, sku)", { count: "exact" })
      .eq("tenant_id", tenantId);

    if (productId) query = query.eq("product_id", productId);
    if (type) query = query.eq("type", type);
    if (fromDate) query = query.gte("created_at", fromDate);
    if (toDate) query = query.lte("created_at", toDate);

    const from = (page - 1) * pageSize;
    const to = from + pageSize - 1;

    const { data, count, error } = await query
      .order("created_at", { ascending: false })
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
    console.error("API v1 movements error:", error);
    return NextResponse.json(
      { error: "Erro ao buscar movimentacoes" },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const { tenantId } = await authenticateV1Request(req);

    const adminClient = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
      { auth: { autoRefreshToken: false, persistSession: false } }
    );

    const body = await req.json();
    const parsed = createMovementSchema.safeParse(body);
    if (!parsed.success) {
      const firstError = parsed.error.issues[0];
      return NextResponse.json(
        { error: firstError?.message || "Dados invalidos" },
        { status: 400 }
      );
    }

    const { product_id, type, quantity, location_id, to_location_id, notes, reference } = parsed.data;

    const { data: product, error: productError } = await adminClient
      .from("products")
      .select("tenant_id")
      .eq("id", product_id)
      .single();

    if (productError || !product) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 });
    }

    if (product.tenant_id !== tenantId) {
      return NextResponse.json({ error: "Product does not belong to this tenant" }, { status: 403 });
    }

    const { data, error } = await adminClient
      .from("movements")
      .insert({
        tenant_id: tenantId,
        product_id,
        from_location_id: type === "in" ? null : location_id,
        to_location_id: type === "out" ? null : to_location_id || location_id,
        quantity,
        type,
        notes: notes || null,
        reference: reference || null,
        user_id: null,
      })
      .select("*, product:products(name, sku)")
      .single();

    if (error) throw error;

    return NextResponse.json({ data }, { status: 201 });
  } catch (error: unknown) {
    if (error instanceof V1AuthError) {
      return NextResponse.json({ error: error.message }, { status: error.status });
    }
    console.error("API v1 movements create error:", error);
    return NextResponse.json(
      { error: "Erro ao criar movimentacao" },
      { status: 500 }
    );
  }
}
