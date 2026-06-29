import { SupabaseClient } from "@supabase/supabase-js";

interface CreateUserInput {
  email: string;
  password: string;
  name: string;
  role: string;
  tenant_id: string;
}

export async function createUserUseCase(
  supabase: SupabaseClient,
  input: CreateUserInput
): Promise<{ id: string }> {
  const { data: authData, error: authError } = await supabase.auth.admin.inviteUserByEmail(
    input.email
  );

  if (authError || !authData.user) {
    throw new Error("Erro ao criar usuário");
  }

  const { error: profileError } = await supabase.from("profiles").insert({
    id: authData.user.id,
    email: input.email,
    name: input.name,
    role: input.role,
    tenant_id: input.tenant_id,
  });

  if (profileError) {
    await supabase.auth.admin.deleteUser(authData.user.id);
    throw new Error("Erro ao criar perfil");
  }

  return { id: authData.user.id };
}
