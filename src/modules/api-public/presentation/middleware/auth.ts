import { NextRequest, NextResponse } from "next/server";
import { getAdminClient } from "@infra/database/supabase/client";
import { authenticateApiKeyUseCase } from "../../application/authenticate-api-key.usecase";

interface AuthContext {
  tenantId: string;
}

type ApiHandler = (req: NextRequest, ctx: AuthContext, db: ReturnType<typeof getAdminClient>) => Promise<NextResponse>;

export function withAuth(handler: ApiHandler) {
  return async (req: NextRequest): Promise<NextResponse> => {
    try {
      const authHeader = req.headers.get("authorization");
      if (!authHeader?.startsWith("Bearer ")) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
      }

      const apiKey = authHeader.slice(7).trim();
      const db = getAdminClient();
      const result = await authenticateApiKeyUseCase(db, apiKey);

      return await handler(req, { tenantId: result.tenantId }, db);
    } catch (err: any) {
      return NextResponse.json({ error: err.message || "Internal error" }, { status: 401 });
    }
  };
}
