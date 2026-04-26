"use client";

import { useCallback, useRef, useState } from "react";
import { FFmpeg } from "@ffmpeg/ffmpeg";
import { fetchFile, toBlobURL } from "@ffmpeg/util";

interface Props {
  onFileReady: (file: File) => void;
  disabled?: boolean;
}

type UploadState = "idle" | "oversized" | "compressing" | "compressed" | "ready";

const FORMATS = ["MP3", "WAV", "M4A", "MP4"];
const ACCEPT = ".mp3,.wav,.m4a,.m4v,.mp4,.ogg,.webm,audio/*";
const MAX_BYTES = 4 * 1024 * 1024;

export default function TabUpload({ onFileReady, disabled }: Props) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [dragging, setDragging] = useState(false);
  const [uploadState, setUploadState] = useState<UploadState>("idle");
  const [originalFile, setOriginalFile] = useState<File | null>(null);
  const [compressedFile, setCompressedFile] = useState<File | null>(null);
  const [progress, setProgress] = useState(0);
  const ffmpegRef = useRef<FFmpeg | null>(null);

  const handleFile = useCallback(
    (file: File | null | undefined) => {
      if (!file || disabled) return;
      setOriginalFile(file);
      setCompressedFile(null);
      setProgress(0);
      if (file.size > MAX_BYTES) {
        setUploadState("oversized");
      } else {
        setUploadState("ready");
        onFileReady(file);
      }
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

  const handleCompress = useCallback(async () => {
    if (!originalFile) return;
    setUploadState("compressing");
    setProgress(0);

    try {
      if (!ffmpegRef.current) {
        ffmpegRef.current = new FFmpeg();
      }
      const ffmpeg = ffmpegRef.current;

      if (!ffmpeg.loaded) {
        const baseURL = "https://unpkg.com/@ffmpeg/core@0.12.6/dist/esm";
        await ffmpeg.load({
          coreURL: await toBlobURL(`${baseURL}/ffmpeg-core.js`, "text/javascript"),
          wasmURL: await toBlobURL(`${baseURL}/ffmpeg-core.wasm`, "application/wasm"),
        });
      }

      ffmpeg.on("progress", ({ progress: p }) => {
        setProgress(Math.round(p * 100));
      });

      const ext = originalFile.name.split(".").pop() ?? "bin";
      const inputName = `input.${ext}`;
      await ffmpeg.writeFile(inputName, await fetchFile(originalFile));
      await ffmpeg.exec([
        "-i", inputName,
        "-ac", "1",
        "-ar", "16000",
        "-b:a", "32k",
        "output.mp3",
      ]);

      const data = await ffmpeg.readFile("output.mp3");
      // readFile returns Uint8Array | string; copy to a plain ArrayBuffer for Blob compat
      const src = data instanceof Uint8Array ? data : new TextEncoder().encode(data as string);
      const plainBuffer = src.buffer.slice(src.byteOffset, src.byteOffset + src.byteLength) as ArrayBuffer;
      const blob = new Blob([plainBuffer], { type: "audio/mpeg" });
      const baseName = originalFile.name.replace(/\.[^.]+$/, "");
      const compressed = new File([blob], `${baseName}_compressed.mp3`, {
        type: "audio/mpeg",
      });

      // cleanup
      try { await ffmpeg.deleteFile(inputName); } catch { /* ignore */ }
      try { await ffmpeg.deleteFile("output.mp3"); } catch { /* ignore */ }

      setCompressedFile(compressed);
      setUploadState("compressed");
    } catch (err) {
      console.error("Compression failed:", err);
      alert("壓縮失敗，請重試或改用其他格式。");
      setUploadState("oversized");
    }
  }, [originalFile]);

  const handleUploadCompressed = useCallback(() => {
    if (!compressedFile) return;
    setUploadState("ready");
    onFileReady(compressedFile);
  }, [compressedFile, onFileReady]);

  const handleDownloadCompressed = useCallback(() => {
    if (!compressedFile) return;
    const url = URL.createObjectURL(compressedFile);
    const a = document.createElement("a");
    a.href = url;
    a.download = compressedFile.name;
    a.click();
    URL.revokeObjectURL(url);
  }, [compressedFile]);

  const handleReset = useCallback(() => {
    setUploadState("idle");
    setOriginalFile(null);
    setCompressedFile(null);
    setProgress(0);
    if (inputRef.current) inputRef.current.value = "";
  }, []);

  // ── Render helpers ─────────────────────────────────────────────────────────

  if (uploadState === "idle") {
    return (
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
        <div className="w-16 h-16 bg-warm-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
          <MusicIcon />
        </div>
        <p className="font-semibold text-warm-800 text-base">拖曳音檔或點擊上傳</p>
        <p className="text-sm text-warm-400 mt-1">支援 MP3、WAV、M4A、MP4 格式，最大 4 MB</p>
        <div className="flex justify-center gap-2 mt-4">
          {FORMATS.map((f) => (
            <span key={f} className="px-3 py-1 bg-primary-100 text-primary text-xs font-semibold rounded-full">
              {f}
            </span>
          ))}
        </div>
      </div>
    );
  }

  if (uploadState === "oversized" && originalFile) {
    const sizeMB = (originalFile.size / 1024 / 1024).toFixed(1);
    return (
      <div className="rounded-2xl border border-warm-200 bg-cream-50 p-6 flex flex-col gap-4">
        {/* File info */}
        <div className="flex items-center gap-3 p-3 bg-white rounded-xl border border-warm-100">
          <div className="w-10 h-10 bg-warm-100 rounded-lg flex items-center justify-center shrink-0">
            <MusicIcon />
          </div>
          <div className="flex-1 min-w-0">
            <p className="font-medium text-warm-800 truncate text-sm">{originalFile.name}</p>
            <p className="text-xs text-red-500 font-semibold">{sizeMB} MB — 超過 4 MB 上限</p>
          </div>
        </div>
        {/* Warning */}
        <div className="flex items-start gap-2 text-sm text-yellow-700 bg-yellow-50 border border-yellow-200 rounded-xl p-3">
          <span className="mt-0.5">⚠️</span>
          <p>此檔案超過伺服器上限，需先壓縮才能上傳。壓縮在瀏覽器本地執行，音檔不會離開你的裝置。</p>
        </div>
        {/* Buttons */}
        <button
          onClick={handleCompress}
          className="w-full py-3 rounded-xl bg-orange-500 hover:bg-orange-600 active:scale-95 text-white font-semibold transition-all"
        >
          壓縮檔案
        </button>
        <button onClick={handleReset} className="text-sm text-warm-400 hover:text-warm-600 text-center">
          重新選擇檔案
        </button>
      </div>
    );
  }

  if (uploadState === "compressing" && originalFile) {
    const sizeMB = (originalFile.size / 1024 / 1024).toFixed(1);
    return (
      <div className="rounded-2xl border border-warm-200 bg-cream-50 p-6 flex flex-col gap-4">
        {/* File info */}
        <div className="flex items-center gap-3 p-3 bg-white rounded-xl border border-warm-100">
          <div className="w-10 h-10 bg-warm-100 rounded-lg flex items-center justify-center shrink-0">
            <MusicIcon />
          </div>
          <div className="flex-1 min-w-0">
            <p className="font-medium text-warm-800 truncate text-sm">{originalFile.name}</p>
            <p className="text-xs text-warm-400">{sizeMB} MB</p>
          </div>
        </div>
        {/* Progress */}
        <div>
          <div className="flex justify-between text-xs text-warm-500 mb-1">
            <span>壓縮中…</span>
            <span>{progress}%</span>
          </div>
          <div className="h-3 bg-warm-100 rounded-full overflow-hidden">
            <div
              className="h-full bg-orange-400 rounded-full transition-all duration-300"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
        <p className="text-xs text-center text-warm-400">
          在瀏覽器本地處理，音檔不會離開你的裝置
        </p>
      </div>
    );
  }

  if (uploadState === "compressed" && originalFile && compressedFile) {
    const origMB = (originalFile.size / 1024 / 1024).toFixed(1);
    const compMB = (compressedFile.size / 1024 / 1024).toFixed(1);
    const saved = (((originalFile.size - compressedFile.size) / originalFile.size) * 100).toFixed(1);
    return (
      <div className="rounded-2xl border border-warm-200 bg-cream-50 p-6 flex flex-col gap-4">
        {/* Compression result */}
        <div className="bg-orange-50 border border-orange-200 rounded-xl p-4">
          <p className="text-xs font-semibold text-orange-700 mb-2">壓縮完成</p>
          <div className="flex items-center justify-between text-sm">
            <div className="text-center">
              <p className="text-warm-500 text-xs">原始大小</p>
              <p className="font-bold text-warm-800">{origMB} MB</p>
            </div>
            <span className="text-warm-300 text-lg">→</span>
            <div className="text-center">
              <p className="text-warm-500 text-xs">壓縮後</p>
              <p className="font-bold text-green-600">{compMB} MB</p>
            </div>
            <div className="text-center bg-green-100 rounded-lg px-3 py-1">
              <p className="text-xs text-green-700 font-semibold">節省 {saved}%</p>
            </div>
          </div>
        </div>
        {/* Upload button */}
        <button
          onClick={handleUploadCompressed}
          className="w-full py-3 rounded-xl bg-green-500 hover:bg-green-600 active:scale-95 text-white font-semibold transition-all"
        >
          一鍵上傳並開始 AI 轉錄
        </button>
        <div className="flex justify-between text-sm">
          <button onClick={handleDownloadCompressed} className="text-primary hover:underline">
            下載壓縮檔案
          </button>
          <button onClick={handleReset} className="text-warm-400 hover:text-warm-600">
            重新選擇
          </button>
        </div>
      </div>
    );
  }

  if (uploadState === "ready") {
    const file = compressedFile ?? originalFile;
    const isCompressed = !!compressedFile;
    return (
      <div className="rounded-2xl border border-green-200 bg-green-50 p-6 flex flex-col gap-3">
        <div className="flex items-center gap-2 text-green-700">
          <span className="text-lg">✓</span>
          <p className="font-semibold text-sm">
            {isCompressed ? "壓縮完成，已準備好上傳" : "檔案符合上限，已準備好上傳"}
          </p>
        </div>
        {file && (
          <div className="flex items-center gap-3 p-3 bg-white rounded-xl border border-green-100">
            <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center shrink-0">
              <MusicIcon />
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-medium text-warm-800 truncate text-sm">{file.name}</p>
              <p className="text-xs text-green-600">{(file.size / 1024 / 1024).toFixed(1)} MB</p>
            </div>
          </div>
        )}
        <button
          onClick={handleReset}
          className="text-sm text-warm-400 hover:text-warm-600 text-center"
        >
          重新選擇檔案
        </button>
      </div>
    );
  }

  return null;
}

function MusicIcon() {
  return (
    <svg className="w-7 h-7 text-warm-400" fill="currentColor" viewBox="0 0 24 24">
      <path d="M9 3v10.56c-.6-.35-1.27-.56-2-.56-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4V7h6V3H9z"/>
    </svg>
  );
}
