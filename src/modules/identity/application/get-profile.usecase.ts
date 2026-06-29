import { SupabaseClient } from "@supabase/supabase-js";
import type { Profile } from "../domain/identity.types";

export async function getProfileUseCase(
  supabase: SupabaseClient,
  userId: string
): Promise<Profile> {
  const { data, error } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", userId)
    .single();

  if (error || !data) {
    throw new Error("Perfil não encontrado");
  }

  return data as Profile;
}
