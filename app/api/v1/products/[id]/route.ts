import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { authenticateV1Request, V1AuthError } from "@/lib/api/v1-auth";

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
      { error: "Failed to fetch product", message: error instanceof Error ? error.message : String(error) },
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

    const { data, error } = await adminClient
      .from("products")
      .update(body)
      .eq("id", id)
      .eq("tenant_id", tenantId)
      .select()
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
      { error: "Failed to update product", message: error instanceof Error ? error.message : String(error) },
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
      { error: "Failed to archive product", message: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    );
  }
}
