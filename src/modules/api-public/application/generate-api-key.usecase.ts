import { createHash, randomBytes } from "crypto";
import { SupabaseClient } from "@supabase/supabase-js";

function generateApiKeyRaw(): { raw: string; prefix: string; hash: string } {
  const raw = `inv_${randomBytes(24).toString("base64url")}`;
  const prefix = raw.slice(0, 12);
  const hash = createHash("sha256").update(raw).digest("hex");
  return { raw, prefix, hash };
}

interface GenerateResult {
  key: string;
  error: string | null;
}

export async function generateApiKeyUseCase(
  supabase: SupabaseClient,
  tenantId: string,
  name: string
): Promise<GenerateResult> {
  const { raw, prefix, hash } = generateApiKeyRaw();

  const { error } = await supabase.from("api_keys").insert({
    tenant_id: tenantId,
    name,
    key_hash: hash,
    key_prefix: prefix,
  });

  if (error) {
    return { key: "", error: "Failed to create API key" };
  }

  return { key: raw, error: null };
}
