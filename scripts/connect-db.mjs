/**
 * INVENTOY — Database Connection Diagnostic
 * Tries multiple approaches to connect and execute SQL on Supabase.
 * 
 * Usage: node scripts/connect-db.mjs
 */
import pkg from "pg";
const { Client } = pkg;
import { readFileSync, existsSync } from "fs";
import { resolve, dirname } from "path";
import { fileURLToPath } from "url";
import { createClient } from "@supabase/supabase-js";

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
      if (eqIdx > 0) {
        process.env[trimmed.slice(0, eqIdx)] = trimmed.slice(eqIdx + 1);
      }
    }
  }
}

loadEnv();

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
const PROJECT_REF = SUPABASE_URL?.replace("https://", "").replace(".supabase.co", "");

async function tryDirectConnection(password) {
  const client = new Client({
    host: `db.${PROJECT_REF}.supabase.co`,
    port: 5432,
    database: "postgres",
    user: "postgres",
    password: password,
    ssl: { rejectUnauthorized: false },
    connectionTimeoutMillis: 10000,
  });

  try {
    await client.connect();
    console.log(`  ✅ Connected with password: ${password.substring(0, 10)}...`);
    return client;
  } catch (err) {
    console.log(`  ❌ Failed: ${err.message.substring(0, 60)}`);
    try { await client.end(); } catch {}
    return null;
  }
}

async function trySupabaseAdminAPI() {
  console.log("\n📋 Trying Supabase Admin API...");
  const supabase = createClient(SUPABASE_URL, SERVICE_ROLE_KEY);

  // Method 1: Try to query existing tables
  try {
    const { error } = await supabase.from("tenants").select("count", { count: "exact", head: true });
    if (!error) {
      console.log("  ✅ 'tenants' table exists via REST API");
      return true;
    }
    console.log(`  ❌ 'tenants' table not accessible: ${error.message}`);
  } catch (e) {
    console.log(`  ❌ REST API error: ${e.message}`);
  }
  return false;
}

async function trySupabaseAuthAPI() {
  console.log("\n📋 Trying Supabase Auth Admin API (list users)...");
  const supabase = createClient(SUPABASE_URL, SERVICE_ROLE_KEY);

  try {
    const { data, error } = await supabase.auth.admin.listUsers();
    if (!error) {
      console.log(`  ✅ Auth Admin API works! ${data?.users?.length || 0} users found`);
      for (const user of data.users) {
        console.log(`     - ${user.email} (${user.id.substring(0, 8)}...)`);
      }
      return data.users;
    }
    console.log(`  ❌ Auth API error: ${error.message}`);
  } catch (e) {
    console.log(`  ❌ Auth API error: ${e.message}`);
  }
  return [];
}

async function main() {
  console.log("╔══════════════════════════════════════════════════════╗");
  console.log("║     INVENTOY — Database Connection Diagnostic        ║");
  console.log("╚══════════════════════════════════════════════════════╝");
  console.log(`\nProject: ${SUPABASE_URL}`);
  console.log(`Ref: ${PROJECT_REF}\n`);

  // 1. Try Supabase Admin API exists
  const tablesExist = await trySupabaseAdminAPI();

  // 2. Try direct DB connection with service_role key
  console.log("\n📋 Trying direct DB connection with SERVICE_ROLE_KEY as password...");
  let connected = false;
  if (SERVICE_ROLE_KEY) {
    const client = await tryDirectConnection(SERVICE_ROLE_KEY);
    if (client) {
      connected = true;
      // Execute SQL schema
      const sqlPath = resolve(__dirname, "../lib/supabase-schema.sql");
      const sql = readFileSync(sqlPath, "utf-8");
      console.log(`\n📋 SQL file size: ${(sql.length / 1024).toFixed(1)} KB`);
      
      try {
        await client.query(sql);
        console.log("  ✅ SQL schema EXECUTED successfully!");
      } catch (err) {
        console.log(`  ❌ SQL execution error: ${err.message.substring(0, 100)}`);
      }
      await client.end();
    }
  }

  // 3. Try Supabase Auth Admin API
  const users = await trySupabaseAuthAPI();

  // Summary
  console.log("\n══════════════════════════════════════════════════════");
  console.log("SUMMARY:");
  
  if (connected) {
    console.log("  ✅ Direct DB: Connected ✓");
  } else {
    console.log("  ❌ Direct DB: Not connected");
  }
  
  if (tablesExist) {
    console.log("  ✅ Tables: Exist ✓");
  } else {
    console.log("  ❌ Tables: Don't exist yet");
  }
  
  console.log(`  👤 Users in Auth: ${users.length}`);
  console.log("══════════════════════════════════════════════════════\n");

  if (!connected && !tablesExist) {
    console.log("⚠️  The SQL schema needs to be executed on Supabase.");
    console.log("   You need the DATABASE PASSWORD (set during project creation).");
    console.log("\n   To get it:");
    console.log("   1. Go to https://supabase.com/dashboard/project/mjkeznlmhtskrekywnfg");
    console.log("   2. Settings → Database → Database password");
    console.log("   3. Or reset it: Database → Reset database password");
    console.log("\n   Then run: node scripts/connect-db.mjs");
    console.log("   (password will be read from .env.local)");
  }
}

main().catch(console.error);
