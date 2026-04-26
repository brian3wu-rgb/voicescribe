"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { formatTime } from "@/lib/utils";

interface Props {
  onFileReady: (file: File) => void;
  disabled?: boolean;
}

type RecordState = "idle" | "recording" | "done";

export default function TabRecord({ onFileReady, disabled }: Props) {
  const [state, setState] = useState<RecordState>("idle");
  const [elapsed, setElapsed] = useState(0);
  const mediaRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // cleanup on unmount
  useEffect(() => {
    return () => {
      timerRef.current && clearInterval(timerRef.current);
      mediaRef.current?.state === "recording" && mediaRef.current.stop();
    };
  }, []);

  const startRecording = useCallback(async () => {
    if (disabled) return;
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mr = new MediaRecorder(stream, { mimeType: "audio/webm" });
      chunksRef.current = [];

      mr.ondataavailable = (e) => {
        if (e.data.size > 0) chunksRef.current.push(e.data);
      };
      mr.onstop = () => {
        stream.getTracks().forEach((t) => t.stop());
        const blob = new Blob(chunksRef.current, { type: "audio/webm" });
        const file = new File([blob], `錄音_${Date.now()}.webm`, {
          type: "audio/webm",
        });
        onFileReady(file);
        setState("done");
      };

      mr.start(500);
      mediaRef.current = mr;
      setState("recording");
      setElapsed(0);
      timerRef.current = setInterval(() => setElapsed((v) => v + 1), 1000);
    } catch {
      alert("無法存取麥克風，請確認瀏覽器權限");
    }
  }, [disabled, onFileReady]);

  const stopRecording = useCallback(() => {
    timerRef.current && clearInterval(timerRef.current);
    mediaRef.current?.stop();
  }, []);

  return (
    <div className="flex flex-col items-center py-10 gap-6">
      {/* Mic button */}
      <div className="relative">
        {state === "recording" && (
          <>
            <div className="absolute inset-0 rounded-full bg-primary/20 ping-slow" />
            <div className="absolute inset-0 rounded-full bg-primary/10 ping-slow"
                 style={{ animationDelay: "0.6s" }} />
          </>
        )}
        <button
          onClick={state === "recording" ? stopRecording : startRecording}
          disabled={disabled || state === "done"}
          className={[
            "relative w-24 h-24 rounded-full flex items-center justify-center",
            "text-4xl transition-all duration-200 active:scale-95",
            "disabled:opacity-50 disabled:cursor-not-allowed",
            state === "recording"
              ? "bg-primary shadow-lg shadow-primary/30"
              : "bg-warm-100 hover:bg-warm-200",
          ].join(" ")}
        >
          {state === "recording" ? "⏹" : "🎤"}
        </button>
      </div>

      {/* Status text */}
      {state === "idle" && (
        <div className="text-center">
          <p className="font-medium text-warm-700">點擊麥克風開始錄音</p>
          <p className="text-sm text-warm-400 mt-1">支援多人對話，自動識別說話者</p>
        </div>
      )}
      {state === "recording" && (
        <div className="text-center">
          <div className="flex items-center gap-1 justify-center mb-1">
            {[1,2,3,4,5].map((i) => (
              <span
                key={i}
                className="wave-bar h-5 bg-primary"
                style={{ animationDelay: `${i * 0.15}s` }}
              />
            ))}
          </div>
          <p className="font-semibold text-primary text-lg font-mono">
            {formatTime(elapsed)}
          </p>
          <p className="text-sm text-warm-400 mt-1">點擊停止並轉錄</p>
        </div>
      )}
      {state === "done" && (
        <div className="text-center">
          <p className="font-medium text-warm-700">
            ✓ 錄音完成（{formatTime(elapsed)}）
          </p>
          <button
            onClick={() => { setState("idle"); setElapsed(0); }}
            className="text-sm text-primary hover:underline mt-1"
          >
            重新錄音
          </button>
        </div>
      )}
    </div>
  );
}
