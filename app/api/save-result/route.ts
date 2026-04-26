import { NextRequest, NextResponse } from "next/server";
import { generateId, saveResult } from "@/lib/store";

export async function POST(req: NextRequest) {
  try {
    const result = await req.json();
    const id = generateId();
    await saveResult(id, result);
    return NextResponse.json({ id });
  } catch (err) {
    console.error("[/api/save-result]", err);
    return NextResponse.json({ error: "儲存失敗" }, { status: 500 });
  }
}
