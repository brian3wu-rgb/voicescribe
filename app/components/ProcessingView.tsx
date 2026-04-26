"use client";

export type ProcessStep = "transcribe" | "summarize" | "done";

interface Props {
  step: ProcessStep;
  fileName: string;
}

const STEPS = [
  { id: "transcribe", label: "AI 語音辨識中", sub: "呼叫 OpenAI Whisper…" },
  { id: "summarize",  label: "生成摘要與分析", sub: "呼叫 Claude Opus…" },
  { id: "done",       label: "完成",           sub: "" },
];

export default function ProcessingView({ step, fileName }: Props) {
  const activeIdx = STEPS.findIndex((s) => s.id === step);

  return (
    <div className="card max-w-md mx-auto p-10 text-center shadow-card-lg animate-scale-in">
      {/* Animated logo */}
      <div className="flex justify-center items-end gap-1 h-12 mb-8">
        {[0,1,2,3,4].map((i) => (
          <span
            key={i}
            className="wave-bar bg-primary rounded-full"
            style={{
              height: `${[20,32,44,32,20][i]}px`,
              animationDelay: `${i * 0.15}s`,
            }}
          />
        ))}
      </div>

      <h2 className="text-lg font-semibold text-warm-800 mb-1">
        {STEPS[activeIdx]?.label}
      </h2>
      <p className="text-sm text-warm-400 mb-8">{fileName}</p>

      {/* Step list */}
      <div className="text-left space-y-3">
        {STEPS.filter((s) => s.id !== "done").map((s, i) => {
          const isDone = i < activeIdx;
          const isActive = i === activeIdx;
          return (
            <div key={s.id} className="flex items-center gap-3">
              <div className={[
                "w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold shrink-0",
                isDone  ? "bg-green-100 text-green-600" :
                isActive ? "bg-primary-100 text-primary" :
                           "bg-warm-100 text-warm-400"
              ].join(" ")}>
                {isDone ? "✓" : i + 1}
              </div>
              <div>
                <p className={`text-sm font-medium ${isActive ? "text-warm-800" : isDone ? "text-warm-500" : "text-warm-300"}`}>
                  {s.label}
                </p>
                {isActive && s.sub && (
                  <p className="text-xs text-warm-400">{s.sub}</p>
                )}
              </div>
              {isActive && (
                <div className="ml-auto w-4 h-4 rounded-full border-2 border-primary/30
                                border-t-primary animate-spin" />
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
