import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { NextRequest, NextResponse } from "next/server";
import { registerSchema } from "@/lib/validations";
import { checkRateLimit } from "@/lib/rate-limiter";

export async function POST(request: NextRequest) {
  try {
    // Rate limiting via Supabase
    const rateLimit = await checkRateLimit(request);
    if (!rateLimit.allowed) {
      return NextResponse.json(
        { error: "Muitas tentativas. Tente novamente em " + rateLimit.resetIn + " segundos." },
        {
          status: 429,
          headers: {
            "Retry-After": String(rateLimit.resetIn),
            "X-RateLimit-Remaining": "0",
          },
        }
      );
    }

    const body = await request.json();
    const parsed = registerSchema.safeParse(body);

    if (!parsed.success) {
      const firstError = parsed.error.issues[0];
      return NextResponse.json(
        { error: firstError?.message || "Dados invalidos" },
        { status: 400 }
      );
    }

    const { name, email, password, companyName, cpf, cnpj } = parsed.data;

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    if (!supabaseUrl || !supabaseKey) {
      console.error("[api/register] Missing env vars:", { url: !!supabaseUrl, key: !!supabaseKey });
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

    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { name, tenant_name: companyName, cpf: cpf || null, cnpj: cnpj || null },
        emailRedirectTo: `${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/callback`,
      },
    });

    if (error) {
      console.error("[api/register] supabase error:", error.message);
      return NextResponse.json({ error: "Erro ao criar conta. Tente novamente." }, { status: 400 });
    }

    if (data?.user?.identities?.length === 0) {
      return NextResponse.json(
        { error: "Este email ja esta cadastrado. Faca login." },
        { status: 409 }
      );
    }

    // Update profile with CPF after user is created
    if (data?.user?.id && cpf) {
      try {
        const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
        if (serviceKey) {
          const adminSupabase = createServerClient(supabaseUrl, serviceKey, {
            cookies: {
              getAll() { return []; },
              setAll() {},
            },
          });

          // Update profile with CPF
          await adminSupabase
            .from("profiles")
            .update({ cpf })
            .eq("id", data.user.id);

          // Update tenant with CNPJ if provided
          if (cnpj) {
            const { data: profile } = await adminSupabase
              .from("profiles")
              .select("tenant_id")
              .eq("id", data.user.id)
              .single();

            if (profile?.tenant_id) {
              await adminSupabase
                .from("tenants")
                .update({ cnpj })
                .eq("id", profile.tenant_id);
            }
          }
        }
      } catch (postErr) {
        console.error("[api/register] post-signup update error:", postErr);
        // Non-critical: user was created, CPF/CNPJ update is best-effort
      }
    }

    console.log("[api/register] success for", email);
    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("[api/register] unexpected error:", err);
    return NextResponse.json({ error: "Erro interno do servidor" }, { status: 500 });
  }
}
