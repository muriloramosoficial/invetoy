import { readFileSync, writeFileSync, existsSync } from "fs";
import { resolve, dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const envPath = resolve(__dirname, "../.env.local");

if (!existsSync(envPath)) {
  console.error("❌ .env.local not found!");
  process.exit(1);
}

let content = readFileSync(envPath, "utf-8");

// The ASAAS sandbox key format is $aact_hmlg_... (the $ IS part of the key)
// Our current key is missing the $ prefix
const currentKey = content.match(/^ASAAS_API_KEY=.*$/m)?.[0];
if (currentKey) {
  const value = currentKey.split("=", 2)[1];
  if (!value.startsWith("$")) {
    const newLine = `ASAAS_API_KEY=$${value}`;
    content = content.replace(/^ASAAS_API_KEY=.*$/m, newLine);
    console.log("✅ Added $ prefix to ASAAS_API_KEY");
  } else {
    console.log("✅ ASAAS_API_KEY already has $ prefix");
  }
}

// Verify
writeFileSync(envPath, content, "utf-8");
const verify = readFileSync(envPath, "utf-8").match(/^ASAAS_API_KEY=.*$/m)?.[0];
console.log(`   Current value (first 25 chars): ${verify?.substring(0, 25)}...`);
