import { NextRequest, NextResponse } from "next/server";

export function corsHeaders(req: NextRequest) {
  const allowed = process.env.ALLOWED_ORIGIN || "*";
  const origin = req.headers.get("origin") || "";
  const allowOrigin = allowed === "*" || origin === allowed ? (allowed === "*" ? "*" : origin) : allowed;

  return {
    "Access-Control-Allow-Origin": allowOrigin,
    "Access-Control-Allow-Methods": "POST, OPTIONS, GET",
    "Access-Control-Allow-Headers": "Content-Type, x-kam-token",
    "Access-Control-Max-Age": "86400"
  };
}

export function preflight(req: NextRequest) {
  return new NextResponse(null, { status: 204, headers: corsHeaders(req) });
}

export function unauthorized(req: NextRequest) {
  return NextResponse.json(
    { error: "No autorizado" },
    { status: 401, headers: corsHeaders(req) }
  );
}

export function assertToken(req: NextRequest) {
  const expected = process.env.KAM_DECK_TOKEN;
  if (!expected) return true;
  const received = req.headers.get("x-kam-token");
  return received === expected;
}