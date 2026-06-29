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

    // Verify requesting user is a system admin
    const { data: { user: adminUser } } = await supabase.auth.getUser();
    if (!adminUser) {
      return NextResponse.json({ error: "Nao autenticado" }, { status: 401 });
    }

    const { data: adminProfile } = await supabase
      .from("profiles")
      .select("is_system_admin")
      .eq("id", adminUser.id)
      .single();

    if (!adminProfile?.is_system_admin) {
      return NextResponse.json({ error: "Acesso negado" }, { status: 403 });
    }

    switch (action) {
      // ─── Change Password ───
      case "change-password": {
        const { newPassword } = params;
        if (!newPassword || newPassword.length < 6) {
          return NextResponse.json({ error: "Senha deve ter no minimo 6 caracteres" }, { status: 400 });
        }

        const { error } = await supabase.auth.admin.updateUserById(userId, {
          password: newPassword,
        });

        if (error) throw error;

        return NextResponse.json({ success: true, message: "Senha alterada com sucesso!" });
      }

      // ─── Suspend User ───
      case "suspend": {
        const { reason } = params;

        const { error } = await supabase
          .from("profiles")
          .update({
            status: "suspended",
            suspended_at: new Date().toISOString(),
            suspended_by: adminUser.id,
            suspended_reason: reason || null,
          })
          .eq("id", userId);

        if (error) throw error;

        return NextResponse.json({ success: true, message: "Usuario suspenso com sucesso!" });
      }

      // ─── Unsuspend User ───
      case "unsuspend": {
        const { error } = await supabase
          .from("profiles")
          .update({
            status: "active",
            suspended_at: null,
            suspended_by: null,
            suspended_reason: null,
          })
          .eq("id", userId);

        if (error) throw error;

        return NextResponse.json({ success: true, message: "Suspensao removida com sucesso!" });
      }

      // ─── Ban User ───
      case "ban": {
        const { reason } = params;

        const { error } = await supabase
          .from("profiles")
          .update({
            status: "banned",
            banned_at: new Date().toISOString(),
            banned_by: adminUser.id,
            banned_reason: reason || null,
          })
          .eq("id", userId);

        if (error) throw error;

        return NextResponse.json({ success: true, message: "Usuario banido com sucesso!" });
      }

      // ─── Unban User ───
      case "unban": {
        const { error } = await supabase
          .from("profiles")
          .update({
            status: "active",
            banned_at: null,
            banned_by: null,
            banned_reason: null,
          })
          .eq("id", userId);

        if (error) throw error;

        return NextResponse.json({ success: true, message: "Banimento removido com sucesso!" });
      }

      default:
        return NextResponse.json({ error: `Acao desconhecida: ${action}` }, { status: 400 });
    }
  } catch (err) {
    console.error("[Admin User Management Error]", err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Erro ao processar requisicao" },
      { status: 500 }
    );
  }
}
