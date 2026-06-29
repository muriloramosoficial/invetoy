/**
 * INVENTOY — Force database setup
 * Refreshes PostgREST schema cache and creates profiles/tenants
 */
import { createClient } from "@supabase/supabase-js";
import { readFileSync, existsSync } from "fs";
import { resolve, dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));

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

const supabase = createClient(SUPABASE_URL, SERVICE_KEY);
const API = SUPABASE_URL.replace(/\/$/, "");

async function api(path, options = {}) {
  const url = `${API}${path}`;
  const res = await fetch(url, {
    headers: {
      "apikey": SERVICE_KEY,
      "Authorization": `Bearer ${SERVICE_KEY}`,
      "Content-Type": "application/json",
      "Accept": "application/json",
      ...options.headers,
    },
    ...options,
  });
  const text = await res.text();
  let data;
  try { data = JSON.parse(text); } catch { data = text; }
  return { ok: res.ok, status: res.status, data };
}

async function main() {
  console.log("🚀 INVENTOY — Force Database Setup\n");

  // Step 1: Check if SQL schema needs to be executed
  console.log("📋 Step 1: Checking if tables exist...");
  
  const { ok, data } = await api("/rest/v1/tenants?select=id&limit=1");
  
  if (ok) {
    console.log("   ✅ Tenants table exists. Data:", data);
  } else {
    console.log(`   ❌ Tenants query failed (${data?.message || data})`);
    console.log("\n   ⚠️  The SQL schema has NOT been executed on Supabase.");
    console.log("   You need the database password to execute it.");
    console.log("\n   🔑 To proceed, please paste your Supabase database password below:");
    console.log("      (Found at: supabase.com → Project Settings → Database → Database password)\n");
    
    // Prompt for password
    const password = process.env.SUPABASE_DB_PASSWORD;
    if (!password) {
      console.log("   Or set it as an env var: SUPABASE_DB_PASSWORD=your_password");
      console.log("   Then re-run: node scripts/force-setup.mjs\n");
      process.exit(1);
    }
    
    // Try direct DB connection
    console.log("\n📋 Step 2: Attempting direct DB connection with provided password...");
    try {
      const { default: pkg } = await import("pg");
      const { Client } = pkg;
      const projectRef = SUPABASE_URL.replace("https://", "").replace(".supabase.co", "");
      const client = new Client({
        host: `db.${projectRef}.supabase.co`,
        port: 5432,
        database: "postgres",
        user: "postgres",
        password: password,
        ssl: { rejectUnauthorized: false },
        connectionTimeoutMillis: 15000,
      });
      await client.connect();
      console.log("   ✅ Connected to database!");
      
      const sql = readFileSync(resolve(__dirname, "../lib/supabase-schema.sql"), "utf-8");
      console.log(`   📦 Executing SQL schema (${(sql.length/1024).toFixed(1)} KB)...`);
      await client.query(sql);
      console.log("   ✅ SQL schema executed successfully!");
      await client.end();
    } catch (err) {
      console.error(`   ❌ Database connection failed: ${err.message}`);
      process.exit(1);
    }
  }

  // Step 2: Get users from Auth
  console.log("\n📋 Step 3: Listing auth users...");
  const { data: users } = await supabase.auth.admin.listUsers();
  if (!users?.users?.length) {
    console.log("   No users found in Auth.");
    process.exit(0);
  }
  console.log(`   Found ${users.users.length} users`);

  // Step 3: Check profiles
  console.log("\n📋 Step 4: Checking existing profiles...");
  const { data: profiles } = await supabase.from("profiles").select("id");
  const existingIds = new Set(profiles?.map(p => p.id) || []);
  
  // Step 4: Create profiles for users without one
  let created = 0;
  for (const user of users.users) {
    if (existingIds.has(user.id)) {
      console.log(`   ⏭️  ${user.email}: already has profile`);
      continue;
    }

    const name = user.user_metadata?.name || user.email?.split("@")[0] || "User";
    const tenantName = user.user_metadata?.tenant_name || `${name}'s Company`;
    const slug = tenantName.toLowerCase().replace(/[^a-z0-9]/g, "-").replace(/-+/g, "-").replace(/^-|-$/g, "") + "-" + Math.random().toString(36).slice(2, 6);
    const role = user.email === "funcionario@empresa.com.br" ? "operator" : "admin";

    try {
      // Create tenant
      const { data: tenant, error: tErr } = await supabase
        .from("tenants")
        .insert({ name: tenantName, slug, plan: "free", locale: "pt-BR" })
        .select("id")
        .single();

      if (tErr) { console.error(`   ❌ ${user.email}: tenant - ${tErr.message}`); continue; }

      // Create profile
      const { error: pErr } = await supabase.from("profiles").insert({
        id: user.id, tenant_id: tenant.id, email: user.email, name, role,
      });

      if (pErr) { console.error(`   ❌ ${user.email}: profile - ${pErr.message}`); continue; }
      
      console.log(`   ✅ ${user.email}: profile created (${role})`);
      created++;
    } catch (e) {
      console.error(`   ❌ ${user.email}: ${e.message}`);
    }
  }

  console.log(`\n${'='.repeat(50)}`);
  if (created > 0) console.log(`✅ ${created} profiles created`);
  else console.log("✅ All users already have profiles");
  console.log('='.repeat(50));
}

main().catch(console.error);
