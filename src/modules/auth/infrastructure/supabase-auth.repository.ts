import { SupabaseClient } from "@supabase/supabase-js";
import { SupabaseRepository } from "@infra/database/supabase/repository.helper";
import type { Profile } from "@modules/identity/domain/identity.types";

export class SupabaseAuthRepository extends SupabaseRepository {
  async getProfileByUserId(userId: string): Promise<Profile | null> {
    const { data, error } = await this.getClient()
      .from("profiles")
      .select("*")
      .eq("id", userId)
      .single();

    if (error) return null;
    return data as Profile;
  }

  async createProfile(profile: {
    id: string;
    tenant_id: string;
    email: string;
    name: string;
    role: string;
  }): Promise<void> {
    const { error } = await this.getClient()
      .from("profiles")
      .insert(profile);

    if (error) throw this.handleError(error);
  }
}
