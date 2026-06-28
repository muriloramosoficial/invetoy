import "server-only";
import { createClient } from "@supabase/supabase-js";
import { createHash, randomBytes } from "crypto";

interface ApiAuthResult {
  authenticated: boolean;
  tenantId: string | null;
  userId: string | null;
  error: string | null;
  status: number;
}

function hashApiKey(key: string): string {
  return createHash("sha256").update(key).digest("hex");
}

function generateApiKey(): { raw: string; prefix: string; hash: string } {
  const raw = `inv_${randomBytes(24).toString("base64url")}`;
  const prefix = raw.slice(0, 12);
  const hash = hashApiKey(raw);
  return { raw, prefix, hash };
}

async function getServiceClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } }
  );
}

export async function authenticateApiRequest(
  request: Request
): Promise<ApiAuthResult> {
  const authHeader = request.headers.get("authorization");

  if (authHeader?.startsWith("Bearer ")) {
    const apiKey = authHeader.slice(7).trim();

    if (!apiKey || apiKey.length < 20) {
      return { authenticated: false, tenantId: null, userId: null, error: "Invalid API key format", status: 401 };
    }

    const keyHash = hashApiKey(apiKey);
    const prefix = apiKey.slice(0, 12);

    const supabase = await getServiceClient();
    const { data: keyRecord, error } = await supabase
      .from("api_keys")
      .select("tenant_id, revoked_at, expires_at")
      .eq("key_hash", keyHash)
      .eq("key_prefix", prefix)
      .single();

    if (error || !keyRecord) {
      return { authenticated: false, tenantId: null, userId: null, error: "Invalid API key", status: 401 };
    }

    if (keyRecord.revoked_at) {
      return { authenticated: false, tenantId: null, userId: null, error: "API key revoked", status: 401 };
    }

    if (keyRecord.expires_at && new Date(keyRecord.expires_at) < new Date()) {
      return { authenticated: false, tenantId: null, userId: null, error: "API key expired", status: 401 };
    }

    return { authenticated: true, tenantId: keyRecord.tenant_id, userId: null, error: null, status: 200 };
  }

  return { authenticated: false, tenantId: null, userId: null, error: null, status: 401 };
}

export async function createApiKey(
  tenantId: string,
  name: string
): Promise<{ key: string | null; error: string | null }> {
  const supabase = await getServiceClient();

  const { raw, prefix, hash } = generateApiKey();

  const { error } = await supabase.from("api_keys").insert({
    tenant_id: tenantId,
    name,
    key_hash: hash,
    key_prefix: prefix,
  });

  if (error) {
    console.error("Failed to create API key:", error);
    return { key: null, error: "Failed to create API key" };
  }

  return { key: raw, error: null };
}

export async function revokeApiKey(keyId: string, tenantId: string): Promise<{ error: string | null }> {
  const supabase = await getServiceClient();
  const { error } = await supabase
    .from("api_keys")
    .update({ revoked_at: new Date().toISOString() })
    .eq("id", keyId)
    .eq("tenant_id", tenantId);

  if (error) {
    return { error: "Failed to revoke API key" };
  }
  return { error: null };
}

export async function listApiKeys(tenantId: string) {
  const supabase = await getServiceClient();
  const { data, error } = await supabase
    .from("api_keys")
    .select("id, name, key_prefix, created_at, last_used_at, revoked_at, expires_at")
    .eq("tenant_id", tenantId)
    .order("created_at", { ascending: false });

  if (error) throw error;
  return data || [];
}

export async function checkPlanAccess(tenantId: string, feature: string): Promise<boolean> {
  const supabase = await getServiceClient();
  const { data } = await supabase.rpc("check_plan_feature", {
    p_tenant_id: tenantId,
    p_feature: feature,
  });
  return data ?? false;
}

export { generateApiKey };
