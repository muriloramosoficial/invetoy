import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { authenticateV1Request, V1AuthError } from "@/lib/api/v1-auth";
import { updateProductSchema } from "@/lib/validations";

function getAdminClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } }
  );
}

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { tenantId } = await authenticateV1Request(req);
    const { id } = await params;
    const adminClient = getAdminClient();

    const { data, error } = await adminClient
      .from("products")
      .select("*, category:categories(*)")
      .eq("id", id)
      .eq("tenant_id", tenantId)
      .single();

    if (error) {
      if (error.code === "PGRST116") {
        return NextResponse.json({ error: "Product not found" }, { status: 404 });
      }
      throw error;
    }

    return NextResponse.json({ data });
  } catch (error: unknown) {
    if (error instanceof V1AuthError) {
      return NextResponse.json({ error: error.message }, { status: error.status });
    }
    return NextResponse.json(
      { error: "Erro ao buscar produto" },
      { status: 500 }
    );
  }
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { tenantId } = await authenticateV1Request(req);
    const { id } = await params;
    const adminClient = getAdminClient();
    const body = await req.json();

    const parsed = updateProductSchema.safeParse(body);
    if (!parsed.success) {
      const firstError = parsed.error.issues[0];
      return NextResponse.json(
        { error: firstError?.message || "Dados invalidos" },
        { status: 400 }
      );
    }

    const { data, error } = await adminClient
      .from("products")
      .update(parsed.data)
      .eq("id", id)
      .eq("tenant_id", tenantId)
      .select()
      .single();

    if (error) {
      if (error.code === "PGRST116") {
        return NextResponse.json({ error: "Produto nao encontrado" }, { status: 404 });
      }
      throw error;
    }

    return NextResponse.json({ data });
  } catch (error: unknown) {
    if (error instanceof V1AuthError) {
      return NextResponse.json({ error: error.message }, { status: error.status });
    }
    return NextResponse.json(
      { error: "Erro ao atualizar produto" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { tenantId } = await authenticateV1Request(req);
    const { id } = await params;
    const adminClient = getAdminClient();

    // Archive instead of hard-delete (soft delete)
    const { error } = await adminClient
      .from("products")
      .update({ archived_at: new Date().toISOString() })
      .eq("id", id)
      .eq("tenant_id", tenantId);

    if (error) {
      if (error.code === "PGRST116") {
        return NextResponse.json({ error: "Product not found" }, { status: 404 });
      }
      throw error;
    }

    return NextResponse.json({ success: true, message: "Product archived" });
  } catch (error: unknown) {
    if (error instanceof V1AuthError) {
      return NextResponse.json({ error: error.message }, { status: error.status });
    }
    return NextResponse.json(
      { error: "Erro ao arquivar produto" },
      { status: 500 }
    );
  }
}
