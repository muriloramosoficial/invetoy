import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { updatePlanSchema } from "@/lib/validations";

// GET - Public endpoint (landing page, subscription page)
// Returns plan configs without requiring authentication
export async function GET() {
  try {
    // Try authenticated first, fall back to public access
    let supabase;
    try {
      supabase = await createClient();
    } catch {
      // If auth fails, create a basic client
      const { createClient: createBrowserClient } = await import("@supabase/supabase-js");
      supabase = createBrowserClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
      );
    }

    const { data: plans, error } = await supabase
      .from("plan_configs")
      .select("*")
      .order("sort_order", { ascending: true });

    if (error) {
      // Table might not exist yet (migration not run)
      if (error.message?.includes("does not exist") || error.message?.includes("relation")) {
        return NextResponse.json([]);
      }
      throw error;
    }
    return NextResponse.json(plans || []);
  } catch (err) {
    console.error("Failed to load plan configs:", err);
    return NextResponse.json({ error: "Erro ao carregar planos" }, { status: 500 });
  }
}

// PUT - Admin only (protected)
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const parsed = updatePlanSchema.safeParse(body);
    if (!parsed.success) {
      const firstError = parsed.error.issues[0];
      return NextResponse.json(
        { error: firstError?.message || "Dados invalidos" },
        { status: 400 }
      );
    }

    const { id, ...data } = parsed.data;

    const supabase = await createClient();

    // Check if user is system admin
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: "Nao autenticado" }, { status: 401 });

    const { data: profile } = await supabase
      .from("profiles")
      .select("is_system_admin, is_staff")
      .eq("id", user.id)
      .single();

    if (!profile?.is_system_admin && !profile?.is_staff) {
      return NextResponse.json({ error: "Acesso negado" }, { status: 403 });
    }

    const { error } = await supabase
      .from("plan_configs")
      .update({ ...data, updated_at: new Date().toISOString() })
      .eq("id", id);

    if (error) throw error;

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("Failed to update plan config:", err);
    return NextResponse.json({ error: "Erro ao salvar plano" }, { status: 500 });
  }
}
