import { NextResponse } from "next/server";

export async function GET() {
  // Test 1: Check env vars directly
  const envCheck = {
    NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL 
      ? `✅ Present (${process.env.NEXT_PUBLIC_SUPABASE_URL.substring(0, 20)}...)` 
      : "❌ MISSING",
    NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY 
      ? `✅ Present (${process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY.substring(0, 10)}... ${process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY.length} chars)` 
      : "❌ MISSING",
    NEXT_PUBLIC_APP_URL: process.env.NEXT_PUBLIC_APP_URL || "❌ MISSING",
    NODE_ENV: process.env.NODE_ENV,
    PWD: process.env.PWD,
  };

  // Test 2: Try to create Supabase client
  let clientTest = "not tested";
  try {
    const { createClient } = await import("@supabase/supabase-js");
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL || "",
      process.env.SUPABASE_SERVICE_ROLE_KEY || ""
    );
    const { data, error } = await supabase.auth.admin.listUsers();
    clientTest = error 
      ? `❌ ${error.message}` 
      : `✅ ${data?.users?.length || 0} users found`;
  } catch (err: any) {
    clientTest = `❌ Exception: ${err.message}`;
  }

  return NextResponse.json({
    serverEnv: envCheck,
    clientTest,
    envFileExists: require("fs").existsSync(require("path").resolve(".env.local")),
  });
}
