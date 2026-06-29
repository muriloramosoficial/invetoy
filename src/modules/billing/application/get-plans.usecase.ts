import { SupabaseClient } from "@supabase/supabase-js";
import type { Plan } from "../domain/plan.types";

export async function getPlansUseCase(supabase: SupabaseClient): Promise<Plan[]> {
  const { data, error } = await supabase
    .from("plans")
    .select("*")
    .order("price_brl", { ascending: true });

  if (error) throw error;
  return (data || []) as Plan[];
}
