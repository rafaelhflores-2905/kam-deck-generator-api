import { NextRequest, NextResponse } from "next/server";
import { assertToken, corsHeaders, preflight, unauthorized } from "@/lib/cors";
import { buildDeck } from "@/lib/deckBuilder";
import { DeckRequest } from "@/lib/types";

export const runtime = "nodejs";

export async function OPTIONS(req: NextRequest) {
  return preflight(req);
}

function safeFileName(value: string) {
  return (value || "presentacion-kam")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-zA-Z0-9-_ ]/g, "")
    .trim()
    .replace(/\s+/g, "-")
    .toLowerCase()
    .slice(0, 80);
}

export async function POST(req: NextRequest) {
  if (!assertToken(req)) return unauthorized(req);

  const headers = corsHeaders(req);
  try {
    const body = (await req.json()) as DeckRequest;
    const pptBuffer = await buildDeck(body);

    return new NextResponse(pptBuffer, {
      status: 200,
      headers: {
        ...headers,
        "Content-Type": "application/vnd.openxmlformats-officedocument.presentationml.presentation",
        "Content-Disposition": `attachment; filename="${safeFileName(body.title)}.pptx"`,
        "Cache-Control": "no-store"
      }
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: "No se pudo generar el PPT", details: error?.message || String(error) },
      { status: 500, headers }
    );
  }
}