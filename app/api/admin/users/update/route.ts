import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { action, userId, ...params } = body;

    if (!action || !userId) {
      return NextResponse.json({ error: "action e userId sao obrigatorios" }, { status: 400 });
    }

    const supabase = createAdminClient();

    // Verify requesting user is a system admin or staff
    const { data: { user: adminUser } } = await supabase.auth.getUser();
    if (!adminUser) {
      return NextResponse.json({ error: "Nao autenticado" }, { status: 401 });
    }

    const { data: adminProfile } = await supabase
      .from("profiles")
      .select("is_system_admin, is_staff")
      .eq("id", adminUser.id)
      .single();

    if (!adminProfile?.is_system_admin && !adminProfile?.is_staff) {
      return NextResponse.json({ error: "Acesso negado" }, { status: 403 });
    }

    switch (action) {
      // ─── Toggle System Admin ───
      case "toggle-admin": {
        const { is_system_admin } = params;

        const { error } = await supabase
          .from("profiles")
          .update({ is_system_admin })
          .eq("id", userId);

        if (error) throw error;

        return NextResponse.json({ success: true, message: `Admin do sistema ${is_system_admin ? "adicionado" : "removido"} com sucesso` });
      }

      // ─── Toggle Staff ───
      case "toggle-staff": {
        const { is_staff } = params;

        const { error } = await supabase
          .from("profiles")
          .update({ is_staff })
          .eq("id", userId);

        if (error) throw error;

        return NextResponse.json({ success: true, message: `Funcionario ${is_staff ? "adicionado" : "removido"} com sucesso` });
      }

      // ─── Change Role ───
      case "change-role": {
        const { role } = params;

        if (!["user", "operator", "manager", "admin"].includes(role)) {
          return NextResponse.json({ error: "Funcao invalida" }, { status: 400 });
        }

        const { error } = await supabase
          .from("profiles")
          .update({ role })
          .eq("id", userId);

        if (error) throw error;

        return NextResponse.json({ success: true, message: `Funcao alterada para "${role}" com sucesso` });
      }

      default:
        return NextResponse.json({ error: `Acao desconhecida: ${action}` }, { status: 400 });
    }
  } catch (err) {
    console.error("[Admin User Update Error]", err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Erro ao processar requisicao" },
      { status: 500 }
    );
  }
}