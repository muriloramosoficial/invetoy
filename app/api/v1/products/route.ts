import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { authenticateV1Request, V1AuthError } from "@/lib/api/v1-auth";
import { createProductSchema } from "@/lib/validations";

function getAdminClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } }
  );
}

export async function GET(req: NextRequest) {
  try {
    const { tenantId } = await authenticateV1Request(req);
    const adminClient = getAdminClient();
    const { searchParams } = new URL(req.url);

    const page = parseInt(searchParams.get("page") || "1");
    const pageSize = Math.min(parseInt(searchParams.get("page_size") || "50"), 100);
    const search = searchParams.get("search");
    const categoryId = searchParams.get("category_id");
    const active = searchParams.get("active");

    let query = adminClient
      .from("products")
      .select("*", { count: "exact" })
      .eq("tenant_id", tenantId);

    if (search) {
      query = query.or(`name.ilike.%${search}%,sku.ilike.%${search}%,description.ilike.%${search}%`);
    }
    if (categoryId) {
      query = query.eq("category_id", categoryId);
    }
    if (active === "true") {
      query = query.eq("is_active", true);
    } else if (active === "false") {
      query = query.eq("is_active", false);
    }

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
    console.error("API v1 products error:", error);
    return NextResponse.json(
      { error: "Erro ao buscar produtos" },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const { tenantId } = await authenticateV1Request(req);
    const adminClient = getAdminClient();
    const body = await req.json();

    const parsed = createProductSchema.safeParse(body);
    if (!parsed.success) {
      const firstError = parsed.error.issues[0];
      return NextResponse.json(
        { error: firstError?.message || "Dados invalidos" },
        { status: 400 }
      );
    }

    const { sku, name, description, category_id, min_stock, unit, price, cost } = parsed.data;

    const { data, error } = await adminClient
      .from("products")
      .insert({
        tenant_id: tenantId,
        sku,
        name,
        description: description || null,
        category_id: category_id || null,
        min_stock: min_stock || 0,
        unit: unit || "un",
        price: price || null,
        cost: cost || null,
        is_active: true,
      })
      .select()
      .single();

    if (error) {
      if (error.code === "23505") {
        return NextResponse.json(
          { error: "Product with this SKU already exists" },
          { status: 409 }
        );
      }
      throw error;
    }

    return NextResponse.json({ data }, { status: 201 });
  } catch (error: unknown) {
    if (error instanceof V1AuthError) {
      return NextResponse.json({ error: error.message }, { status: error.status });
    }
    console.error("API v1 products create error:", error);
    return NextResponse.json(
      { error: "Erro ao criar produto" },
      { status: 500 }
    );
  }
}
