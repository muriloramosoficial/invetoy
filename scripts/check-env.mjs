import { readFileSync, existsSync } from "fs";
import { resolve, dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const envPath = resolve(__dirname, "../.env.local");

console.log("🔍 Checking .env.local...\n");

if (!existsSync(envPath)) {
  console.log("❌ .env.local file does not exist!");
  process.exit(1);
}

const content = readFileSync(envPath, "utf-8");
const lines = content.split("\n").filter((l) => l.trim() && !l.trim().startsWith("#"));

const requiredPublic = [
  "NEXT_PUBLIC_SUPABASE_URL",
  "NEXT_PUBLIC_SUPABASE_ANON_KEY",
  "NEXT_PUBLIC_APP_URL",
];

const requiredPrivate = [
  "SUPABASE_SERVICE_ROLE_KEY",
];

const envVars = {};
for (const line of lines) {
  const eqIdx = line.indexOf("=");
  if (eqIdx > 0) {
    const key = line.slice(0, eqIdx).trim();
    const value = line.slice(eqIdx + 1).trim();
    envVars[key] = value;
  }
}

console.log(`📋 Found ${Object.keys(envVars).length} env vars\n`);

// Check public vars
console.log("Public env vars (exposed to browser):");
let allPublicOk = true;
for (const key of requiredPublic) {
  if (envVars[key]) {
    const val = envVars[key];
    console.log(`  ✅ ${key}=${val.substring(0, 20)}...${val.length > 20 ? ` (${val.length} chars)` : ""}`);
  } else {
    console.log(`  ❌ ${key} MISSING!`);
    allPublicOk = false;
  }
}

// Check if NEXT_PUBLIC_SUPABASE_ANON_KEY is actually the anon key (starts with "eyJ")
if (envVars["NEXT_PUBLIC_SUPABASE_ANON_KEY"]) {
  const anonKey = envVars["NEXT_PUBLIC_SUPABASE_ANON_KEY"];
  if (anonKey.startsWith("eyJ")) {
    console.log(`     ✅ ANON key looks valid (starts with 'eyJ' = valid JWT)`);
  } else if (anonKey.startsWith("sbp_")) {
    console.log(`     ⚠️  WARNING: This looks like a SERVICE_ROLE or PAT key, NOT an ANON key!`);
    console.log(`     ❌ Using a service key in the browser is a SECURITY RISK and may cause auth issues!`);
    allPublicOk = false;
  } else {
    console.log(`     ⚠️  WARNING: ANON key doesn't start with 'eyJ'. Might be wrong key type.`);
  }
}

// Check private vars
console.log("\nPrivate env vars (server-side only):");
for (const key of requiredPrivate) {
  if (envVars[key]) {
    const val = envVars[key];
    console.log(`  ✅ ${key}=${val.substring(0, 4)}...${val.length > 4 ? ` (${val.length} chars)` : ""}`);
  } else {
    console.log(`  ❌ ${key} MISSING!`);
  }
}

// Check if SUPABASE_SERVICE_ROLE_KEY is being used as ANON key (common mistake)
if (envVars["NEXT_PUBLIC_SUPABASE_ANON_KEY"] && envVars["SUPABASE_SERVICE_ROLE_KEY"]) {
  if (envVars["NEXT_PUBLIC_SUPABASE_ANON_KEY"] === envVars["SUPABASE_SERVICE_ROLE_KEY"]) {
    console.log(`\n❌ CRITICAL: NEXT_PUBLIC_SUPABASE_ANON_KEY and SUPABASE_SERVICE_ROLE_KEY are THE SAME!`);
    console.log(`   The ANON key should be different from the SERVICE_ROLE key.`);
    console.log(`   Using the service role key in the browser is a security risk.`);
    console.log(`   Get the correct ANON key from: Supabase Dashboard → Settings → API → Project API keys → anon/public`);
    allPublicOk = false;
  }
}

// Summary
console.log(`\n${"═".repeat(50)}`);
if (allPublicOk) {
  console.log("✅ All public env vars present and look valid");
} else {
  console.log("❌ Some env vars are missing or invalid - FIX NEEDED");
}
console.log("═".repeat(50));
