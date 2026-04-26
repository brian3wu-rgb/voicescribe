import { NextRequest, NextResponse } from "next/server";

export const maxDuration = 30;

const AUDIO_CONTENT_TYPES = [
  "audio/mpeg", "audio/mp3", "audio/wav", "audio/x-wav",
  "audio/mp4", "audio/m4a", "audio/ogg", "audio/webm",
];

export async function GET(req: NextRequest) {
  const url = req.nextUrl.searchParams.get("url");
  if (!url) {
    return NextResponse.json({ error: "缺少 url 參數" }, { status: 400 });
  }

  try {
    const res = await fetch(url, {
      headers: { "User-Agent": "Mozilla/5.0 VoiceScribe/1.0" },
    });
    if (!res.ok) {
      return NextResponse.json(
        { error: `無法下載：HTTP ${res.status}` },
        { status: 400 }
      );
    }

    const contentType = res.headers.get("content-type") ?? "";
    const isAudio = AUDIO_CONTENT_TYPES.some((t) => contentType.includes(t));
    if (!isAudio) {
      return NextResponse.json(
        { error: `不支援的格式（${contentType}）。請提供直連音訊 URL。` },
        { status: 415 }
      );
    }

    const buffer = await res.arrayBuffer();
    return new NextResponse(buffer, {
      headers: {
        "Content-Type": contentType,
        "Content-Length": String(buffer.byteLength),
      },
    });
  } catch (err) {
    const msg = err instanceof Error ? err.message : "下載失敗";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
