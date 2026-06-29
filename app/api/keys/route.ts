import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createApiKey, listApiKeys, revokeApiKey } from "@/lib/api/auth";
import { createApiKeySchema, revokeApiKeySchema } from "@/lib/validations";

export async function GET() {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { data: profile } = await supabase
      .from("profiles")
      .select("tenant_id")
      .eq("id", user.id)
      .single();

    if (!profile) {
      return NextResponse.json({ error: "Profile not found" }, { status: 404 });
    }

    const keys = await listApiKeys(profile.tenant_id);
    return NextResponse.json({ data: keys });
  } catch (error) {
    console.error("Failed to list API keys:", error);
    return NextResponse.json({ error: "Failed to list API keys" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { data: profile } = await supabase
      .from("profiles")
      .select("tenant_id")
      .eq("id", user.id)
      .single();

    if (!profile) {
      return NextResponse.json({ error: "Profile not found" }, { status: 404 });
    }

    const body = await req.json();
    const parsed = createApiKeySchema.safeParse(body);
    if (!parsed.success) {
      const firstError = parsed.error.issues[0];
      return NextResponse.json(
        { error: firstError?.message || "Dados invalidos" },
        { status: 400 }
      );
    }

    const { name, permissions } = parsed.data;

    const supabaseAdmin = await createClient();
    const { data: tenant } = await supabaseAdmin
      .from("tenants")
      .select("plan, subscription_status")
      .eq("id", profile.tenant_id)
      .single();

    if (!tenant) {
      return NextResponse.json({ error: "Tenant not found" }, { status: 404 });
    }

    const hasApiAccess = tenant.plan !== "free" && (tenant.subscription_status === "active" || tenant.subscription_status === "trialing");
    if (!hasApiAccess) {
      return NextResponse.json(
        { error: "API access requires Starter plan or above. Upgrade your plan." },
        { status: 403 }
      );
    }

    const { key, error } = await createApiKey(profile.tenant_id, name.trim());
    if (error) {
      return NextResponse.json({ error }, { status: 500 });
    }

    return NextResponse.json({ key }, { status: 201 });
  } catch (error) {
    console.error("Failed to create API key:", error);
    return NextResponse.json({ error: "Failed to create API key" }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { data: profile } = await supabase
      .from("profiles")
      .select("tenant_id")
      .eq("id", user.id)
      .single();

    if (!profile) {
      return NextResponse.json({ error: "Profile not found" }, { status: 404 });
    }

    const body = await req.json();
    const parsed = revokeApiKeySchema.safeParse(body);
    if (!parsed.success) {
      const firstError = parsed.error.issues[0];
      return NextResponse.json(
        { error: firstError?.message || "Dados invalidos" },
        { status: 400 }
      );
    }

    const { keyId } = parsed.data;

    const { error } = await revokeApiKey(keyId, profile.tenant_id);
    if (error) {
      return NextResponse.json({ error }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Failed to revoke API key:", error);
    return NextResponse.json({ error: "Failed to revoke API key" }, { status: 500 });
  }
}
