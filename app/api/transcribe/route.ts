import { NextRequest, NextResponse } from "next/server";
import { openai } from "@/lib/openai";
import { assignSpeakers } from "@/lib/utils";

export const maxDuration = 120;

const ACCEPTED = [
  "audio/mpeg", "audio/mp3", "audio/wav", "audio/x-wav",
  "audio/mp4", "audio/m4a", "audio/x-m4a", "audio/ogg",
  "audio/webm", "video/mp4", "video/webm",
];
const MAX_BYTES = 25 * 1024 * 1024; // Whisper limit

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get("audio") as File | null;
    const language = (formData.get("language") as string) || "zh";

    if (!file) {
      return NextResponse.json({ error: "請上傳音檔" }, { status: 400 });
    }
    if (file.size > MAX_BYTES) {
      const mb = (file.size / 1024 / 1024).toFixed(1);
      return NextResponse.json(
        { error: `檔案過大（${mb} MB）。Whisper API 上限 25 MB，請壓縮後重試。` },
        { status: 413 }
      );
    }
    const mime = file.type || "audio/mpeg";
    if (!ACCEPTED.includes(mime)) {
      return NextResponse.json(
        { error: `不支援的格式（${mime}），請上傳 MP3、WAV 或 M4A。` },
        { status: 415 }
      );
    }

    // Call Whisper with verbose_json to get timestamps
    const whisperRes = await openai.audio.transcriptions.create({
      file,
      model: "whisper-1",
      response_format: "verbose_json",
      timestamp_granularities: ["segment"],
      language: language === "zh" ? "zh" : language === "ja" ? "ja" : "en",
    });

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const raw = whisperRes as any;
    const rawSegments: Array<{ id: number; start: number; end: number; text: string }> =
      raw.segments ?? [];

    const fullText = (raw.text as string).trim();
    const duration = (raw.duration as number) ?? 0;
    const detectedLanguage = (raw.language as string) ?? language;

    const segments = assignSpeakers(rawSegments);

    // Count unique speakers
    const speakerSet = new Set(segments.map((s) => s.speakerIndex));

    return NextResponse.json({
      segments,
      fullText,
      duration,
      language: detectedLanguage,
      speakerCount: speakerSet.size,
    });
  } catch (err: unknown) {
    console.error("[/api/transcribe]", err);
    const msg = err instanceof Error ? err.message : "語音轉文字失敗";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
