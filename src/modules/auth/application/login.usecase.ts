import type { SupabaseClient } from "@supabase/supabase-js";
import type { LoginRequest, AuthSession } from "../domain/auth.types";
import { InvalidCredentialsError } from "../domain/auth.errors";

export async function loginUseCase(
  supabase: SupabaseClient,
  request: LoginRequest
): Promise<AuthSession> {
  const { data, error } = await supabase.auth.signInWithPassword({
    email: request.email,
    password: request.password,
  });

  if (error || !data.user) {
    throw new InvalidCredentialsError();
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", data.user.id)
    .single();

  if (!profile) {
    throw new InvalidCredentialsError();
  }

  return {
    user: { id: data.user.id, email: data.user.email },
    tenantId: profile.tenant_id,
    profile: { id: profile.id, name: profile.name, role: profile.role },
  };
}
