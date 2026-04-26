"use client";

import { useState } from "react";
import type { AppResult } from "@/lib/types";
import { buildTxt, downloadBlob, buildDocHtml } from "@/lib/utils";

type Props = Pick<
  AppResult,
  | "keyPoints"
  | "actionItems"
  | "suggestions"
  | "segments"
  | "duration"
  | "speakerCount"
>;

export default function SummaryPanel({
  keyPoints,
  actionItems,
  suggestions,
  segments,
}: Props) {
  return (
    <div className="card flex flex-col h-full overflow-hidden">
      {/* Scrollable content — all sections visible at once */}
      <div className="flex-1 overflow-y-auto divide-y divide-warm-200/60">
        <MeetingSection
          title="待辦項目"
          items={actionItems}
          emptyMsg="尚無待辦項目"
          parseMode="speaker"
        />
        <MeetingSection
          title="重點記錄"
          items={keyPoints}
          emptyMsg="尚無重點記錄"
          parseMode="plain"
        />
        <MeetingSection
          title="建議行動"
          items={suggestions}
          emptyMsg="尚無建議行動"
          parseMode="bold"
        />
      </div>

      {/* Export toolbar */}
      <div className="border-t border-warm-200/60 px-5 py-3 flex items-center gap-2 flex-wrap shrink-0">
        <ExportBtn
          label="複製全部"
          icon="🗋"
          onClick={async () => {
            const all = [
              "【待辦項目】",
              ...actionItems,
              "",
              "【重點記錄】",
              ...keyPoints,
              "",
              "【建議行動】",
              ...suggestions,
            ].join("\n");
            await navigator.clipboard.writeText(all);
          }}
        />
        <ExportBtn
          label="PDF 報告"
          icon="🖨"
          onClick={() => {
            const win = window.open("", "_blank");
            if (!win) return;
            const section = (title: string, items: string[]) =>
              `<h3 style="color:#C4522A;margin-top:24px">${title}</h3><ul>${items.map((i) => `<li>${i}</li>`).join("")}</ul>`;
            win.document.write(
              `<!DOCTYPE html><html><head><meta charset="utf-8"><title>會議記錄</title><style>body{font-family:system-ui,sans-serif;max-width:720px;margin:40px auto;font-size:13pt;line-height:1.8;color:#333}li{margin:6px 0}@media print{body{margin:0}}</style></head><body><h2 style="color:#C4522A">AI 會議記錄摘要</h2>${section("待辦項目", actionItems)}${section("重點記錄", keyPoints)}${section("建議行動", suggestions)}</body></html>`
            );
            win.document.close();
            win.print();
          }}
        />
        <ExportBtn
          label="Word"
          icon="📝"
          onClick={() =>
            downloadBlob(
              buildDocHtml(segments, keyPoints, actionItems),
              "meeting_summary.doc",
              "application/msword"
            )
          }
        />
      </div>
    </div>
  );
}

// ── Section component ──────────────────────────────────────────────────────────

function MeetingSection({
  title,
  items,
  emptyMsg,
  parseMode,
}: {
  title: string;
  items: string[];
  emptyMsg: string;
  parseMode: "plain" | "speaker" | "bold";
}) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(items.join("\n"));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="px-5 py-5">
      {/* Section header */}
      <div className="flex items-center justify-between mb-4">
        <h4 className="text-[13px] font-bold text-warm-800 flex items-center gap-2">
          {title}
          {items.length > 0 && (
            <span className="text-[10px] px-2 py-0.5 rounded-full bg-cream-100 text-warm-500 font-medium">
              {items.length}
            </span>
          )}
        </h4>
        <button
          onClick={handleCopy}
          className="text-warm-400 hover:text-warm-600 transition-colors p-1 rounded"
          title="複製此區塊"
        >
          {copied ? (
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <polyline points="20 6 9 17 4 12" />
            </svg>
          ) : (
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <rect x="9" y="9" width="13" height="13" rx="2" /><path d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1" />
            </svg>
          )}
        </button>
      </div>

      {/* Items */}
      {items.length === 0 ? (
        <p className="text-sm text-warm-400">{emptyMsg}</p>
      ) : (
        <ul className="space-y-3">
          {items.map((item, i) => (
            <li key={i} className="flex gap-3">
              <div className="w-1.5 h-1.5 rounded-full bg-primary/40 mt-[7px] shrink-0" />
              <p className="text-sm text-warm-700 leading-relaxed">
                {parseMode === "speaker" ? <SpeakerItem text={item} /> : null}
                {parseMode === "bold" ? <BoldItem text={item} /> : null}
                {parseMode === "plain" ? item.replace(/^[•\-]\s*/, "") : null}
              </p>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

function SpeakerItem({ text }: { text: string }) {
  const colonIdx = text.indexOf("：");
  if (colonIdx === -1) return <>{text}</>;
  return (
    <>
      <strong className="text-warm-800">{text.slice(0, colonIdx + 1)}</strong>
      {text.slice(colonIdx + 1)}
    </>
  );
}

function BoldItem({ text }: { text: string }) {
  const match = text.match(/^\*\*(.+?)\*\*[：:]\s*(.*)/s);
  if (!match) return <>{text}</>;
  return (
    <>
      <strong className="text-warm-800">{match[1]}：</strong>
      {match[2]}
    </>
  );
}

function ExportBtn({ label, icon, onClick }: { label: string; icon: string; onClick: () => void }) {
  return (
    <button onClick={onClick} className="export-btn">
      {icon} {label}
    </button>
  );
}
