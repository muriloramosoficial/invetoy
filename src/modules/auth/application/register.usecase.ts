import type { SupabaseClient } from "@supabase/supabase-js";
import type { RegisterRequest } from "../domain/auth.types";
import { EmailAlreadyRegisteredError } from "../domain/auth.errors";

interface RegisterResult {
  userId: string;
  tenantId: string;
}

export async function registerUseCase(
  supabase: SupabaseClient,
  request: RegisterRequest
): Promise<RegisterResult> {
  const { data: authData, error: authError } = await supabase.auth.signUp({
    email: request.email,
    password: request.password,
    options: {
      data: {
        name: request.name,
        tenant_name: request.tenantName,
      },
      emailRedirectTo: `${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/callback`,
    },
  });

  if (authError || !authData.user) {
    throw new Error(authError?.message || "Erro ao criar conta");
  }

  if (authData?.user?.identities?.length === 0) {
    throw new EmailAlreadyRegisteredError();
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("tenant_id")
    .eq("id", authData.user.id)
    .single();

  return {
    userId: authData.user.id,
    tenantId: profile?.tenant_id || "",
  };
}
