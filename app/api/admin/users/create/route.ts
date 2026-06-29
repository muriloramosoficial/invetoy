import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { createClient as createServerClient } from "@/lib/supabase/server";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, password, name, role, tenantId } = body;

    if (!email || !password || !name) {
      return NextResponse.json(
        { error: "Campos obrigatorios: email, password, name" },
        { status: 400 }
      );
    }

    if (password.length < 6) {
      return NextResponse.json(
        { error: "A senha deve ter no minimo 6 caracteres" },
        { status: 400 }
      );
    }

    // Authenticate current user
    const supabase = await createServerClient();
    const { data: { user: currentUser } } = await supabase.auth.getUser();
    if (!currentUser) {
      return NextResponse.json({ error: "Nao autenticado" }, { status: 401 });
    }

    // Check if current user is system admin/staff OR admin of the target tenant
    const { data: currentProfile } = await supabase
      .from("profiles")
      .select("is_system_admin, is_staff, tenant_id, role")
      .eq("id", currentUser.id)
      .single();

    const isSystemAdmin = currentProfile?.is_system_admin || currentProfile?.is_staff;
    const isTenantAdmin = tenantId && currentProfile?.tenant_id === tenantId && currentProfile?.role === "admin";

    if (!isSystemAdmin && !isTenantAdmin) {
      return NextResponse.json(
        { error: "Sem permissao para criar usuarios" },
        { status: 403 }
      );
    }

    // Use service role to create the user
    const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
    if (!serviceKey) {
      return NextResponse.json({ error: "Servico nao configurado" }, { status: 500 });
    }

    const adminClient = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      serviceKey,
      { auth: { autoRefreshToken: false, persistSession: false } }
    );

    // Check if email already exists
    const { data: existingUsers } = await adminClient
      .from("profiles")
      .select("id")
      .eq("email", email)
      .maybeSingle();

    if (existingUsers) {
      return NextResponse.json(
        { error: "Este email ja esta cadastrado" },
        { status: 409 }
      );
    }

    // Create auth user
    const { data: authData, error: authError } = await adminClient.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: {
        name,
        tenant_name: "",
      },
    });

    if (authError) {
      console.error("[api/admin/users/create] Auth error:", authError);
      return NextResponse.json(
        { error: "Erro ao criar usuario: " + authError.message },
        { status: 400 }
      );
    }

    if (!authData?.user?.id) {
      return NextResponse.json(
        { error: "Erro ao criar usuario" },
        { status: 500 }
      );
    }

    // Update profile with tenant and role
    const updateData: Record<string, string> = {
      name,
      email,
      role: role || "operator",
    };
    if (tenantId) updateData.tenant_id = tenantId;

    const { error: profileError } = await adminClient
      .from("profiles")
      .update(updateData)
      .eq("id", authData.user.id);

    if (profileError) {
      console.error("[api/admin/users/create] Profile update error:", profileError);
    }

    console.log(`[api/admin/users/create] Created user ${email}`);
    return NextResponse.json({
      success: true,
      message: `Usuario ${name} criado com sucesso`,
      user: {
        id: authData.user.id,
        email,
        name,
        role: role || "operator",
      },
    });
  } catch (err) {
    console.error("[api/admin/users/create] Error:", err);
    return NextResponse.json(
      { error: "Erro interno do servidor" },
      { status: 500 }
    );
  }
}
