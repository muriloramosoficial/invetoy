"use client";

import { useState, useEffect, useRef } from "react";
import { createClient } from "@/lib/supabase/client";
import { Loader2, Lock } from "lucide-react";

interface SwaggerUIBundleFn {
  (opts: Record<string, unknown>): void;
  presets: { apis: unknown };
}

interface SwaggerWindow {
  SwaggerUIBundle: SwaggerUIBundleFn;
}
import Link from "next/link";

export default function SwaggerPage() {
  const [status, setStatus] = useState<"loading" | "allowed" | "blocked">("loading");
  const injected = useRef(false);

  useEffect(() => {
    let mounted = true;
    async function check() {
      try {
        const supabase = createClient();
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) { if (mounted) setStatus("blocked"); return; }

        const { data: profile } = await supabase
          .from("profiles")
          .select("tenant_id")
          .eq("id", user.id)
          .single();

        if (!profile) { if (mounted) setStatus("blocked"); return; }

        const { data: tenant } = await supabase
          .from("tenants")
          .select("plan, subscription_status")
          .eq("id", profile.tenant_id)
          .single();

        const plan = tenant?.plan || "free";
        const allowed = plan === "starter" || plan === "pro" || plan === "enterprise";
        if (mounted) setStatus(allowed ? "allowed" : "blocked");
      } catch {
        if (mounted) setStatus("blocked");
      }
    }
    check();
    return () => { mounted = false; };
  }, []);

  useEffect(() => {
    if (status !== "allowed" || injected.current) return;
    injected.current = true;

    const link = document.createElement("link");
    link.rel = "stylesheet";
    link.href = "https://unpkg.com/swagger-ui-dist@5/swagger-ui.css";
    document.head.appendChild(link);

    const script = document.createElement("script");
    script.src = "https://unpkg.com/swagger-ui-dist@5/swagger-ui-bundle.js";
    script.onload = () => {
      const sw = window as unknown as SwaggerWindow;
      sw.SwaggerUIBundle({
        url: "/api/v1/openapi.json",
        dom_id: "#swagger-ui",
        presets: [sw.SwaggerUIBundle.presets.apis],
        layout: "BaseLayout",
        deepLinking: true,
        showExtensions: true,
        showCommonExtensions: true,
      });
    };
    document.body.appendChild(script);
  }, [status]);

  if (status === "loading") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <Loader2 className="h-8 w-8 text-blue-600 animate-spin" />
      </div>
    );
  }

  if (status === "blocked") {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center max-w-md mx-auto p-8">
          <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center mx-auto mb-4">
            <Lock className="h-8 w-8 text-gray-400" />
          </div>
          <h1 className="text-2xl font-bold mb-2">Acesso Restrito</h1>
          <p className="text-gray-600 mb-6">
            O Swagger interativo está disponível apenas para planos Starter, Pro e Enterprise.
          </p>
          <div className="flex justify-center gap-3">
            <Link href="/settings/api" className="text-sm text-blue-600 hover:underline">
              Meus planos
            </Link>
            <Link href="/docs/api" className="text-sm text-gray-600 hover:underline">
              Documentação estática
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div>
      <div id="swagger-ui" />
    </div>
  );
}
