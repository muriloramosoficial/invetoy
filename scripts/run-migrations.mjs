/**
 * Execute migration SQL files on Supabase via Management API
 * Usage: node scripts/run-migrations.mjs
 */
import { readFileSync, existsSync, readdirSync } from "fs";
import { resolve, dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));

// Read PAT from process.env or .env.local
const PAT = process.env.SUPABASE_PAT || readPATFromEnv();
const PROJECT_REF = "mjkeznlmhtskrekywnfg";

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

async function executeSQL(sql, label) {
  console.log(`\n📋 Executing: ${label}`);
  console.log(`   Size: ${(sql.length / 1024).toFixed(1)} KB`);

  const res = await fetch(
    `https://api.supabase.com/v1/projects/${PROJECT_REF}/sql`,
    {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${PAT}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ query: sql }),
    }
  );

  const text = await res.text();
  let data;
  try { data = JSON.parse(text); } catch { data = text; }

  if (res.ok) {
    console.log(`   ✅ ${label} executed successfully!`);
    return true;
  } else {
    const msg = typeof data === "object" ? (data.message || JSON.stringify(data)) : data;
    console.error(`   ❌ Failed: ${msg.substring(0, 200)}`);
    
    // Check if it's a "duplicate" error (objects already exist - acceptable for re-runs)
    if (msg.includes("already exists")) {
      console.log(`   ⚠️  Some objects already exist (expected if re-running). Continuing...`);
      return true;
    }
    return false;
  }
}

async function main() {
  console.log("🚀 INVENTOY - Migration Runner\n");

  if (!PAT) {
    console.log("❌ SUPABASE_PAT not found.");
    console.log("   Set it in .env.local or as env var.");
    process.exit(1);
  }

  console.log(`Project: ${PROJECT_REF}`);
  console.log(`PAT: ${PAT.substring(0, 10)}...\n`);

  // Get all migration files sorted by name
  const migrationsDir = resolve(__dirname, "../supabase/migrations");
  const files = readdirSync(migrationsDir)
    .filter(f => f.endsWith(".sql"))
    .sort();

  // Run only the two new migrations (20260627000005 and 20260627000006)
  const targetFiles = files.filter(f => 
    f.includes("20260627000005") || f.includes("20260627000006")
  );

  if (targetFiles.length === 0) {
    console.log("⚠️  No migration files found matching the pattern.");
    process.exit(1);
  }

  for (const file of targetFiles) {
    const sql = readFileSync(resolve(migrationsDir, file), "utf-8");
    const success = await executeSQL(sql, file);
    if (!success) {
      console.log(`\n⚠️  Migration ${file} had errors. Check above for details.`);
    }
  }

  console.log("\n✅ Migration run complete!");
}

main().catch(err => {
  console.error("\n❌ Fatal error:", err.message);
  process.exit(1);
});
