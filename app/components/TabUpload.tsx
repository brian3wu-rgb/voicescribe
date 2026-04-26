"use client";

import { useCallback, useRef, useState } from "react";

interface Props {
  onFileReady: (file: File) => void;
  disabled?: boolean;
}

const FORMATS = ["MP3", "WAV", "M4A", "MP4"];
const ACCEPT = ".mp3,.wav,.m4a,.m4v,.mp4,.ogg,.webm,audio/*";

export default function TabUpload({ onFileReady, disabled }: Props) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [dragging, setDragging] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  const handleFile = useCallback(
    (file: File | null | undefined) => {
      if (!file || disabled) return;
      setSelectedFile(file);
      onFileReady(file);
    },
    [disabled, onFileReady]
  );

  const onDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setDragging(false);
      handleFile(e.dataTransfer.files[0]);
    },
    [handleFile]
  );

  return (
    <div className="flex flex-col gap-0">
      {/* Drop zone */}
      <div
        onClick={() => !disabled && inputRef.current?.click()}
        onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
        onDragLeave={() => setDragging(false)}
        onDrop={onDrop}
        className={[
          "relative border-2 border-dashed rounded-2xl p-10 text-center",
          "transition-all duration-200 cursor-pointer select-none",
          dragging
            ? "border-primary bg-primary-50"
            : "border-warm-200 hover:border-warm-300 bg-cream-50",
          disabled ? "pointer-events-none opacity-60" : "",
        ].join(" ")}
      >
        <input
          ref={inputRef}
          type="file"
          accept={ACCEPT}
          className="hidden"
          onChange={(e) => handleFile(e.target.files?.[0])}
          disabled={disabled}
        />

        {/* Music note icon */}
        <div className="w-16 h-16 bg-warm-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
          <MusicIcon />
        </div>

        {selectedFile ? (
          <div className="space-y-1">
            <p className="font-semibold text-warm-800">{selectedFile.name}</p>
            <p className="text-sm text-warm-500">
              {(selectedFile.size / 1024 / 1024).toFixed(1)} MB
            </p>
          </div>
        ) : (
          <div className="space-y-2">
            <p className="font-semibold text-warm-800 text-base">
              拖曳音檔或點擊上傳
            </p>
            <p className="text-sm text-warm-400">
              支援 MP3、WAV、M4A、MP4 格式，最大 25MB
            </p>
          </div>
        )}

        {/* Format badges */}
        <div className="flex justify-center gap-2 mt-4">
          {FORMATS.map((f) => (
            <span
              key={f}
              className="px-3 py-1 bg-primary-100 text-primary text-xs font-semibold rounded-full"
            >
              {f}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}

function MusicIcon() {
  return (
    <svg className="w-7 h-7 text-warm-400" fill="currentColor" viewBox="0 0 24 24">
      <path d="M9 3v10.56c-.6-.35-1.27-.56-2-.56-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4V7h6V3H9z"/>
    </svg>
  );
}
