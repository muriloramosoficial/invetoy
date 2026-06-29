"use server";

import { getBrowserClient } from "@infra/database/supabase/client";
import type { LoginRequest, RegisterRequest } from "../../domain/auth.types";
import { getProfileUseCase } from "../../../identity/application/get-profile.usecase";

export async function loginAction(data: LoginRequest) {
  const supabase = getBrowserClient();

  const { error } = await supabase.auth.signInWithPassword({
    email: data.email,
    password: data.password,
  });

  if (error) {
    return { success: false, error: "Email ou senha inválidos" };
  }

  return { success: true, error: null };
}

export async function registerAction(data: RegisterRequest) {
  const supabase = getBrowserClient();

  const { data: authData, error: authError } = await supabase.auth.signUp({
    email: data.email,
    password: data.password,
  });

  if (authError || !authData.user) {
    return { success: false, error: authError?.message || "Erro ao criar conta" };
  }

  const slug = data.tenantName
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");

  const { data: tenant, error: tenantError } = await supabase
    .from("tenants")
    .insert({ name: data.tenantName, slug, plan: "free", locale: "pt-BR" })
    .select()
    .single();

  if (tenantError || !tenant) {
    await supabase.auth.admin.deleteUser(authData.user.id);
    return { success: false, error: "Erro ao criar organização" };
  }

  const { error: profileError } = await supabase.from("profiles").insert({
    id: authData.user.id,
    tenant_id: tenant.id,
    email: data.email,
    name: data.name,
    role: "admin",
  });

  if (profileError) {
    await supabase.from("tenants").delete().eq("id", tenant.id);
    await supabase.auth.admin.deleteUser(authData.user.id);
    return { success: false, error: "Erro ao criar perfil" };
  }

  return { success: true, error: null };
}

export async function logoutAction() {
  const supabase = getBrowserClient();
  await supabase.auth.signOut();
}
