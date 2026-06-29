import { NextRequest, NextResponse } from "next/server";
import { createHash, randomBytes } from "crypto";
import { createClient } from "@/lib/supabase/server";
import { createStaffApiKeySchema } from "@/lib/validations";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const parsed = createStaffApiKeySchema.safeParse(body);
    if (!parsed.success) {
      const firstError = parsed.error.issues[0];
      return NextResponse.json(
        { error: firstError?.message || "Dados invalidos" },
        { status: 400 }
      );
    }

    const { name, permissions } = parsed.data;

    const supabase = await createClient();

    // Verify admin/staff
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: "Não autenticado" }, { status: 401 });
    }

    const { data: profile } = await supabase
      .from("profiles")
      .select("is_system_admin")
      .eq("id", user.id)
      .single();

    if (!profile?.is_system_admin) {
      return NextResponse.json({ error: "Acesso negado" }, { status: 403 });
    }

    // Generate cryptographically secure key
    const rawKey = `inv_${randomBytes(32).toString("base64url")}`;
    const prefix = rawKey.slice(0, 7);
    const hash = createHash("sha256").update(rawKey).digest("hex");

    // Store only hash + prefix in DB
    const { error: insertError } = await supabase.from("api_keys").insert({
      name: name.trim(),
      key_prefix: prefix,
      key_hash: hash,
      permissions: permissions || ["read"],
      is_active: true,
    });

    if (insertError) throw insertError;

    // Return the raw key ONCE to the user
    return NextResponse.json({
      key: rawKey,
      prefix,
      message: "Chave criada com sucesso! Copie agora, ela não será exibida novamente.",
    });
  } catch (err) {
    console.error("[api/admin/api-keys] Error:", err);
    return NextResponse.json(
      { error: "Erro ao criar chave de API" },
      { status: 500 }
    );
  }
}
