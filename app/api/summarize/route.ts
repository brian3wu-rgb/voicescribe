import { NextRequest, NextResponse } from "next/server";
import { anthropic } from "@/lib/claude";

export const maxDuration = 120;

const SYSTEM = `你是一位專業的會議記錄專家，擅長分析會議逐字稿並產生結構化的會議摘要。
請用繁體中文回應，並以嚴格的 JSON 格式輸出，不要在 JSON 外加任何說明文字。`;

const buildPrompt = (text: string) => `
請分析以下會議逐字稿，並回傳一個 JSON 物件，包含以下三個欄位：

{
  "actionItems": [
    "發言者1：具體的待辦事項或承諾",
    "發言者2：另一個待辦事項"
  ],
  "keyPoints": [
    "重要討論點或決策1",
    "重要討論點或決策2"
  ],
  "suggestions": [
    "**建議標題**：具體的策略建議或後續行動方向",
    "**另一個建議**：詳細說明"
  ]
}

規則：
- actionItems：列出每位發言者的具體承諾與待辦事項，格式為「發言者X：內容」，5-8 項
- keyPoints：會議中的重要資訊、決議、數據，6-10 項
- suggestions：基於會議內容提出的建議行動方向，標題用 **粗體** 格式，4-6 項
- 若無法識別發言者，actionItems 使用「與會者：」

逐字稿：
${text}
`.trim();

export async function POST(req: NextRequest) {
  try {
    const { text } = (await req.json()) as { text?: string };

    if (!text?.trim()) {
      return NextResponse.json({ error: "請提供逐字稿文字" }, { status: 400 });
    }

    const response = await anthropic.messages.create({
      model: "claude-opus-4-6",
      max_tokens: 4096,
      system: SYSTEM,
      messages: [{ role: "user", content: buildPrompt(text) }],
    });

    const raw = response.content.find((b) => b.type === "text")?.text ?? "{}";

    // Extract JSON from response (handle markdown code blocks)
    const jsonMatch = raw.match(/```(?:json)?\s*([\s\S]*?)```/) || [null, raw];
    const jsonStr = jsonMatch[1]?.trim() ?? raw.trim();

    let parsed: {
      actionItems?: string[];
      keyPoints?: string[];
      suggestions?: string[];
    } = {};

    try {
      parsed = JSON.parse(jsonStr);
    } catch {
      // Fallback: extract bullet lines
      const lines = raw.split("\n").filter((l) => l.trim().length > 10);
      parsed = { actionItems: [], keyPoints: lines.slice(0, 6), suggestions: [] };
    }

    return NextResponse.json({
      keyPoints: parsed.keyPoints ?? [],
      actionItems: parsed.actionItems ?? [],
      suggestions: parsed.suggestions ?? [],
    });
  } catch (err: unknown) {
    console.error("[/api/summarize]", err);
    const msg = err instanceof Error ? err.message : "摘要生成失敗";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
