import type { TranscriptSegment } from "./types";

/** Format seconds → MM:SS */
export function formatTime(sec: number): string {
  const m = Math.floor(sec / 60);
  const s = Math.floor(sec % 60);
  return `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
}

/** Format bytes → readable string */
export function formatBytes(bytes: number): string {
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`;
  return `${(bytes / 1024 / 1024).toFixed(1)} MB`;
}

/** Assign simulated speakers to Whisper segments based on pause length */
export function assignSpeakers(
  rawSegments: Array<{ id: number; start: number; end: number; text: string }>
): TranscriptSegment[] {
  const PAUSE = 1.8; // seconds threshold for speaker change
  let speakerIdx = 0;
  let lastEnd = 0;

  return rawSegments.map((seg, i) => {
    if (i > 0 && seg.start - lastEnd > PAUSE) {
      speakerIdx = (speakerIdx + 1) % 5;
    }
    lastEnd = seg.end;
    return {
      id: seg.id,
      start: seg.start,
      end: seg.end,
      text: seg.text.trim(),
      speaker: `說話者 ${String.fromCharCode(65 + speakerIdx)}`,
      speakerIndex: speakerIdx,
    };
  });
}

/** Download a blob as a file */
export function downloadBlob(content: string, filename: string, mime: string) {
  const blob = new Blob([content], { type: mime });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

/** Build plain-text export */
export function buildTxt(
  segments: TranscriptSegment[],
  summary: string[]
): string {
  const transcript = segments
    .map((s) => `[${formatTime(s.start)}] ${s.speaker}\n${s.text}`)
    .join("\n\n");

  const summaryText = summary.join("\n");

  return `=== 逐字稿 ===\n\n${transcript}\n\n=== 重點摘要 ===\n\n${summaryText}`;
}

/** Build Word-compatible HTML */
export function buildDocHtml(
  segments: TranscriptSegment[],
  keyPoints: string[],
  actionItems: string[]
): string {
  const rows = segments
    .map(
      (s) =>
        `<tr><td style="color:#C4522A;font-weight:600;padding:4px 12px 4px 0;white-space:nowrap;vertical-align:top">${formatTime(s.start)}&nbsp;${s.speaker}</td><td style="padding:4px 0">${s.text}</td></tr>`
    )
    .join("");

  const points = keyPoints
    .map((p) => `<li style="margin:6px 0">${p}</li>`)
    .join("");
  const actions = actionItems
    .map((a) => `<li style="margin:6px 0">${a}</li>`)
    .join("");

  return `<html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:w="urn:schemas-microsoft-com:office:word"><head><meta charset="utf-8"/><title>VoiceScribe 報告</title><style>body{font-family:"微軟正黑體",Arial,sans-serif;font-size:11pt;line-height:1.7;margin:2.5cm}h1{font-size:18pt;color:#C4522A}h2{font-size:14pt;color:#3C2E28;margin-top:18pt}table{border-collapse:collapse;width:100%}</style></head><body><h1>VoiceScribe 逐字稿報告</h1><h2>逐字稿</h2><table>${rows}</table><h2>重點摘要</h2><ul>${points}</ul>${actions ? `<h2>行動事項</h2><ul>${actions}</ul>` : ""}</body></html>`;
}
