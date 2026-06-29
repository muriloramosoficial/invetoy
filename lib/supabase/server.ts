import { cookies } from "next/headers";
import { getServerClient } from "@/src/infrastructure/database/supabase/client";

export async function createClient() {
  const cookieStore = await cookies();
  return getServerClient(cookieStore);
}