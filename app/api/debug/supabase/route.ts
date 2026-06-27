import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET() {
  const results: Record<string, any> = {
    env: {},
    auth: null,
    db: null,
    errors: [],
  };

  // 1. Check env vars
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  const appUrl = process.env.NEXT_PUBLIC_APP_URL;

  results.env = {
    NEXT_PUBLIC_SUPABASE_URL: supabaseUrl ? `${supabaseUrl.substring(0, 20)}...` : "❌ MISSING",
    NEXT_PUBLIC_SUPABASE_ANON_KEY: supabaseAnonKey ? `${supabaseAnonKey.substring(0, 10)}... (${supabaseAnonKey.length} chars)` : "❌ MISSING",
    NEXT_PUBLIC_APP_URL: appUrl || "❌ MISSING",
    NODE_ENV: process.env.NODE_ENV,
  };

  if (!supabaseUrl || !supabaseAnonKey) {
    results.errors.push("Missing required env vars");
    return NextResponse.json(results, { status: 500 });
  }

  try {
    // 2. Try to create server client
    const supabase = await createClient();

    // 3. Try auth.getUser
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    results.auth = {
      authenticated: !!user,
      user: user ? { id: user.id.substring(0, 8) + "...", email: user.email } : null,
      error: authError?.message || null,
    };

    // 4. Try to query the tenants table
    const { data: tenants, error: dbError } = await supabase
      .from("tenants")
      .select("count", { count: "exact", head: true });

    results.db = {
      accessible: !dbError,
      tenantCount: tenants ? 0 : null, // head query returns null data
      error: dbError?.message || null,
    };

    if (dbError) {
      results.errors.push(`DB query failed: ${dbError.message}`);
    }

  } catch (err: any) {
    results.errors.push(`Exception: ${err.message}`);
  }

  return NextResponse.json(results);
}
