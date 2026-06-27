import { createBrowserClient } from "@supabase/ssr";

export function createClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseAnonKey) {
    if (typeof window === "undefined") return null as unknown as ReturnType<typeof createBrowserClient>;
    console.error("[Supabase] Missing env vars", {
      urlPresent: !!supabaseUrl,
      keyPresent: !!supabaseAnonKey,
      urlType: typeof supabaseUrl,
      keyType: typeof supabaseAnonKey,
      urlStart: supabaseUrl?.substring(0, 12),
      nodeEnv: typeof process !== "undefined" ? process.env.NODE_ENV : "unknown",
    });
    throw new Error(
      "Supabase environment variables não encontradas. " +
      "Verifique se NEXT_PUBLIC_SUPABASE_URL e NEXT_PUBLIC_SUPABASE_ANON_KEY estão no .env.local. " +
      "Após editar, pare e reinicie o servidor (Ctrl+C, npm run dev)."
    );
  }

  return createBrowserClient(supabaseUrl, supabaseAnonKey);
}
