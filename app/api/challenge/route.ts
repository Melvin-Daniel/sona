import { NextResponse } from "next/server";
import { generatePipelineAsync } from "@/lib/engine";

export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const word = typeof body.word === "string" ? body.word : "";
    if (!word.trim()) {
      return NextResponse.json(
        { error: "Missing word" },
        { status: 400 }
      );
    }
    const result = await generatePipelineAsync(word);
    return NextResponse.json(result);
  } catch (e) {
    console.error(e);
    return NextResponse.json(
      { error: "Generation failed" },
      { status: 500 }
    );
  }
}
