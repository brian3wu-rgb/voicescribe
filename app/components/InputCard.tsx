"use client";

import { useState } from "react";
import type { InputTab, Language } from "@/lib/types";
import TabUpload from "./TabUpload";
import TabRecord from "./TabRecord";
import TabUrl from "./TabUrl";
import LanguageSelector from "./LanguageSelector";

interface Props {
  onStart: (file: File, language: Language) => void;
  disabled?: boolean;
}

const TABS: { id: InputTab; icon: string; label: string }[] = [
  { id: "upload", icon: "🗂", label: "上傳檔案" },
  { id: "record", icon: "✏️", label: "即時錄音" },
  { id: "url",    icon: "🔗", label: "貼上連結" },
];

export default function InputCard({ onStart, disabled }: Props) {
  const [activeTab, setActiveTab] = useState<InputTab>("upload");
  const [language, setLanguage] = useState<Language>("zh");
  const [pendingFile, setPendingFile] = useState<File | null>(null);

  const handleFileReady = (file: File) => {
    setPendingFile(file);
  };

  const handleStart = () => {
    if (!pendingFile) return;
    onStart(pendingFile, language);
  };

  return (
    <div className="card p-6 w-full max-w-2xl mx-auto shadow-card-lg">
      {/* Tab bar */}
      <div className="flex gap-1 bg-cream-200 rounded-xl p-1 mb-6">
        {TABS.map((tab) => (
          <button
            key={tab.id}
            onClick={() => { setActiveTab(tab.id); setPendingFile(null); }}
            disabled={disabled}
            className={[
              "tab-btn flex-1",
              activeTab === tab.id ? "tab-btn-active" : "tab-btn-inactive",
            ].join(" ")}
          >
            <span>{tab.icon}</span>
            <span>{tab.label}</span>
          </button>
        ))}
      </div>

      {/* Tab content */}
      {activeTab === "upload" && (
        <TabUpload onFileReady={handleFileReady} disabled={disabled} />
      )}
      {activeTab === "record" && (
        <TabRecord onFileReady={handleFileReady} disabled={disabled} />
      )}
      {activeTab === "url" && (
        <TabUrl onFileReady={handleFileReady} disabled={disabled} />
      )}

      {/* Divider */}
      <div className="border-t border-warm-200/80 mt-6" />

      {/* Language + CTA */}
      <LanguageSelector value={language} onChange={setLanguage} />

      {/* Only show CTA for upload/record tabs */}
      {activeTab !== "url" && (
        <button
          onClick={handleStart}
          disabled={!pendingFile || disabled}
          className="btn-primary w-full mt-5 py-3.5 text-base"
        >
          <span className="text-yellow-300">✦</span>
          開始 AI 轉錄
        </button>
      )}
    </div>
  );
}
