"use client";

import { useMemo, useState } from "react";
import type { TranscriptSegment } from "@/lib/types";
import { SPEAKER_STYLES } from "@/lib/types";
import { formatTime, buildTxt, buildDocHtml, downloadBlob } from "@/lib/utils";

interface Props {
  segments: TranscriptSegment[];
  keyPoints: string[];
}

export default function TranscriptPanel({ segments, keyPoints }: Props) {
  const [query, setQuery] = useState("");
  const [copied, setCopied] = useState(false);

  const filtered = useMemo(() => {
    if (!query.trim()) return segments;
    const q = query.toLowerCase();
    return segments.filter((s) => s.text.toLowerCase().includes(q));
  }, [segments, query]);

  const fullText = useMemo(
    () => segments.map((s) => `[${formatTime(s.start)}] ${s.speaker}: ${s.text}`).join("\n"),
    [segments]
  );

  const handleCopy = async () => {
    await navigator.clipboard.writeText(fullText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="card flex flex-col h-full overflow-hidden">
      {/* Header */}
      <div className="flex items-center gap-3 px-5 py-4 border-b border-warm-200/60">
        <span className="text-lg">🗒</span>
        <h2 className="font-semibold text-warm-800 text-[15px]">逐字稿</h2>
        {/* Search */}
        <div className="ml-auto flex items-center gap-2 bg-cream-100 border border-warm-200
                        rounded-xl px-3 py-1.5 flex-1 max-w-xs">
          <SearchIcon />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="搜尋逐字稿…"
            className="bg-transparent text-sm text-warm-700 placeholder-warm-300
                       focus:outline-none w-full"
          />
          {query && (
            <button onClick={() => setQuery("")} className="text-warm-400 hover:text-warm-600">
              ×
            </button>
          )}
        </div>
      </div>

      {/* Segments */}
      <div className="flex-1 overflow-y-auto px-5 py-4 space-y-4">
        {filtered.length === 0 ? (
          <p className="text-center text-warm-400 py-10 text-sm">
            {query ? "沒有符合的內容" : "逐字稿將顯示於此"}
          </p>
        ) : (
          filtered.map((seg) => {
            const style = SPEAKER_STYLES[seg.speakerIndex % SPEAKER_STYLES.length];
            const highlight = query && seg.text.toLowerCase().includes(query.toLowerCase());
            return (
              <div key={seg.id} className="flex gap-3">
                {/* Timestamp */}
                <span className="text-xs text-warm-400 font-mono mt-1 shrink-0 w-10">
                  {formatTime(seg.start)}
                </span>
                {/* Bubble */}
                <div className="flex-1">
                  <p className={`text-xs font-semibold mb-1 ${style.name}`}>
                    {seg.speaker}
                  </p>
                  <div className={`${style.bubble} rounded-xl rounded-tl-sm px-4 py-3`}>
                    <p className={`text-sm text-warm-800 leading-relaxed ${
                      highlight ? "bg-yellow-100 rounded" : ""
                    }`}>
                      {highlight
                        ? highlightText(seg.text, query)
                        : seg.text}
                    </p>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Export toolbar */}
      <div className="border-t border-warm-200/60 px-5 py-3 flex items-center gap-2 flex-wrap">
        <button
          onClick={handleCopy}
          className="export-btn"
        >
          {copied ? "✓ 已複製" : "🗋 複製"}
        </button>
        <button
          onClick={() =>
            downloadBlob(
              buildTxt(segments, keyPoints),
              "voicescribe_transcript.txt",
              "text/plain;charset=utf-8"
            )
          }
          className="export-btn"
        >
          ↓ TXT
        </button>
        <button
          onClick={() => {
            const win = window.open("", "_blank");
            if (!win) return;
            win.document.write(buildPrintHtml(segments));
            win.document.close();
            win.print();
          }}
          className="export-btn"
        >
          🖨 PDF
        </button>
        <button
          onClick={() =>
            downloadBlob(
              buildDocHtml(segments, keyPoints, []),
              "voicescribe_transcript.doc",
              "application/msword"
            )
          }
          className="export-btn"
        >
          📝 Word
        </button>
        <button
          onClick={() => {
            navigator.clipboard.writeText(fullText);
            alert("已複製到剪貼板，請貼至 Notion 頁面");
          }}
          className="export-btn"
        >
          <NotionIcon /> Notion
        </button>
        <button
          onClick={() => {
            navigator.clipboard.writeText(fullText);
            alert("已複製到剪貼板，請貼至 Google Docs");
          }}
          className="export-btn"
        >
          📄 Google Docs
        </button>
      </div>
    </div>
  );
}

// ── helpers ──────────────────────────────────────────────────────────────────

function highlightText(text: string, query: string) {
  const parts = text.split(new RegExp(`(${query})`, "gi"));
  return (
    <>
      {parts.map((part, i) =>
        part.toLowerCase() === query.toLowerCase() ? (
          <mark key={i} className="bg-yellow-200 rounded px-0.5">
            {part}
          </mark>
        ) : (
          part
        )
      )}
    </>
  );
}

function buildPrintHtml(segments: TranscriptSegment[]): string {
  const rows = segments
    .map(
      (s) =>
        `<div style="margin:12px 0"><span style="color:#C4522A;font-weight:600;font-size:12px">[${formatTime(s.start)}] ${s.speaker}</span><p style="margin:4px 0 0;line-height:1.7">${s.text}</p></div>`
    )
    .join("");
  return `<!DOCTYPE html><html><head><meta charset="utf-8"><title>VoiceScribe 逐字稿</title><style>body{font-family:system-ui,sans-serif;max-width:720px;margin:40px auto;font-size:13pt;color:#333}@media print{body{margin:0}}</style></head><body><h2 style="color:#C4522A">VoiceScribe 逐字稿</h2>${rows}</body></html>`;
}

function SearchIcon() {
  return (
    <svg className="w-4 h-4 text-warm-300 shrink-0" fill="none" stroke="currentColor"
         strokeWidth={2} viewBox="0 0 24 24">
      <circle cx="11" cy="11" r="8"/><path strokeLinecap="round" d="M21 21l-4.35-4.35"/>
    </svg>
  );
}

function NotionIcon() {
  return (
    <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="currentColor">
      <path d="M4.459 4.208c.746.606 1.026.56 2.428.466l13.215-.793c.28 0 .047-.28-.046-.326L17.86 1.968c-.42-.326-.981-.7-2.055-.607L3.01 2.295c-.466.046-.56.28-.374.466l1.823 1.447zm.793 3.08v13.904c0 .747.373 1.027 1.214.98l14.523-.84c.841-.046.935-.56.935-1.167V6.354c0-.606-.233-.933-.748-.887l-15.177.887c-.56.047-.747.327-.747.933zm14.337.745c.093.42 0 .84-.42.888l-.7.14v10.264c-.608.327-1.168.514-1.635.514-.748 0-.935-.234-1.495-.933l-4.577-7.186v6.952L12.21 19s0 .84-1.168.84l-3.222.186c-.093-.186 0-.653.327-.746l.84-.233V9.854L7.822 9.76c-.094-.42.14-1.026.793-1.073l3.456-.233 4.764 7.279v-6.44l-1.215-.14c-.093-.514.28-.887.747-.933l3.222-.187z"/>
    </svg>
  );
}
