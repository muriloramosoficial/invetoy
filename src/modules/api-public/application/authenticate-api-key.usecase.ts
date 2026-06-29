import { createHash } from "crypto";
import { SupabaseClient } from "@supabase/supabase-js";

interface AuthResult {
  tenantId: string;
}

function hashApiKey(key: string): string {
  return createHash("sha256").update(key).digest("hex");
}

export async function authenticateApiKeyUseCase(
  supabase: SupabaseClient,
  apiKey: string
): Promise<AuthResult> {
  if (!apiKey || apiKey.length < 20) {
    throw new Error("Invalid API key format");
  }

  const keyHash = hashApiKey(apiKey);
  const prefix = apiKey.slice(0, 12);

  const { data: keyRecord, error } = await supabase
    .from("api_keys")
    .select("tenant_id, revoked_at, expires_at")
    .eq("key_hash", keyHash)
    .eq("key_prefix", prefix)
    .single();

  if (error || !keyRecord) {
    throw new Error("Invalid API key");
  }

  if (keyRecord.revoked_at) {
    throw new Error("API key revoked");
  }

  if (keyRecord.expires_at && new Date(keyRecord.expires_at) < new Date()) {
    throw new Error("API key expired");
  }

  return { tenantId: keyRecord.tenant_id };
}
