import { NextResponse } from "next/server";

export async function GET() {
  return NextResponse.json({
    ok: true,
    service: "KAM Deck Generator API",
    openaiConfigured: Boolean(process.env.OPENAI_API_KEY)
  });
}