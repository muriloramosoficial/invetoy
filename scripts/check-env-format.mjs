/**
 * INVENTOY — Diagnose .env.local format issues
 * Checks for common problems that prevent Next.js from reading env vars
 */
import { readFileSync, existsSync } from "fs";
import { resolve, dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const envPath = resolve(__dirname, "../.env.local");

console.log("🔍 .env.local Format Diagnosis\n");

if (!existsSync(envPath)) {
  console.log("❌ File does not exist!");
  process.exit(1);
}

const raw = readFileSync(envPath, "utf-8");
const stats = existsSync(envPath) ? await import("fs").then(fs => fs.statSync(envPath)) : null;

console.log(`📁 File: .env.local`);
console.log(`📏 Size: ${raw.length} bytes`);
console.log(`🕐 Modified: ${stats?.mtime?.toISOString() || "unknown"}`);
console.log(`\\n`);

// Check BOM (Byte Order Mark)
const hasBOM = raw.charCodeAt(0) === 0xFEFF;
console.log(`📌 BOM (Byte Order Mark): ${hasBOM ? "❌ PRESENT (can break parsing)" : "✅ Absent"}`);

// Check line endings
const crlfCount = (raw.match(/\r\n/g) || []).length;
const lfCount = (raw.match(/\n/g) || []).length;
const crCount = (raw.match(/\r(?!\n)/g) || []).length;
console.log(`📌 Line endings:`);
console.log(`   CRLF (Windows): ${crlfCount}`);
console.log(`   LF (Unix): ${lfCount - crlfCount}`);
console.log(`   Bare CR: ${crCount}`);

// Check each line
console.log(`\\n📋 Parsing each line...`);
const lines = raw.split(/\r?\n/);
let validVars = 0;
let issues = [];

for (let i = 0; i < lines.length; i++) {
  const line = lines[i];
  const trimmed = line.trim();
  
  // Skip empty lines and comments
  if (!trimmed || trimmed.startsWith("#")) continue;
  
  const eqIdx = trimmed.indexOf("=");
  if (eqIdx <= 0) {
    issues.push(`Line ${i + 1}: No '=' found — "${trimmed.substring(0, 40)}"`);
    continue;
  }
  
  const key = trimmed.slice(0, eqIdx).trim();
  const value = trimmed.slice(eqIdx + 1).trim();
  
  // Check for issues
  if (!key) {
    issues.push(`Line ${i + 1}: Empty key`);
  }
  
  // Check for quotes around key
  if (key.startsWith('"') || key.startsWith("'")) {
    issues.push(`Line ${i + 1}: Key has quotes — "${key}"`);
  }
  
  // Check for spaces around =
  const rawLine = line;
  if (rawLine.includes(" = ") || rawLine.includes(" =") || rawLine.includes("= ")) {
    // This is actually fine for dotenv
  }
  
  // Check if value has quotes that might be part of the value
  if (value.startsWith('"') || value.startsWith("'")) {
    // Quoted values are valid in dotenv
  }
  
  // Check for trailing comments (without quotes)
  if (!value.startsWith('"') && !value.startsWith("'") && value.includes(" #")) {
    issues.push(`Line ${i + 1}: Possible trailing comment in unquoted value`);
  }
  
  validVars++;
  
  // Show key and first/last few chars of value
  const displayVal = value.length > 15 
    ? value.substring(0, 5) + "..." + value.substring(value.length - 5)
    : value;
  console.log(`   ✅ ${key}=${displayVal}`);
}

console.log(`\\n📊 Summary:`);
console.log(`   Total lines: ${lines.length}`);
console.log(`   Valid vars: ${validVars}`);
console.log(`   Issues found: ${issues.length}`);

if (issues.length > 0) {
  console.log(`\\n⚠️  Issues:`);
  for (const issue of issues) {
    console.log(`   ${issue}`);
  }
}

// Test: Try to load via dotenv parser
console.log(`\\n📋 Testing with dotenv parser...`);
try {
  const dotenv = await import("dotenv");
  const result = dotenv.config({ path: envPath });
  if (result.error) {
    console.log(`   ❌ dotenv error: ${result.error.message}`);
  } else {
    const parsed = result.parsed || {};
    console.log(`   ✅ dotenv parsed ${Object.keys(parsed).length} vars`);
    for (const key of ["NEXT_PUBLIC_SUPABASE_URL", "NEXT_PUBLIC_SUPABASE_ANON_KEY", "NEXT_PUBLIC_APP_URL"]) {
      if (parsed[key]) {
        console.log(`      ✅ ${key}=${parsed[key].substring(0, 15)}...`);
      } else {
        console.log(`      ❌ ${key} MISSING after dotenv parse`);
      }
    }
  }
} catch (err) {
  console.log(`   ❌ dotenv test failed: ${err.message}`);
}

console.log(`\\n${"═".repeat(50)}`);
if (issues.length === 0 && hasBOM === false) {
  console.log("✅ No format issues found");
} else {
  console.log("⚠️  Issues found - may affect Next.js env loading");
}
console.log("═".repeat(50));
