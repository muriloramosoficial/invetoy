import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const report = await req.json();
    console.warn("[CSP Violation]", JSON.stringify(report, null, 2));
  } catch {
    // ignore parse errors
  }
  return NextResponse.json({ ok: true });
}
