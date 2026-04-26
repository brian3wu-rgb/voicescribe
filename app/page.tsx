"use client";

import { useState } from "react";
import type { AppResult, AppStage, Language } from "@/lib/types";
import Header from "./components/Header";
import InputCard from "./components/InputCard";
import ProcessingView, { type ProcessStep } from "./components/ProcessingView";
import ResultView from "./components/ResultView";

export default function Home() {
  const [stage, setStage] = useState<AppStage>("input");
  const [processStep, setProcessStep] = useState<ProcessStep>("transcribe");
  const [result, setResult] = useState<AppResult | null>(null);
  const [shareUrl, setShareUrl] = useState("");
  const [error, setError] = useState("");
  const [processingFile, setProcessingFile] = useState("");

  const handleStart = async (file: File, language: Language) => {
    setError("");
    setStage("processing");
    setProcessingFile(file.name);
    setProcessStep("transcribe");

    try {
      // ── Step 1: Transcribe ─────────────────────────────────────────────────
      const formData = new FormData();
      formData.append("audio", file);
      formData.append("language", language);

      const transcribeRes = await fetch("/api/transcribe", {
        method: "POST",
        body: formData,
      });
      const transcribeData = await transcribeRes.json();

      if (!transcribeRes.ok) {
        throw new Error(transcribeData.error ?? "語音轉文字失敗");
      }

      const { segments, fullText, duration, language: detectedLang, speakerCount } =
        transcribeData;

      // ── Step 2: Summarize ──────────────────────────────────────────────────
      setProcessStep("summarize");

      const summarizeRes = await fetch("/api/summarize", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: fullText }),
      });
      const summarizeData = await summarizeRes.json();

      if (!summarizeRes.ok) {
        throw new Error(summarizeData.error ?? "摘要生成失敗");
      }

      setProcessStep("done");

      const appResult: AppResult = {
        fileName: file.name,
        fileSize: file.size,
        duration,
        language: detectedLang,
        speakerCount,
        segments,
        fullText,
        keyPoints: summarizeData.keyPoints ?? [],
        actionItems: summarizeData.actionItems ?? [],
        suggestions: summarizeData.suggestions ?? [],
      };

      setResult(appResult);

      // Save result and generate shareable URL
      try {
        const saveRes = await fetch("/api/save-result", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(appResult),
        });
        const saveData = await saveRes.json();
        if (saveData.id) {
          setShareUrl(`${window.location.origin}/result/${saveData.id}`);
        }
      } catch {
        // Share URL is optional — silently ignore save errors
      }

      setStage("result");
    } catch (err) {
      const msg = err instanceof Error ? err.message : "發生未知錯誤";
      setError(msg);
      setStage("input");
    }
  };

  const handleReset = () => {
    setStage("input");
    setResult(null);
    setShareUrl("");
    setError("");
  };

  return (
    <div className="min-h-screen bg-cream">
      <Header
        showNewBtn={stage === "result"}
        onNew={handleReset}
      />

      <main className="max-w-7xl mx-auto px-4 py-8">
        {/* ── Input stage ── */}
        {stage === "input" && (
          <div className="animate-fade-in">
            {/* Hero */}
            <div className="text-center mb-8">
              <h1 className="text-4xl font-bold text-warm-800 mb-3 tracking-tight">
                AI 會議記錄小幫手
              </h1>
              <p className="text-warm-400 text-[15px]">
                上傳會議錄音或錄影檔案，AI 自動生成逐字稿、待辦項目與重點摘要
              </p>
            </div>

            {/* Error banner */}
            {error && (
              <div className="max-w-2xl mx-auto mb-4 px-4 py-3 bg-red-50 border border-red-200
                              rounded-2xl text-red-600 text-sm flex items-start gap-2">
                <span>⚠️</span>
                <p>{error}</p>
              </div>
            )}

            <InputCard onStart={handleStart} disabled={false} />
          </div>
        )}

        {/* ── Processing stage ── */}
        {stage === "processing" && (
          <div className="flex items-center justify-center min-h-[60vh] animate-fade-in">
            <ProcessingView step={processStep} fileName={processingFile} />
          </div>
        )}

        {/* ── Result stage ── */}
        {stage === "result" && result && (
          <ResultView result={result} shareUrl={shareUrl} />
        )}
      </main>
    </div>
  );
}
