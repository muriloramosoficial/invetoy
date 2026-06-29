/**
 * INVENTOY — Create profiles and tenants for existing auth users
 * 
 * This script checks if users exist in auth.users but don't have
 * corresponding profiles, and creates them manually.
 * 
 * Usage: node scripts/create-profiles.mjs
 */
import { createClient } from "@supabase/supabase-js";
import { readFileSync, existsSync } from "fs";
import { resolve, dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));

// Load env manually
function loadEnv() {
  const envPath = resolve(__dirname, "../.env.local");
  if (!existsSync(envPath)) return;
  const content = readFileSync(envPath, "utf-8");
  for (const line of content.split("\n")) {
    const trimmed = line.trim();
    if (trimmed && !trimmed.startsWith("#")) {
      const eqIdx = trimmed.indexOf("=");
      if (eqIdx > 0) {
        process.env[trimmed.slice(0, eqIdx)] = trimmed.slice(eqIdx + 1);
      }
    }
  }
}
loadEnv();

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !SERVICE_ROLE_KEY) {
  console.error("❌ Missing env vars");
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SERVICE_ROLE_KEY);

async function main() {
  console.log("🚀 Creating profiles and tenants for existing users...\n");

  // Step 1: Get all users from Auth
  const { data: authData, error: authError } = await supabase.auth.admin.listUsers();
  if (authError) {
    console.error("❌ Failed to list users:", authError.message);
    process.exit(1);
  }

  const users = authData.users;
  console.log(`📋 Found ${users.length} auth users\n`);

  // Step 2: Try to query tenants table
  const { data: existingTenants, error: tenantQueryError } = await supabase
    .from("tenants")
    .select("id, name, slug");

  if (tenantQueryError) {
    console.error("❌ Cannot query tenants table:", tenantQueryError.message);
    console.log("   The SQL schema may not have been executed yet.");
    console.log("   Please run the SQL schema in Supabase SQL Editor first.\n");
    console.log("   https://supabase.com/dashboard/project/mjkeznlmhtskrekywnfg/sql/new");
    process.exit(1);
  }

  console.log(`✅ Tenants table is accessible (${existingTenants?.length || 0} existing)\n`);

  // Step 3: Check profiles table
  const { data: existingProfiles } = await supabase
    .from("profiles")
    .select("id, email");

  const existingProfileIds = new Set(existingProfiles?.map((p) => p.id) || []);
  console.log(`✅ Profiles table is accessible (${existingProfiles?.length || 0} existing)\n`);

  // Step 4: For each user without a profile, create tenant + profile
  let created = 0;
  for (const user of users) {
    if (existingProfileIds.has(user.id)) {
      console.log(`  ⏭️  ${user.email}: profile already exists`);
      continue;
    }

    const name = user.user_metadata?.name || user.email?.split("@")[0] || "User";
    const tenantName = user.user_metadata?.tenant_name || `${name}'s Company`;
    const slug = tenantName
      .toLowerCase()
      .replace(/[^a-z0-9]/g, "-")
      .replace(/-+/g, "-")
      .replace(/^-|-$/g, "");

    const role = user.email === "funcionario@empresa.com.br" ? "operator" : "admin";

    try {
      // Check if tenant already exists
      let tenantId = null;
      const existingTenant = existingTenants?.find((t) => t.slug === slug);
      if (existingTenant) {
        tenantId = existingTenant.id;
        console.log(`  📁 ${user.email}: using existing tenant "${existingTenant.name}"`);
      } else {
        // Create tenant via direct insert
        const { data: newTenant, error: tenantErr } = await supabase
          .from("tenants")
          .insert({
            name: tenantName,
            slug: slug + "-" + Math.random().toString(36).slice(2, 6),
            plan: "free",
            locale: "pt-BR",
          })
          .select("id")
          .single();

        if (tenantErr) {
          console.error(`  ❌ ${user.email}: tenant insert failed - ${tenantErr.message}`);
          continue;
        }
        tenantId = newTenant.id;
        console.log(`  🏢 ${user.email}: created tenant "${tenantName}" (${tenantId.slice(0, 8)})`);
      }

      // Create profile
      const { error: profileErr } = await supabase.from("profiles").insert({
        id: user.id,
        tenant_id: tenantId,
        email: user.email,
        name,
        role,
      });

      if (profileErr) {
        console.error(`  ❌ ${user.email}: profile insert failed - ${profileErr.message}`);
        continue;
      }

      console.log(`  ✅ ${user.email}: profile created (role: ${role})`);
      created++;
    } catch (err) {
      console.error(`  ❌ ${user.email}: error - ${err.message}`);
    }
  }

  console.log(`\n${'═'.repeat(50)}`);
  console.log(`Created ${created} new profile(s)`);
  console.log(`Total: ${users.length} auth users, ${existingProfiles?.length + created} profiles`);
  console.log(`${'═'.repeat(50)}\n`);
}

main().catch(console.error);
