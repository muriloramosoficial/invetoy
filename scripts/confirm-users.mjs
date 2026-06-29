/**
 * INVENTOY — Diagnose and fix user authentication issues
 * Checks if users exist in Auth, if they're confirmed,
 * and confirms them if needed.
 * 
 * Usage: node scripts/confirm-users.mjs
 */
import { createClient } from "@supabase/supabase-js";
import { readFileSync, existsSync } from "fs";
import { resolve, dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));

// Load env
function loadEnv() {
  const envPath = resolve(__dirname, "../.env.local");
  if (!existsSync(envPath)) return;
  const content = readFileSync(envPath, "utf-8");
  for (const line of content.split("\n")) {
    const trimmed = line.trim();
    if (trimmed && !trimmed.startsWith("#")) {
      const eqIdx = trimmed.indexOf("=");
      if (eqIdx > 0) process.env[trimmed.slice(0, eqIdx)] = trimmed.slice(eqIdx + 1);
    }
  }
}
loadEnv();

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !SERVICE_KEY) {
  console.error("❌ Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in .env.local");
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SERVICE_KEY, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
});

async function main() {
  console.log("🔍 INVENTOY — User Authentication Diagnostic\n");

  // Step 1: List all auth users
  console.log("📋 Listing all auth users...");
  const { data: authData, error: authError } = await supabase.auth.admin.listUsers();
  if (authError) {
    console.error(`❌ Failed to list users: ${authError.message}\n`);
    process.exit(1);
  }

  const users = authData.users;
  console.log(`   Found ${users.length} user(s) in Auth\n`);

  if (users.length === 0) {
    console.log("⚠️  No users found. Create users manually at:");
    console.log(`   ${SUPABASE_URL.replace('.supabase.co', '')}/dashboard/project/mjkeznlmhtskrekywnfg/auth/users\n`);
    process.exit(0);
  }

  // Step 2: Check each user's confirmation status
  console.log("📋 Checking user confirmation status...\n");
  let fixedCount = 0;

  for (const user of users) {
    const email = user.email || "unknown";
    const isConfirmed = !!user.email_confirmed_at;
    const confirmedAt = user.email_confirmed_at || user.confirmed_at || "NOT CONFIRMED";
    const createdAt = user.created_at;

    console.log(`  👤 ${email}`);
    console.log(`     ID:        ${user.id}`);
    console.log(`     Created:   ${createdAt}`);
    console.log(`     Confirmed: ${isConfirmed ? `✅ ${confirmedAt}` : "❌ NOT CONFIRMED"}`);
    
    if (user.user_metadata) {
      console.log(`     Name:      ${user.user_metadata.name || "N/A"}`);
      console.log(`     Tenant:    ${user.user_metadata.tenant_name || "N/A"}`);
    }

    // Check if user has a profile
    const { data: profile } = await supabase
      .from("profiles")
      .select("id, tenant_id, role")
      .eq("id", user.id)
      .maybeSingle();
    
    if (profile) {
      console.log(`     Profile:   ✅ Exists (role: ${profile.role}, tenant: ${profile.tenant_id.slice(0, 8)}...)`);
    } else {
      console.log(`     Profile:   ❌ MISSING`);
    }

    // Confirm user if not confirmed
    if (!isConfirmed) {
      console.log(`     🔧 Fixing: Confirming email...`);
      const { error: updateError } = await supabase.auth.admin.updateUserById(user.id, {
        email_confirm: true,
      });
      if (updateError) {
        console.log(`     ❌ Failed to confirm: ${updateError.message}`);
        // Try alternative approach: update user_metadata
        const { error: updateMetaError } = await supabase.auth.admin.updateUserById(user.id, {
          user_metadata: { ...user.user_metadata, email_confirmed: true },
        });
        if (updateMetaError) {
          console.log(`     ❌ Alternative also failed: ${updateMetaError.message}`);
        } else {
          console.log(`     ✅ Confirmed via metadata update!`);
          fixedCount++;
        }
      } else {
        console.log(`     ✅ Email confirmed!`);
        fixedCount++;
      }
    }
    
    console.log(""); // blank line
  }

  // Step 3: Try to login with test credentials
  console.log("📋 Testing login with test credentials...\n");
  const testUsers = [
    { email: "murilo@invetoy.com.br", password: "Admin@123" },
    { email: "admin@empresa.com.br", password: "Demo@123" },
    { email: "funcionario@empresa.com.br", password: "Func@123" },
  ];

  for (const { email, password } of testUsers) {
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) {
      console.log(`  ❌ ${email}: ${error.message}`);
    } else {
      console.log(`  ✅ ${email}: Login successful! (user: ${data.user?.id?.slice(0, 8)}...)`);
      // Sign out immediately
      await supabase.auth.signOut();
    }
  }

  // Step 4: Summary
  console.log("\n" + "═".repeat(50));
  if (fixedCount > 0) {
    console.log(`✅ ${fixedCount} user(s) confirmed`);
  } else {
    console.log("✅ All users already confirmed");
  }
  console.log("═".repeat(50) + "\n");

  // Step 5: Check if callback route exists
  const callbackPath = resolve(__dirname, "../app/callback/route.ts");
  if (!existsSync(callbackPath)) {
    console.log("⚠️  Missing: app/callback/route.ts");
    console.log("   This route is needed for magic link and email confirmation redirects.");
    console.log("   The app will still work for direct login (email + password).\n");
  }
}

main().catch(console.error);
