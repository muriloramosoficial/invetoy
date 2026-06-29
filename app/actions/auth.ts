"use server";

import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { registerUseCase } from "@/src/modules/auth/application/register.usecase";

async function createSupabaseServerClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error("Supabase nao configurado. Verifique .env.local");
  }

  const cookieStore = await cookies();

  return createServerClient(supabaseUrl, supabaseAnonKey, {
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll(cookiesToSet) {
        try {
          cookiesToSet.forEach(({ name, value, options }) =>
            cookieStore.set(name, value, options)
          );
        } catch (err) {
          console.error("[auth] cookie set error:", err);
        }
      },
    },
  });
}

export async function login(formData: { email: string; password: string }) {
  console.log("[login] called for", formData.email);

  const supabase = await createSupabaseServerClient();
  const { error } = await supabase.auth.signInWithPassword(formData);
  if (error) return { error: error.message };

  redirect("/dashboard");
}

export async function register(formData: {
  name: string;
  email: string;
  password: string;
  companyName: string;
}) {
  console.log("[register] called for", formData.email);

  try {
    const supabase = await createSupabaseServerClient();
    await registerUseCase(supabase, {
      name: formData.name,
      email: formData.email,
      password: formData.password,
      tenantName: formData.companyName,
    });
    return { success: true };
  } catch (err: any) {
    return { error: err.message || "Erro ao criar conta" };
  }
}

export async function sendMagicLink(email: string) {
  console.log("[sendMagicLink] called for", email);

  const supabase = await createSupabaseServerClient();
  const { error } = await supabase.auth.signInWithOtp({
    email,
    options: {
      emailRedirectTo: `${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/callback`,
    },
  });

  if (error) return { error: error.message };
  return { success: true };
}
