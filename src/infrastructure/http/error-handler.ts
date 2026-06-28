import { NextResponse } from "next/server";
import { logger } from "@core/logger";

interface ErrorResponse {
  error: string;
  code?: string;
  status: number;
}

export function errorHandler(
  error: unknown,
  context?: { trace_id?: string; user_id?: string; tenant_id?: string }
): NextResponse {
  const message = error instanceof Error ? error.message : "Erro interno do servidor";
  const code = error instanceof Error && "code" in error ? (error as any).code : "INTERNAL_ERROR";
  let status = 500;

  if (error instanceof Error && "status" in error) {
    status = (error as any).status;
  }

  logger.error(message, { ...context, code, status });

  const body: ErrorResponse = {
    error: message,
    code,
    status,
  };

  return NextResponse.json(body, { status });
}
