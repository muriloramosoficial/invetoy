"use server";

import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";

export async function login(formData: { email: string; password: string }) {
  const supabase = await createClient();
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
  const supabase = await createClient();
  const { data, error } = await supabase.auth.signUp({
    email: formData.email,
    password: formData.password,
    options: {
      data: { name: formData.name, tenant_name: formData.companyName },
      emailRedirectTo: `${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/callback`,
    },
  });
  if (error) return { error: error.message };
  if (data?.user?.identities?.length === 0) {
    return { error: "Este email ja esta cadastrado. Faca login." };
  }
  return { success: true };
}

export async function sendMagicLink(email: string) {
  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithOtp({
    email,
    options: {
      emailRedirectTo: `${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/callback`,
    },
  });
  if (error) return { error: error.message };
  return { success: true };
}
