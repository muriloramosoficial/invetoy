import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json();

    if (!email || !password) {
      return NextResponse.json({ error: "Preencha todos os campos" }, { status: 400 });
    }

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    if (!supabaseUrl || !supabaseKey) {
      console.error("[api/login] Missing env vars:", { url: !!supabaseUrl, key: !!supabaseKey });
      return NextResponse.json({ error: "Supabase nao configurado. Verifique .env.local" }, { status: 500 });
    }

    const cookieStore = await cookies();

    const supabase = createServerClient(supabaseUrl, supabaseKey, {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            );
          } catch {
            // setAll called from Server Component — ignored
          }
        },
      },
    });

    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) {
      console.error("[api/login] supabase error:", error.message);
      return NextResponse.json({ error: error.message }, { status: 401 });
    }

    console.log("[api/login] success for", email);
    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("[api/login] unexpected error:", err);
    return NextResponse.json({ error: `Erro interno: ${err instanceof Error ? err.message : String(err)}` }, { status: 500 });
  }
}
