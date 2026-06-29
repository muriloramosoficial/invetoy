/**
 * Add ASAAS sandbox token to .env.local
 * Usage: node scripts/add-asaas-key.mjs
 */
import { readFileSync, writeFileSync, existsSync } from "fs";
import { resolve, dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const envPath = resolve(__dirname, "../.env.local");

const ASASS_KEY = process.env.ASAAS_TOKEN || "aact_hmlg_000MzkwODA2MWY2OGM3MWRlMDU2NWM3MzJlNzZmNGZhZGY6OmE2ODI4YzBiLTNkMTYtNDliMi1iOTNmLTNjYWY3OTA2NjAzYzo6JGFhY2hfYzJiNjc5ZmUtNWU2YS00MGJmLWIyMGItNWQ0ZjhkOTUyODAy";

if (!existsSync(envPath)) {
  console.error("❌ .env.local not found!");
  process.exit(1);
}

let content = readFileSync(envPath, "utf-8");

// Check if ASAAS_API_KEY already exists
if (content.includes("ASAAS_API_KEY=")) {
  // Replace existing
  content = content.replace(/^ASAAS_API_KEY=.*$/m, `ASAAS_API_KEY=${ASASS_KEY}`);
  console.log("✅ ASAAS_API_KEY updated in .env.local");
} else {
  // Add after Supabase section
  content += `\n# ─── ASAAS (Brazilian Payments) ───\nASAAS_API_KEY=${ASASS_KEY}\nASAAS_WEBHOOK_TOKEN=whsec_invetoy_sandbox\nASAAS_SANDBOX=true\n`;
  console.log("✅ ASAAS_API_KEY added to .env.local");
}

// Ensure ASAAS_SANDBOX is true
if (content.includes("ASAAS_SANDBOX=")) {
  content = content.replace(/^ASAAS_SANDBOX=.*$/m, "ASAAS_SANDBOX=true");
} else {
  content += "ASAAS_SANDBOX=true\n";
}

writeFileSync(envPath, content, "utf-8");
console.log("✅ ASAAS_SANDBOX=true set");

// Verify
const updated = readFileSync(envPath, "utf-8");
const hasKey = updated.includes("ASAAS_API_KEY=");
const hasSandbox = updated.includes("ASAAS_SANDBOX=true");
console.log(`\n📋 Verification:`);
console.log(`   ASAAS_API_KEY: ${hasKey ? "✅" : "❌"}`);
console.log(`   ASAAS_SANDBOX: ${hasSandbox ? "✅" : "❌"}`);
