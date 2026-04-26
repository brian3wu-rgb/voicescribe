"use client";

import { useState } from "react";

interface Props {
  onFileReady: (file: File) => void;
  disabled?: boolean;
}

export default function TabUrl({ onFileReady, disabled }: Props) {
  const [audioUrl, setAudioUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleFetch = async () => {
    if (!audioUrl.trim()) return;
    setError("");
    setLoading(true);
    try {
      const res = await fetch(
        `/api/fetch-url?url=${encodeURIComponent(audioUrl.trim())}`
      );
      if (!res.ok) {
        const j = await res.json();
        throw new Error(j.error ?? "無法下載音檔");
      }
      const blob = await res.blob();
      const ext = audioUrl.split("?")[0].split(".").pop() ?? "mp3";
      const file = new File([blob], `audio.${ext}`, { type: blob.type });
      onFileReady(file);
    } catch (e) {
      setError(e instanceof Error ? e.message : "下載失敗");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="py-6 flex flex-col gap-5">
      <div className="space-y-2">
        <label className="text-sm font-medium text-warm-600">
          直接貼上音訊網址
        </label>
        <input
          type="url"
          value={audioUrl}
          onChange={(e) => setAudioUrl(e.target.value)}
          placeholder="https://example.com/audio.mp3"
          className="input-base"
          disabled={disabled || loading}
          onKeyDown={(e) => e.key === "Enter" && handleFetch()}
        />
        <p className="text-xs text-warm-400">
          支援 MP3、WAV、M4A 直連網址。YouTube 需下載後上傳。
        </p>
      </div>

      {error && (
        <p className="text-sm text-red-500 bg-red-50 border border-red-200 rounded-xl px-4 py-2.5">
          ⚠️ {error}
        </p>
      )}

      <button
        onClick={handleFetch}
        disabled={!audioUrl.trim() || disabled || loading}
        className="btn-primary self-start"
      >
        {loading ? (
          <>
            <Spinner />
            下載中…
          </>
        ) : (
          "▶ 開始轉錄"
        )}
      </button>
    </div>
  );
}

function Spinner() {
  return (
    <div className="w-4 h-4 rounded-full border-2 border-white/30 border-t-white animate-spin" />
  );
}
