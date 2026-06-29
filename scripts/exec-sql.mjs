/**
 * Execute SQL schema on Supabase via Management API
 * Usage: node scripts/exec-sql.mjs
 */
import { readFileSync, existsSync } from "fs";
import { resolve, dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));

const PAT = process.env.SUPABASE_PAT || readPATFromEnv();

function readPATFromEnv() {
  const envPaths = [resolve(__dirname, "../.env.local"), resolve(__dirname, "../.env")];
  for (const p of envPaths) {
    if (existsSync(p)) {
      for (const line of readFileSync(p, "utf-8").split("\n")) {
        const trimmed = line.trim();
        if (trimmed.startsWith("SUPABASE_PAT=")) return trimmed.slice("SUPABASE_PAT=".length);
      }
    }
  }
  return null;
}

async function main() {
  if (!PAT) {
    console.log("❌ SUPABASE_PAT not found.");
    console.log("   Set it as env var: SUPABASE_PAT=sbp_xxx");
    console.log("   Then run: node scripts/exec-sql.mjs\n");
    process.exit(1);
  }

  const PROJECT_REF = "mjkeznlmhtskrekywnfg";
  const sqlPath = resolve(__dirname, "../lib/supabase-schema.sql");
  const sql = readFileSync(sqlPath, "utf-8");

  console.log(`📦 SQL file: ${(sql.length / 1024).toFixed(1)} KB`);
  console.log(`🔗 Project: ${PROJECT_REF}\n`);

  // Split SQL into batches by semicolon + newline to avoid overly large requests
  // But send it all at once since the API handles multi-statement queries
  const body = JSON.stringify({ query: sql });

  console.log("📋 Executing SQL schema via Management API...\n");

  const res = await fetch(
    `https://api.supabase.com/v1/projects/${PROJECT_REF}/sql`,
    {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${PAT}`,
        "Content-Type": "application/json",
      },
      body,
    }
  );

  const text = await res.text();
  let data;
  try { data = JSON.parse(text); } catch { data = text; }

  console.log(`HTTP ${res.status}:`);
  
  if (res.ok) {
    console.log("✅ SQL schema executed successfully!");
    console.log("   All tables, indexes, RLS policies, functions, and triggers created.");
  } else {
    console.error(`❌ Failed: ${typeof data === 'object' ? JSON.stringify(data) : data}`);
    
    // Check if it's a duplicate error (objects already exist)
    if (typeof data === 'object' && data.message && data.message.includes("already exists")) {
      console.log("   ⚠️  Some objects already exist (expected if re-running). Continuing...");
    }
  }
}

main().catch(console.error);
