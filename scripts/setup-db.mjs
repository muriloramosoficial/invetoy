import pkg from "pg";
const { Client } = pkg;
import { createClient } from "@supabase/supabase-js";
import { readFileSync } from "fs";
import { resolve, dirname } from "path";
import { fileURLToPath } from "url";
import { config } from "dotenv";

const __dirname = dirname(fileURLToPath(import.meta.url));
config({ path: resolve(__dirname, "../.env.local") });

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !SERVICE_ROLE_KEY) {
  console.error("❌ Missing SUPABASE_URL or SERVICE_ROLE_KEY in .env.local");
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SERVICE_ROLE_KEY);

// ---------- STEP 1: Try to execute SQL via direct DB connection ----------
async function executeSQL() {
  const sqlPath = resolve(__dirname, "../lib/supabase-schema.sql");
  const sql = readFileSync(sqlPath, "utf-8");

  // Try connecting to Supabase database via pg
  // The host is derived from the Supabase URL
  const projectRef = SUPABASE_URL.replace("https://", "").replace(".supabase.co", "");

  const client = new Client({
    host: `db.${projectRef}.supabase.co`,
    port: 5432,
    database: "postgres",
    user: "postgres",
    password: SERVICE_ROLE_KEY,
    ssl: { rejectUnauthorized: false },
    connectionTimeoutMillis: 10000,
  });

  try {
    await client.connect();
    console.log("✅ Connected to database via pg");
    
    // Execute the SQL schema
    await client.query(sql);
    console.log("✅ SQL schema executed successfully!");
    return true;
  } catch (err) {
    console.log(`⚠️  Direct DB connection failed: ${err.message}`);
    console.log("   Will try alternative approach...");
    return false;
  } finally {
    try { await client.end(); } catch {}
  }
}

// ---------- STEP 2: Check if tables exist via REST API ----------
async function checkTables() {
  console.log("\n📋 Checking if tables already exist via REST API...");
  
  const tables = ["tenants", "profiles", "categories", "locations", "products", "inventory_items", "movements"];
  
  for (const table of tables) {
    try {
      const { error } = await supabase
        .from(table)
        .select("count", { count: "exact", head: true });

      if (error) {
        console.log(`   ${table}: ❌ Not accessible (${error.message})`);
      } else {
        console.log(`   ${table}: ✅ Accessible`);
      }
    } catch {
      console.log(`   ${table}: ❌ Error`);
    }
  }
}

// ---------- STEP 3: Create users via Admin API ----------
async function createUsers() {
  console.log("\n👤 Creating demo users...");

  const users = [
    {
      email: "murilo@invetoy.com.br",
      password: "Admin@123",
      email_confirm: true,
      user_metadata: {
        name: "Murilo Ramos",
        tenant_name: "INVENTOY",
      },
    },
    {
      email: "admin@empresa.com.br",
      password: "Demo@123",
      email_confirm: true,
      user_metadata: {
        name: "Admin Demo",
        tenant_name: "Empresa Demo Ltda",
      },
    },
    {
      email: "funcionario@empresa.com.br",
      password: "Func@123",
      email_confirm: true,
      user_metadata: {
        name: "João Silva",
        tenant_name: "Empresa Demo Ltda",
      },
    },
  ];

  for (const user of users) {
    try {
      const { data, error } = await supabase.auth.admin.createUser({
        email: user.email,
        password: user.password,
        email_confirm: user.email_confirm,
        user_metadata: user.user_metadata,
      });

      if (error) {
        if (error.message.includes("already exists")) {
          console.log(`   ${user.email}: ⚠️  Already exists`);
        } else {
          console.log(`   ${user.email}: ❌ ${error.message}`);
        }
      } else {
        console.log(`   ${user.email}: ✅ Created (ID: ${data.user.id})`);
      }
    } catch (err) {
      console.log(`   ${user.email}: ❌ ${err.message}`);
    }
  }
}

// ---------- STEP 4: If trigger doesn't exist, manually create profiles ----------
async function createManualProfiles() {
  console.log("\n🔧 Checking if we need to manually create profiles...");

  // Try to query profiles table
  const { data: existingProfiles } = await supabase
    .from("profiles")
    .select("id, email")
    .limit(1);

  if (existingProfiles && existingProfiles.length > 0) {
    console.log("   Profiles already exist — trigger is working! ✅");
    return;
  }

  console.log("   No profiles found. Trying to get users and create profiles manually...");

  const { data: users } = await supabase.auth.admin.listUsers();
  
  if (!users?.users) {
    console.log("   Could not list users");
    return;
  }

  for (const user of users.users) {
    const name = user.user_metadata?.name || user.email?.split("@")[0];
    const tenantName = user.user_metadata?.tenant_name || "My Company";
    const slug = tenantName.toLowerCase().replace(/[^a-z0-9]/g, "-");

    // Check if profile exists
    const { data: profile } = await supabase
      .from("profiles")
      .select("id")
      .eq("id", user.id)
      .maybeSingle();

    if (profile) {
      console.log(`   ${user.email}: Profile already exists ✅`);
      continue;
    }

    // First, create tenant if it doesn't exist
    const { data: existingTenants } = await supabase
      .from("tenants")
      .select("id")
      .eq("slug", slug)
      .limit(1);

    let tenantId;
    if (existingTenants && existingTenants.length > 0) {
      tenantId = existingTenants[0].id;
    } else {
      const { data: tenant, error: tenantError } = await supabase
        .from("tenants")
        .insert({ name: tenantName, slug })
        .select("id")
        .single();

      if (tenantError) {
        console.log(`   ${user.email}: Failed to create tenant — ${tenantError.message}`);
        continue;
      }
      tenantId = tenant.id;
    }

    // Create profile
    const { error: profileError } = await supabase
      .from("profiles")
      .insert({
        id: user.id,
        tenant_id: tenantId,
        email: user.email,
        name,
        role: user.email === "funcionario@empresa.com.br" ? "operator" : "admin",
      });

    if (profileError) {
      console.log(`   ${user.email}: Failed to create profile — ${profileError.message}`);
    } else {
      console.log(`   ${user.email}: Profile created ✅ (role: ${user.email === "funcionario@empresa.com.br" ? "operator" : "admin"})`);
    }
  }
}

/*
 * ⚠️ ANTES DE RODAR ESTE SCRIPT:
 * 1. Acesse https://supabase.com/dashboard/project/mjkeznlmhtskrekywnfg/sql/new
 * 2. Copie e cole TODO o conteúdo de lib/supabase-schema.sql
 * 3. Execute o SQL (cria as tabelas, RLS, triggers)
 * 4. Depois rode este script: node scripts/setup-db.mjs
 *    (ele criará profiles/tenants para os usuários já cadastrados)
 */

// ---------- MAIN ----------
async function main() {
  console.log("🚀 INVENTOY — Supabase Setup\n");
  console.log(`Project: ${SUPABASE_URL}\n`);

  // Step 1: Execute SQL
  const sqlExecuted = await executeSQL();

  // Step 2: Check tables
  await checkTables();

  // Step 3: Create users
  await createUsers();

  // Step 4: Create manual profiles if needed
  if (!sqlExecuted) {
    await createManualProfiles();
  }

  console.log("\n✅ Setup complete!");
}

main().catch((err) => {
  console.error("\n❌ Fatal error:", err.message);
  process.exit(1);
});
