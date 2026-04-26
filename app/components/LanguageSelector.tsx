"use client";

import { useState } from "react";
import { LANG_OPTIONS, type Language } from "@/lib/types";

interface Props {
  value: Language;
  onChange: (v: Language) => void;
}

export default function LanguageSelector({ value, onChange }: Props) {
  const [open, setOpen] = useState(true);

  return (
    <div className="mt-5">
      <button
        className="flex items-center gap-1.5 text-sm font-medium text-warm-600
                   hover:text-warm-800 transition-colors"
        onClick={() => setOpen((v) => !v)}
      >
        <span className={`transition-transform duration-200 ${open ? "rotate-0" : "-rotate-90"}`}>
          ∨
        </span>
        語言設定
      </button>

      {open && (
        <div className="flex gap-2.5 mt-3">
          {LANG_OPTIONS.map((opt) => (
            <button
              key={opt.value}
              onClick={() => onChange(opt.value)}
              className={[
                "flex items-center gap-2 px-4 py-2 rounded-xl border text-sm font-medium transition-all",
                value === opt.value
                  ? "border-primary bg-primary-50 text-primary"
                  : "border-warm-200 bg-white text-warm-600 hover:border-warm-300 hover:text-warm-800",
              ].join(" ")}
            >
              <span>{opt.flag}</span>
              <span>{opt.label}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
