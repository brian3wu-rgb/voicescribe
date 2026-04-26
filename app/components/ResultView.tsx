"use client";

import { useState } from "react";
import type { AppResult } from "@/lib/types";
import { LANG_OPTIONS } from "@/lib/types";
import { formatTime, formatBytes } from "@/lib/utils";
import TranscriptPanel from "./TranscriptPanel";
import SummaryPanel from "./SummaryPanel";

interface Props {
  result: AppResult;
  shareUrl?: string;
}

export default function ResultView({ result, shareUrl }: Props) {
  const langLabel =
    LANG_OPTIONS.find(
      (l) => l.whisper === result.language || l.value === result.language
    )?.label ?? result.language;

  const langFlag =
    LANG_OPTIONS.find(
      (l) => l.whisper === result.language || l.value === result.language
    )?.flag ?? "🌐";

  return (
    <div className="animate-slide-up">
      {/* Share URL banner */}
      {shareUrl && <ShareBanner url={shareUrl} />}

      {/* Meta bar */}
      <div className="flex flex-wrap items-center gap-2 mb-4 px-1">
        <MetaTag icon="🎵" label={result.fileName} />
        <MetaTag icon="⏱" label={formatTime(result.duration)} />
        {result.speakerCount > 1 && (
          <MetaTag icon="👥" label={`${result.speakerCount} 位說話者`} />
        )}
        <MetaTag icon={langFlag} label={langLabel} />
        <MetaTag icon="📁" label={formatBytes(result.fileSize)} />
      </div>

      {/* Two-column layout */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 h-[calc(100vh-220px)] min-h-[540px]">
        <TranscriptPanel segments={result.segments} keyPoints={result.keyPoints} />
        <SummaryPanel
          keyPoints={result.keyPoints}
          actionItems={result.actionItems}
          suggestions={result.suggestions}
          segments={result.segments}
          duration={result.duration}
          speakerCount={result.speakerCount}
        />
      </div>
    </div>
  );
}

function ShareBanner({ url }: { url: string }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  return (
    <div className="flex items-center gap-4 mb-4 px-5 py-3.5 rounded-2xl flex-wrap
                    bg-gradient-to-r from-primary-50 to-[#FDE8DD]
                    border border-primary/20">
      <span className="text-xl">🔗</span>
      <div className="flex-1 min-w-0">
        <p className="text-[11px] font-bold text-warm-500 uppercase tracking-wide mb-1">
          分享連結 — 任何人皆可透過此網址查看會議記錄
        </p>
        <span className="text-[13px] text-primary font-mono bg-primary/8 px-2.5 py-1
                         rounded-lg inline-block max-w-full truncate">
          {url}
        </span>
      </div>
      <button
        onClick={handleCopy}
        className="shrink-0 bg-primary hover:bg-primary-hover text-white
                   text-[13px] font-semibold px-4 py-2 rounded-xl transition-all active:scale-95"
      >
        {copied ? "✓ 已複製" : "📋 複製連結"}
      </button>
    </div>
  );
}

function MetaTag({ icon, label }: { icon: string; label: string }) {
  return (
    <div className="flex items-center gap-1.5 px-3 py-1.5 bg-white border border-warm-200
                    rounded-full text-sm text-warm-600 shadow-sm">
      <span className="text-base leading-none">{icon}</span>
      <span className="font-medium truncate max-w-[200px]">{label}</span>
    </div>
  );
}
